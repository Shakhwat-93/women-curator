import React from 'react';
import { CartItem } from '../../types';
import { ShieldCheck, Truck, Sparkles } from 'lucide-react';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  promoCode?: string;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  subtotal,
  deliveryCharge,
  discount,
  total,
  promoCode
}) => {
  return (
    <div className="bg-curator-surface-peach/50 rounded-3xl p-6 border border-curator-border space-y-6">
      <div className="flex items-center justify-between border-b border-curator-border pb-4">
        <h3 className="font-serif text-lg font-bold text-curator-charcoal flex items-center gap-2">
          <span>Order Summary</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-curator-coral text-white font-sans font-semibold">
            {items.reduce((sum, item) => sum + item.quantity, 0)} Items
          </span>
        </h3>
      </div>

      {/* Items Scrollable preview */}
      <div className="space-y-3.5 max-h-60 overflow-y-auto pr-1">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 bg-white/80 p-2.5 rounded-2xl border border-curator-border/60"
          >
            <div className="w-14 h-16 rounded-xl overflow-hidden bg-curator-surface-peach flex-shrink-0">
              <img
                src={item.product.image_url}
                alt={item.product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-curator-charcoal truncate font-serif">
                {item.product.name}
              </h4>
              <p className="text-[11px] text-curator-muted mt-0.5">
                {item.selectedColor.name} • {item.selectedSize} • Qty: {item.quantity}
              </p>
              <div className="font-serif font-bold text-curator-coral text-xs mt-1">
                ৳{(item.product.price * item.quantity).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing Breakdown */}
      <div className="space-y-2.5 text-xs text-curator-muted pt-4 border-t border-curator-border">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-medium text-curator-charcoal">৳{subtotal.toLocaleString()}</span>
        </div>

        <div className="flex justify-between">
          <span>Delivery Charge</span>
          <span className="font-medium text-curator-charcoal">
            {deliveryCharge === 0 ? 'FREE' : `৳${deliveryCharge}`}
          </span>
        </div>

        {discount > 0 && (
          <div className="flex justify-between text-emerald-600 font-semibold">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Discount ({promoCode})</span>
            </span>
            <span>-৳{discount.toLocaleString()}</span>
          </div>
        )}

        <div className="flex justify-between items-baseline text-base font-bold text-curator-charcoal pt-3 border-t border-curator-border">
          <span>Total Payable</span>
          <span className="font-serif text-xl font-bold text-curator-coral">
            ৳{total.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="bg-white/60 p-3 rounded-2xl border border-curator-border/60 text-[11px] text-curator-muted space-y-1.5">
        <div className="flex items-center gap-2">
          <Truck className="w-3.5 h-3.5 text-curator-coral" />
          <span>Express Delivery inside Dhaka within 24-48h</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-curator-coral" />
          <span>Cash on Delivery & Instant Mobile Banking Available</span>
        </div>
      </div>
    </div>
  );
};
