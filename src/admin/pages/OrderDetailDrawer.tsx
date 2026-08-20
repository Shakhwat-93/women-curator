import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Phone,
  MapPin,
  Printer,
  Copy,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Check,
  Send,
  ExternalLink,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { useAdminToast } from '../context/AdminToastContext';
import { steadfastService } from '../../lib/steadfast';

interface OrderDetailDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  onOrderUpdated?: () => void;
}

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  order: initialOrder,
  isOpen,
  onClose,
  onUpdateStatus,
  onOrderUpdated
}) => {
  const [order, setOrder] = useState<Order | null>(initialOrder);
  const [isSendingToCourier, setIsSendingToCourier] = useState(false);
  const [isCheckingCourierStatus, setIsCheckingCourierStatus] = useState(false);
  const [showCourierCustomizer, setShowCourierCustomizer] = useState(false);
  const [courierNote, setCourierNote] = useState('');
  const [courierDeliveryType, setCourierDeliveryType] = useState<number>(0);
  const [courierCod, setCourierCod] = useState<number>(0);

  const { success, error, info } = useAdminToast();

  React.useEffect(() => {
    setOrder(initialOrder);
    if (initialOrder) {
      const isCod = initialOrder.payment_method?.toLowerCase().includes('cash') || !initialOrder.payment_method;
      setCourierCod(isCod ? Number(initialOrder.total) || 0 : 0);
      setCourierNote(initialOrder.notes || 'Please handle with care. Women Curator parcel.');
    }
  }, [initialOrder]);

  if (!order || !isOpen) return null;

  const statuses: { key: OrderStatus; label: string; icon: any }[] = [
    { key: 'pending', label: 'Placed', icon: Clock },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
    { key: 'processing', label: 'Packaging', icon: Package },
    { key: 'shipped', label: 'Courier', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: Check }
  ];

  const currentIdx = statuses.findIndex(s => s.key === order.status);

  const copyOrderDetails = () => {
    const text = `
WOMEN CURATOR — ORDER DETAILS
Order Number: ${order.order_number}
Customer: ${order.customer_name}
Phone: ${order.phone}
Address: ${order.address}, ${order.area ? order.area + ', ' : ''}${order.city}
Total Amount: ৳${order.total} (${order.payment_method})
Items:
${order.items?.map(it => `- ${it.product_name} (${it.color_name}, ${it.size}) × ${it.quantity} = ৳${it.subtotal}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    success('Order details copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendToSteadfast = async () => {
    setIsSendingToCourier(true);
    try {
      const res = await steadfastService.sendOrder(order, {
        note: courierNote,
        deliveryType: courierDeliveryType,
        customCod: courierCod
      });

      if (res.success && res.consignment) {
        success(`Consignment created on Steadfast! Tracking Code: ${res.trackingCode}`);
        setOrder(prev =>
          prev
            ? {
                ...prev,
                courier_provider: 'steadfast',
                courier_consignment_id: res.consignment!.consignment_id,
                courier_tracking_code: res.consignment!.tracking_code,
                courier_status: res.consignment!.status || 'in_review',
                status: 'shipped'
              }
            : null
        );
        setShowCourierCustomizer(false);
        if (onOrderUpdated) onOrderUpdated();
      } else {
        error(res.error || 'Failed to dispatch order to Steadfast Courier');
      }
    } catch (e: any) {
      error(e.message || 'Error connecting to Steadfast');
    } finally {
      setIsSendingToCourier(false);
    }
  };

  const handleRefreshCourierStatus = async () => {
    if (!order.courier_tracking_code) return;
    setIsCheckingCourierStatus(true);
    try {
      const res = await steadfastService.checkDeliveryStatus(order.courier_tracking_code);
      if (res.success && res.status) {
        info(`Steadfast Status: ${res.status}`);
        setOrder(prev => (prev ? { ...prev, courier_status: res.status } : null));
        if (onOrderUpdated) onOrderUpdated();
      } else {
        error(res.error || 'Could not fetch live status');
      }
    } catch {
      error('Failed to check courier status');
    } finally {
      setIsCheckingCourierStatus(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-curator-charcoal/60 backdrop-blur-xs transition-opacity"
        />

        {/* Drawer Window (Bottom sheet on mobile, slide-over on desktop) */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative w-full max-w-lg bg-[#FAF5EE] h-full shadow-2xl z-10 flex flex-col overflow-hidden border-l border-curator-border"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 bg-white border-b border-curator-border flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-base sm:text-lg font-bold text-curator-charcoal">
                {order.order_number}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                  order.status === 'delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.status === 'confirmed' || order.status === 'processing'
                    ? 'bg-blue-100 text-blue-800'
                    : order.status === 'shipped'
                    ? 'bg-purple-100 text-purple-800'
                    : order.status === 'cancelled'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {order.status}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={copyOrderDetails}
                title="Copy Details"
                className="p-2 rounded-full border border-curator-border hover:bg-curator-surface-peach text-curator-charcoal transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <Copy className="w-4 h-4 text-curator-coral" />
              </button>
              <button
                type="button"
                onClick={handlePrint}
                title="Print Invoice"
                className="p-2 rounded-full border border-curator-border hover:bg-curator-surface-peach text-curator-charcoal transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close drawer"
                className="p-2 rounded-full border border-curator-border hover:bg-rose-50 hover:text-rose-600 text-curator-charcoal transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* 5-Stage Status Stepper */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-curator-border shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-widest text-curator-muted font-mono uppercase">
                  Order Status Pipeline
                </span>
                <span className="text-xs font-serif font-bold text-curator-coral">
                  {statuses[currentIdx]?.label || order.status}
                </span>
              </div>

              {/* Progress Line */}
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {statuses.map((s, idx) => {
                  const Icon = s.icon;
                  const isPassed = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => onUpdateStatus(order.id || order.order_number, s.key)}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ${
                        isCurrent
                          ? 'bg-curator-coral text-white shadow-xs font-bold scale-[1.03]'
                          : isPassed
                          ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold'
                          : 'bg-[#FAF5EE] text-curator-muted hover:bg-curator-surface-peach'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-[9px] font-mono capitalize leading-tight truncate">
                        {s.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Cancel Shortcut */}
              <div className="pt-2 border-t border-curator-border/40 flex justify-end">
                <button
                  type="button"
                  onClick={() => onUpdateStatus(order.id || order.order_number, 'cancelled')}
                  className="text-[11px] font-bold text-rose-600 hover:underline min-h-[32px] flex items-center"
                >
                  Cancel Order
                </button>
              </div>
            </div>

            {/* STEADFAST COURIER INTEGRATION CARD */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-curator-border shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-curator-coral-light text-curator-coral flex items-center justify-center">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-curator-charcoal">
                      Steadfast Courier Delivery
                    </h4>
                    <span className="text-[10px] text-curator-muted font-mono block">
                      Automated Gateway Dispatch
                    </span>
                  </div>
                </div>

                {order.courier_tracking_code && (
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-mono text-[10px] font-bold uppercase">
                    {order.courier_status || 'Consigned'}
                  </span>
                )}
              </div>

              {order.courier_tracking_code ? (
                /* Already Dispatched State */
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-2xl bg-[#FAF5EE]/60 border border-curator-border/60">
                      <span className="text-[10px] text-curator-muted uppercase font-bold block">
                        Tracking Code
                      </span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="font-mono font-bold text-curator-coral text-sm">
                          {order.courier_tracking_code}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(order.courier_tracking_code || '');
                            success('Tracking code copied');
                          }}
                          className="text-curator-muted hover:text-curator-charcoal p-1"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#FAF5EE]/60 border border-curator-border/60">
                      <span className="text-[10px] text-curator-muted uppercase font-bold block">
                        Consignment ID
                      </span>
                      <span className="font-mono font-bold text-curator-charcoal text-sm mt-0.5 block">
                        #{order.courier_consignment_id || '—'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleRefreshCourierStatus}
                      disabled={isCheckingCourierStatus}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl border border-curator-border bg-white text-xs font-bold text-curator-charcoal hover:bg-curator-surface-peach transition-colors min-h-[40px]"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isCheckingCourierStatus ? 'animate-spin text-curator-coral' : ''}`} />
                      <span>{isCheckingCourierStatus ? 'Checking...' : 'Refresh Status'}</span>
                    </button>

                    <a
                      href={steadfastService.getTrackingUrl(order.courier_tracking_code)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-curator-charcoal text-white text-xs font-bold hover:bg-black transition-colors min-h-[40px]"
                    >
                      <span>Track Parcel</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ) : (
                /* Ready to Dispatch State */
                <div className="space-y-3 pt-2">
                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Parcel Not Dispatched to Courier</p>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        Click below to instantly create consignment with COD ৳{order.total} and generate live tracking code.
                      </p>
                    </div>
                  </div>

                  {showCourierCustomizer ? (
                    <div className="p-3.5 rounded-2xl bg-[#FAF5EE]/70 border border-curator-border space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-curator-charcoal uppercase mb-1">
                          COD Amount to Collect (৳)
                        </label>
                        <input
                          type="number"
                          value={courierCod}
                          onChange={e => setCourierCod(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-curator-border text-xs font-mono font-bold bg-white focus:outline-none focus:border-curator-coral"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-curator-charcoal uppercase mb-1">
                          Delivery Option
                        </label>
                        <select
                          value={courierDeliveryType}
                          onChange={e => setCourierDeliveryType(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-curator-border text-xs bg-white focus:outline-none"
                        >
                          <option value={0}>Home Delivery (0)</option>
                          <option value={1}>Point Delivery / Hub Pick Up (1)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-curator-charcoal uppercase mb-1">
                          Courier Instructions Note
                        </label>
                        <input
                          type="text"
                          value={courierNote}
                          onChange={e => setCourierNote(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-curator-border text-xs bg-white focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setShowCourierCustomizer(false)}
                          className="flex-1 py-2 rounded-xl border border-curator-border bg-white text-xs font-bold text-curator-charcoal"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSendToSteadfast}
                          disabled={isSendingToCourier}
                          className="flex-1 py-2 rounded-xl bg-curator-coral text-white text-xs font-bold shadow-md hover:bg-curator-coral-hover disabled:opacity-50 flex items-center justify-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSendingToCourier ? 'Dispatching...' : 'Dispatch Now'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSendToSteadfast}
                        disabled={isSendingToCourier}
                        className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-curator-coral text-white text-xs font-bold shadow-md hover:bg-curator-coral-hover active:scale-95 disabled:opacity-50 min-h-[44px]"
                      >
                        <Send className="w-4 h-4" />
                        <span>{isSendingToCourier ? 'Connecting to Steadfast...' : 'Send to Steadfast Courier'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowCourierCustomizer(true)}
                        className="px-3.5 py-3 rounded-2xl border border-curator-border bg-white text-xs font-bold text-curator-charcoal hover:bg-curator-surface-peach min-h-[44px]"
                        title="Edit COD or Courier instructions"
                      >
                        Options
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Customer & Destination Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-curator-border shadow-xs space-y-3">
              <span className="text-[10px] font-bold tracking-widest text-curator-muted font-mono uppercase block">
                Customer & Destination
              </span>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-serif text-base font-bold text-curator-charcoal">
                    {order.customer_name}
                  </h3>
                  <a
                    href={`tel:${order.phone}`}
                    className="inline-flex items-center gap-1 text-xs font-mono font-bold text-curator-coral hover:underline mt-0.5 min-h-[36px]"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{order.phone}</span>
                  </a>
                </div>

                <a
                  href={`tel:${order.phone}`}
                  className="px-3.5 py-2 rounded-full bg-curator-coral-light text-curator-coral text-xs font-bold hover:bg-curator-coral hover:text-white transition-colors flex items-center gap-1.5 min-h-[40px]"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              </div>

              <div className="pt-2 border-t border-curator-border/60 flex items-start gap-2.5 text-xs text-curator-charcoal">
                <MapPin className="w-4 h-4 text-curator-coral flex-shrink-0 mt-0.5" />
                <div>
                  <p className="leading-relaxed">{order.address}</p>
                  <p className="text-curator-muted font-mono text-[11px] mt-0.5">
                    {order.area ? `${order.area}, ` : ''}{order.city} {order.postal_code ? `• ${order.postal_code}` : ''}
                  </p>
                </div>
              </div>

              {order.notes && (
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                  <strong className="font-semibold block mb-0.5">Special Customer Instructions:</strong>
                  <span>{order.notes}</span>
                </div>
              )}
            </div>

            {/* Ordered Garments */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-curator-border shadow-xs space-y-3">
              <span className="text-[10px] font-bold tracking-widest text-curator-muted font-mono uppercase block">
                Ordered Items ({order.items?.length || 1})
              </span>

              <div className="divide-y divide-curator-border/50">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                    {item.product_image ? (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-12 h-14 object-cover rounded-xl bg-curator-bg flex-shrink-0 border border-curator-border/60"
                      />
                    ) : (
                      <div className="w-12 h-14 rounded-xl bg-curator-surface-peach flex items-center justify-center font-serif text-curator-coral font-bold text-sm flex-shrink-0">
                        WC
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-sm font-bold text-curator-charcoal truncate">
                        {item.product_name}
                      </h4>
                      <p className="text-xs text-curator-muted">
                        Color: <span className="font-semibold text-curator-charcoal">{item.color_name}</span> • Size: <span className="font-semibold text-curator-charcoal">{item.size}</span>
                      </p>
                      <p className="text-xs font-mono font-semibold text-curator-coral mt-0.5">
                        ৳{item.unit_price} × {item.quantity} = ৳{item.subtotal}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-curator-border shadow-xs space-y-2 text-xs">
              <span className="text-[10px] font-bold tracking-widest text-curator-muted font-mono uppercase block mb-1">
                Payment Summary
              </span>
              <div className="flex justify-between text-curator-muted">
                <span>Subtotal</span>
                <span className="font-mono">৳{order.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-curator-muted">
                <span>Delivery Charge ({order.city})</span>
                <span className="font-mono">৳{order.delivery_charge || 0}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount</span>
                  <span className="font-mono">-৳{order.discount}</span>
                </div>
              )}
              <div className="pt-2 border-t border-curator-border flex justify-between font-bold text-sm text-curator-charcoal">
                <span>Total Amount Due</span>
                <span className="font-mono text-base text-curator-coral">
                  ৳{order.total?.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-curator-muted font-mono pt-1 text-right">
                Payment: {order.payment_method || 'Cash on Delivery'}
              </p>
            </div>

            {/* Campaign & UTM Marketing Attribution */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-curator-border shadow-xs space-y-2.5">
              <span className="text-[10px] font-bold tracking-widest text-curator-muted font-mono uppercase block">
                Marketing Attribution & Ad Source
              </span>

              {order.utm_source || order.gclid || order.fbclid || order.ttclid ? (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#FAF5EE]/60 border border-curator-border/60">
                    <span className="text-[10px] text-curator-muted uppercase block">Source / Medium</span>
                    <span className="font-mono font-bold text-curator-charcoal">
                      {order.utm_source || 'Direct'} / {order.utm_medium || 'Organic'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FAF5EE]/60 border border-curator-border/60">
                    <span className="text-[10px] text-curator-muted uppercase block">Campaign</span>
                    <span className="font-mono font-bold text-curator-charcoal">
                      {order.utm_campaign || '—'}
                    </span>
                  </div>

                  {order.utm_content && (
                    <div className="p-2.5 rounded-xl bg-[#FAF5EE]/60 border border-curator-border/60 col-span-2">
                      <span className="text-[10px] text-curator-muted uppercase block">Content / Creative</span>
                      <span className="font-mono text-curator-charcoal">{order.utm_content}</span>
                    </div>
                  )}

                  {(order.gclid || order.fbclid || order.ttclid) && (
                    <div className="p-2.5 rounded-xl bg-[#FAF5EE]/60 border border-curator-border/60 col-span-2">
                      <span className="text-[10px] text-curator-muted uppercase block">Click ID</span>
                      <span className="font-mono text-[10px] text-curator-coral break-all">
                        {order.gclid ? `gclid: ${order.gclid}` : order.fbclid ? `fbclid: ${order.fbclid}` : `ttclid: ${order.ttclid}`}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-curator-muted font-mono">
                  Direct Storefront Visitor (Organic / No UTM tag attached)
                </p>
              )}
            </div>

          </div>

          {/* Sticky Bottom Actions */}
          <div className="p-4 bg-white border-t border-curator-border flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-full border border-curator-border text-xs font-bold text-curator-charcoal hover:bg-curator-surface-peach min-h-[48px]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => onUpdateStatus(order.id || order.order_number, 'confirmed')}
              className="flex-1 py-3 rounded-full bg-curator-coral text-white text-xs font-bold shadow-md hover:bg-curator-coral-hover min-h-[48px]"
            >
              Confirm Order
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
