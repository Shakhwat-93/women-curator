import React, { useEffect } from 'react';
import { CheckCircle2, ShoppingBag, ArrowRight, Truck, MapPin, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Order } from '../../types';

interface OrderSuccessModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  isOpen,
  onClose
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#DE4F3C', '#F4A999', '#FAF5EE', '#BD4857']
        });
      } catch (e) {
        // graceful ignore
      }
    }
  }, [isOpen]);

  if (!isOpen || !order) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-curator-charcoal/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-xl bg-curator-surface rounded-[2.5rem] border border-curator-border shadow-2xl p-6 sm:p-8 z-10 my-auto text-center"
        >
          {/* Success Icon Animation */}
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 text-emerald-600 border-4 border-emerald-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <span className="text-xs uppercase tracking-widest text-curator-coral font-bold font-sans">
            Order Confirmed
          </span>

          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-curator-charcoal mt-1">
            Thank You, {order.customer_name}!
          </h2>

          <p className="text-xs text-curator-muted mt-2 max-w-md mx-auto leading-relaxed">
            Your order <strong className="text-curator-charcoal font-semibold">{order.order_number}</strong> has been received and is being prepared with luxury craftsmanship.
          </p>

          {/* Order Details Receipt Card */}
          <div className="mt-6 text-left bg-curator-surface-peach/50 p-4 sm:p-5 rounded-2xl border border-curator-border space-y-3.5 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-curator-border">
              <span className="text-curator-muted">Order Number:</span>
              <span className="font-bold text-curator-charcoal font-mono">{order.order_number}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-curator-border">
              <span className="text-curator-muted">Payment Method:</span>
              <span className="font-semibold text-curator-charcoal capitalize">
                {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
              </span>
            </div>

            <div className="space-y-1.5 py-1">
              <span className="text-curator-muted block font-medium">Delivery Destination:</span>
              <div className="flex items-start gap-2 text-curator-charcoal">
                <MapPin className="w-4 h-4 text-curator-coral flex-shrink-0 mt-0.5" />
                <span>{order.address}, {order.area}, {order.city}</span>
              </div>
              <div className="flex items-center gap-4 text-curator-muted pt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-curator-coral" />
                  {order.phone}
                </span>
                {order.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-curator-coral" />
                    {order.email}
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-curator-border font-bold text-sm">
              <span>Total Paid/Due:</span>
              <span className="font-serif text-curator-coral text-base font-bold">
                ৳{order.total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Delivery Tracker notice */}
          <div className="mt-5 p-3.5 rounded-2xl bg-white border border-curator-border/80 flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full bg-curator-coral-light flex items-center justify-center text-curator-coral flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-curator-charcoal">Estimated Delivery: 2-3 Business Days</h4>
              <p className="text-[11px] text-curator-muted">Our curation team will confirm via SMS/call before dispatch.</p>
            </div>
          </div>

          {/* Action */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="w-full py-3.5 px-6 rounded-full bg-curator-coral text-white font-semibold text-sm shadow-md hover:bg-curator-coral-hover flex items-center justify-center gap-2 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
