import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, ArrowRight, Trash2, Plus, Minus, Tag, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { track } from '../../tracking';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    totalItems,
    deliveryCharge,
    discount,
    promoCode,
    applyPromoCode,
    removePromoCode
  } = useCart();

  const [inputCode, setInputCode] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ valid: boolean; text: string } | null>(null);

  const finalTotal = subtotal + deliveryCharge - discount;

  useEffect(() => {
    if (isCartOpen && cart.length > 0) {
      track.viewCart(cart, finalTotal);
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleApplyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const res = applyPromoCode(inputCode);
    setPromoMessage({ valid: res.valid, text: res.message });
  };

  const handleProceedToCheckout = () => {
    track.beginCheckout(cart, finalTotal);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCartOpen(false)}
          className="absolute inset-0 bg-curator-charcoal/50 backdrop-blur-sm transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-screen max-w-md bg-curator-surface border-l border-curator-border shadow-2xl flex flex-col justify-between"
          >
            {/* Header */}
            <div className="p-6 border-b border-curator-border flex items-center justify-between bg-[#FBF7F2]">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-curator-coral" />
                <h2 className="font-serif text-xl font-bold text-curator-charcoal">
                  Shopping Bag
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-curator-coral text-white font-bold">
                  {totalItems}
                </span>
              </div>

              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 rounded-full hover:bg-white text-curator-charcoal hover:text-curator-coral transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-20 h-20 rounded-full bg-curator-coral-light flex items-center justify-center text-curator-coral">
                    <ShoppingBag className="w-10 h-10" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-curator-charcoal">
                    Your Bag is Empty
                  </h3>
                  <p className="text-xs text-curator-muted max-w-xs leading-relaxed">
                    Explore our latest New Drop collection and curate your signature wardrobe.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="px-6 py-3 rounded-full bg-curator-coral text-white text-xs font-semibold hover:bg-curator-coral-hover transition-all"
                  >
                    Shop New Drop
                  </button>
                </div>
              ) : (
                cart.map(item => (
                  <div
                    key={`${item.product.id}-${item.selectedColor.hex}-${item.selectedSize}`}
                    className="flex gap-4 p-3.5 rounded-2xl bg-white border border-curator-border shadow-curator-sm"
                  >
                    <div className="w-20 h-24 rounded-xl overflow-hidden bg-curator-surface-peach flex-shrink-0">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-serif text-sm font-semibold text-curator-charcoal line-clamp-1">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() =>
                              removeFromCart(
                                item.product.id,
                                item.selectedColor.hex,
                                item.selectedSize
                              )
                            }
                            className="text-curator-muted hover:text-curator-rose transition-colors p-1"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-[11px] text-curator-muted">
                          <span className="flex items-center gap-1">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block"
                              style={{ backgroundColor: item.selectedColor.hex }}
                            />
                            {item.selectedColor.name}
                          </span>
                          <span>•</span>
                          <span>{item.selectedSize}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="inline-flex items-center rounded-full border border-curator-border bg-curator-surface-peach/60 px-2 py-0.5">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.selectedColor.hex,
                                item.selectedSize,
                                item.quantity - 1
                              )
                            }
                            className="p-1 text-curator-charcoal hover:text-curator-coral"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.selectedColor.hex,
                                item.selectedSize,
                                item.quantity + 1
                              )
                            }
                            className="p-1 text-curator-charcoal hover:text-curator-coral"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="font-serif font-bold text-curator-coral text-sm">
                          ৳{(item.product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer & Total Calculation */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-curator-border bg-[#FBF7F2] space-y-4">
                {/* Promo Code Input */}
                <div>
                  <form onSubmit={handleApplyCode} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-curator-muted" />
                      <input
                        type="text"
                        value={inputCode}
                        onChange={e => setInputCode(e.target.value)}
                        placeholder="Promo code (e.g. CURATOR10)"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-full border border-curator-border bg-white focus:outline-none focus:border-curator-coral uppercase"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-curator-charcoal text-white rounded-full text-xs font-semibold hover:bg-curator-coral transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                  {promoMessage && (
                    <p
                      className={`text-[11px] mt-1.5 font-medium ${
                        promoMessage.valid ? 'text-emerald-600' : 'text-curator-rose'
                      }`}
                    >
                      {promoMessage.text}
                    </p>
                  )}
                  {promoCode && (
                    <div className="flex items-center justify-between bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-xs mt-2 border border-emerald-200">
                      <span className="font-medium">Code "{promoCode}" applied</span>
                      <button
                        onClick={removePromoCode}
                        className="text-xs font-bold text-emerald-800 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Subtotals */}
                <div className="space-y-1.5 text-xs text-curator-muted pt-2 border-t border-curator-border/60">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-curator-charcoal font-medium">৳{subtotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Voucher Discount</span>
                      <span>-৳{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Estimated Delivery</span>
                    <span className="text-curator-charcoal font-medium">৳{deliveryCharge}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-curator-charcoal pt-2 border-t border-curator-border">
                    <span>Total Amount</span>
                    <span className="text-curator-coral font-serif text-lg font-bold">
                      ৳{finalTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-3.5 px-6 rounded-full bg-curator-coral text-white font-semibold text-sm shadow-md hover:bg-curator-coral-hover hover:shadow-curator-glow active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-curator-muted">
                  <ShieldCheck className="w-3.5 h-3.5 text-curator-coral" />
                  <span>Encrypted & Guaranteed Quality Checkout</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
