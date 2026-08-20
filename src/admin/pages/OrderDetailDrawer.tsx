import React from 'react';
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
  Check
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { useAdminToast } from '../context/AdminToastContext';

interface OrderDetailDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => Promise<void>;
}

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus
}) => {
  const { success } = useAdminToast();

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
                className="p-2 rounded-full border border-curator-border hover:bg-curator-surface-peach text-curator-muted hover:text-curator-charcoal transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* Status Timeline Stepper */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-curator-border shadow-xs space-y-3">
              <span className="text-[10px] font-bold tracking-widest text-curator-muted font-mono uppercase block">
                Order Pipeline Progress
              </span>

              <div className="grid grid-cols-5 gap-1 text-center">
                {statuses.map((st, idx) => {
                  const isDone = idx <= currentIdx && order.status !== 'cancelled';
                  const isCurrent = idx === currentIdx && order.status !== 'cancelled';

                  return (
                    <button
                      key={st.key}
                      type="button"
                      onClick={() => onUpdateStatus(order.id || order.order_number, st.key)}
                      className="group flex flex-col items-center gap-1 focus:outline-none min-h-[52px]"
                    >
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          isCurrent
                            ? 'bg-curator-coral text-white ring-4 ring-curator-coral-light shadow-sm'
                            : isDone
                            ? 'bg-emerald-600 text-white'
                            : 'bg-curator-border text-curator-muted hover:bg-curator-border/80'
                        }`}
                      >
                        <st.icon className="w-3.5 h-3.5" />
                      </div>
                      <span
                        className={`text-[9px] sm:text-[10px] tracking-tight font-sans ${
                          isCurrent
                            ? 'font-bold text-curator-coral'
                            : isDone
                            ? 'font-medium text-emerald-800'
                            : 'text-curator-muted'
                        }`}
                      >
                        {st.label}
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
                    className="inline-flex items-center gap-1 text-xs font-mono font-bold text-curator-coral hover:underline mt-0.5 min-h-[36px] items-center"
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

                    <div className="min-w-0 flex-1">
                      <h4 className="font-serif text-xs font-bold text-curator-charcoal truncate">
                        {item.product_name}
                      </h4>
                      <p className="text-[11px] text-curator-muted font-mono">
                        {item.color_name} • Size: {item.size} • Qty: {item.quantity}
                      </p>
                    </div>

                    <div className="text-right font-mono">
                      <span className="font-bold text-xs text-curator-charcoal block">
                        ৳{item.subtotal?.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-curator-muted">
                        ৳{item.unit_price} each
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-curator-border shadow-xs space-y-2 text-xs">
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
