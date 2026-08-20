import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, MapPin, Printer, Copy } from 'lucide-react';
import { Order } from '../../types';
import { orderService } from '../../lib/api';
import { useAdminToast } from '../context/AdminToastContext';

interface OrderDetailDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated: () => void;
}

export const OrderDetailDrawer: React.FC<OrderDetailDrawerProps> = ({
  order,
  isOpen,
  onClose,
  onStatusUpdated
}) => {
  const { success, error } = useAdminToast();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen || !order) return null;

  const handleStatusChange = async (newStatus: Order['status']) => {
    setIsUpdating(true);
    try {
      const res = await orderService.updateOrderStatus(order.id || '', newStatus);
      if (res.success) {
        success(`Order status updated to "${newStatus}"`);
        onStatusUpdated();
      } else {
        error('Failed to update status');
      }
    } catch {
      error('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopy = () => {
    const text = `Order: ${order.order_number}\nCustomer: ${order.customer_name}\nPhone: ${order.phone}\nAddress: ${order.address}, ${order.city}\nTotal: ৳${order.total}`;
    navigator.clipboard.writeText(text);
    success('Order information copied to clipboard');
  };

  const handlePrint = () => {
    window.print();
  };

  const timelineSteps: Array<{ key: Order['status']; label: string }> = [
    { key: 'pending', label: 'Order Placed' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'processing', label: 'Packaging' },
    { key: 'shipped', label: 'Handed to Courier' },
    { key: 'delivered', label: 'Delivered' }
  ];

  const currentStepIdx = timelineSteps.findIndex(s => s.key === order.status);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-curator-charcoal/60 backdrop-blur-sm"
        />

        {/* Drawer Window */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className="relative w-full max-w-xl bg-white h-full shadow-2xl border-l border-curator-border flex flex-col justify-between z-10 overflow-y-auto"
        >
          {/* Header */}
          <div>
            <div className="p-6 border-b border-curator-border flex items-center justify-between bg-[#FAF5EE]/60">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-curator-coral font-mono block">
                  ORDER DETAILS
                </span>
                <h3 className="font-serif text-xl font-bold text-curator-charcoal">
                  #{order.order_number}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  title="Copy Details"
                  className="p-2 rounded-full border border-curator-border bg-white text-curator-charcoal hover:text-curator-coral transition-colors shadow-xs"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={handlePrint}
                  title="Print Invoice"
                  className="p-2 rounded-full border border-curator-border bg-white text-curator-charcoal hover:text-curator-coral transition-colors shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full border border-curator-border bg-white text-curator-charcoal hover:bg-rose-50 hover:text-rose-600 transition-colors shadow-xs"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Status Pipeline Timeline */}
            <div className="p-6 border-b border-curator-border bg-white">
              <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-3">
                Order Status Pipeline
              </label>

              <div className="grid grid-cols-5 gap-1.5 mb-4">
                {timelineSteps.map((step, idx) => {
                  const isDone = currentStepIdx >= idx && order.status !== 'cancelled';
                  return (
                    <button
                      key={step.key}
                      disabled={isUpdating}
                      onClick={() => handleStatusChange(step.key)}
                      className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all text-center ${
                        order.status === step.key
                          ? 'bg-curator-coral text-white border-curator-coral shadow-sm'
                          : isDone
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-white text-curator-muted border-curator-border hover:bg-curator-surface-peach'
                      }`}
                    >
                      {step.label}
                    </button>
                  );
                })}
              </div>

              {/* Quick Cancel Button */}
              {order.status !== 'cancelled' && (
                <button
                  disabled={isUpdating}
                  onClick={() => handleStatusChange('cancelled')}
                  className="text-xs font-bold text-rose-600 hover:underline"
                >
                  ✕ Mark as Cancelled
                </button>
              )}
            </div>

            {/* Customer Destination Card */}
            <div className="p-6 border-b border-curator-border space-y-4">
              <h4 className="font-serif text-sm font-bold text-curator-charcoal">
                Customer Destination
              </h4>

              <div className="p-4 rounded-2xl bg-[#FAF5EE]/70 border border-curator-border space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-curator-coral flex-shrink-0" />
                  <span className="font-mono text-xs font-bold text-curator-charcoal">
                    {order.customer_name}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-curator-coral flex-shrink-0" />
                    <span className="font-mono text-xs font-bold text-curator-charcoal">
                      {order.phone}
                    </span>
                  </div>
                  <a
                    href={`tel:${order.phone}`}
                    className="px-3 py-1 rounded-full bg-curator-coral text-white text-[11px] font-bold shadow-xs hover:bg-curator-coral-hover"
                  >
                    Call Customer
                  </a>
                </div>

                <div className="flex items-start gap-3 pt-1 border-t border-curator-border/60">
                  <MapPin className="w-4 h-4 text-curator-coral flex-shrink-0 mt-0.5" />
                  <div className="font-mono text-xs text-curator-charcoal leading-relaxed">
                    <strong className="block font-sans font-bold text-xs">Delivery Address:</strong>
                    <span>{order.address}</span>
                    <span className="block text-curator-muted mt-0.5">{order.city} {order.postal_code ? `- ${order.postal_code}` : ''}</span>
                  </div>
                </div>

                {order.notes && (
                  <div className="pt-2 border-t border-curator-border/60 text-xs">
                    <span className="font-bold text-curator-charcoal">Customer Note:</span>
                    <p className="text-curator-muted mt-0.5">{order.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Items Purchased List */}
            <div className="p-6 space-y-4">
              <h4 className="font-serif text-sm font-bold text-curator-charcoal">
                Ordered Items ({order.items?.length || 1})
              </h4>

              <div className="space-y-3">
                {order.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3.5 p-3 rounded-2xl border border-curator-border bg-white shadow-xs"
                  >
                    <img
                      src={item.product_image || '/assets/product-magenta-tunic.jpg'}
                      alt={item.product_name}
                      className="w-14 h-16 object-cover rounded-xl bg-curator-bg flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h5 className="font-serif text-xs font-bold text-curator-charcoal truncate">
                        {item.product_name}
                      </h5>
                      <p className="text-[11px] text-curator-muted font-mono">
                        {item.color_name} • Size: {item.size}
                      </p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-mono text-xs font-bold text-curator-coral">
                          ৳{item.unit_price?.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-curator-muted">
                          x {item.quantity}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-sm text-curator-charcoal">
                      ৳{item.subtotal?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-2xl bg-curator-surface-peach/50 border border-curator-border space-y-2 text-xs font-sans">
                <div className="flex justify-between text-curator-muted">
                  <span>Subtotal:</span>
                  <span className="font-mono font-semibold text-curator-charcoal">৳{order.subtotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-curator-muted">
                  <span>Delivery Charge ({order.city === 'Dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}):</span>
                  <span className="font-mono font-semibold text-curator-charcoal">৳{order.delivery_charge}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount:</span>
                    <span className="font-mono">-৳{order.discount?.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-2 border-t border-curator-border text-sm font-bold text-curator-charcoal">
                  <span>Total (Cash on Delivery):</span>
                  <span className="font-serif text-lg font-bold text-curator-coral">৳{order.total?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer Actions */}
          <div className="p-6 border-t border-curator-border bg-[#FAF5EE]/70">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-full border border-curator-border bg-white text-xs font-bold text-curator-charcoal hover:bg-curator-surface-peach transition-colors shadow-xs"
            >
              Close Drawer
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
