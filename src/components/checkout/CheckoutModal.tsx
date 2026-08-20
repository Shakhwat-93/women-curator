import React, { useState } from 'react';
import { X, ArrowRight, Lock, CreditCard, Banknote, Smartphone, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { orderService } from '../../lib/api';
import { Order, CheckoutFormData } from '../../types';
import { OrderSummary } from './OrderSummary';
import { OrderSuccessModal } from './OrderSuccessModal';

export const CheckoutModal: React.FC = () => {
  const {
    cart,
    subtotal,
    discount,
    promoCode,
    clearCart,
    isCheckoutOpen,
    setIsCheckoutOpen
  } = useCart();

  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Dhaka',
    area: '',
    postalCode: '',
    orderNotes: '',
    paymentMethod: 'cod'
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  if (!isCheckoutOpen && !isSuccessModalOpen) return null;

  // Delivery charge based on city selection
  const deliveryCharge = formData.city === 'Dhaka' ? 80 : 150;
  const finalTotal = Math.max(0, subtotal + deliveryCharge - discount);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof CheckoutFormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Please enter your full name';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required for delivery';
    } else if (!/^(?:\+88|88)?01[3-9]\d{8}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      newErrors.phone = 'Please enter a valid 11-digit Bangladeshi phone number (e.g. 01712345678)';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Please provide detailed delivery address';
    }

    if (!formData.city?.trim()) {
      newErrors.city = 'Please select your delivery city';
    }

    if (!formData.area?.trim()) {
      newErrors.area = 'Area/Thana is required for accurate courier dispatch';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (cart.length === 0) {
      setErrors({ fullName: 'Your shopping bag is empty.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderNumber = `WC-${Date.now().toString().slice(-6)}`;

      const orderPayload: Omit<Order, 'id' | 'created_at'> = {
        order_number: orderNumber,
        customer_name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        city: formData.city,
        area: (formData.area || '').trim(),
        postal_code: (formData.postalCode || '').trim(),
        notes: (formData.orderNotes || '').trim(),
        payment_method: formData.paymentMethod,
        subtotal,
        delivery_charge: deliveryCharge,
        discount,
        total: finalTotal,
        status: 'pending',
        items: cart.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          product_image: item.product.image_url,
          color_name: item.selectedColor.name,
          size: item.selectedSize,
          quantity: item.quantity,
          unit_price: item.product.price,
          subtotal: item.product.price * item.quantity
        }))
      };

      const result = await orderService.createOrder(orderPayload);

      if (result.success) {
        setCompletedOrder({
          ...orderPayload,
          order_number: result.orderId || orderNumber,
          created_at: new Date().toISOString()
        });
        clearCart();
        setIsCheckoutOpen(false);
        setIsSuccessModalOpen(true);
      }
    } catch (err: any) {
      setErrors({ fullName: 'Failed to place order. Please check your details and try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: Partial<Record<keyof CheckoutFormData, string>>) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <>
      {/* Order Success Confirmation */}
      <OrderSuccessModal
        isOpen={isSuccessModalOpen}
        order={completedOrder}
        onClose={() => setIsSuccessModalOpen(false)}
      />

      {/* Main Checkout Modal */}
      {isCheckoutOpen && (
        <AnimatePresence>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="fixed inset-0 bg-curator-charcoal/60 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl bg-curator-surface rounded-[2.5rem] border border-curator-border shadow-2xl overflow-hidden z-10 my-auto max-h-[92vh] flex flex-col"
            >
              {/* Header Bar */}
              <div className="px-6 py-4 border-b border-curator-border bg-[#FBF7F2] flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-curator-coral text-white flex items-center justify-center font-bold text-xs">
                    WC
                  </div>
                  <div>
                    <h2 className="font-serif text-lg font-bold text-curator-charcoal">
                      Curated Express Checkout
                    </h2>
                    <p className="text-[11px] text-curator-muted flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      <span>256-Bit SSL Secure Order Placement</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="p-2 rounded-full hover:bg-white text-curator-charcoal hover:text-curator-coral transition-colors"
                  aria-label="Close checkout"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Form Fields (7 cols) */}
                  <form onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-6">
                    {/* Section 1: Customer Contact Info */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 border-b border-curator-border/80 pb-2">
                        <span className="w-5 h-5 rounded-full bg-curator-coral text-white text-xs flex items-center justify-center font-bold">1</span>
                        <h3 className="font-serif font-bold text-base text-curator-charcoal">Contact Details</h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-curator-charcoal mb-1.5">
                            Full Name <span className="text-curator-coral">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={e => handleChange('fullName', e.target.value)}
                            placeholder="e.g. Ayesha Siddiqa"
                            className={`w-full px-4 py-3 rounded-2xl bg-[#FAF5EE] border text-xs focus:outline-none focus:bg-white transition-all ${
                              errors.fullName ? 'border-curator-rose ring-1 ring-curator-rose' : 'border-curator-border focus:border-curator-coral'
                            }`}
                          />
                          {errors.fullName && (
                            <p className="text-[11px] text-curator-rose mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> {errors.fullName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-curator-charcoal mb-1.5">
                            Phone Number <span className="text-curator-coral">*</span>
                          </label>
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={e => handleChange('phone', e.target.value)}
                            placeholder="e.g. 01712345678"
                            className={`w-full px-4 py-3 rounded-2xl bg-[#FAF5EE] border text-xs focus:outline-none focus:bg-white transition-all ${
                              errors.phone ? 'border-curator-rose ring-1 ring-curator-rose' : 'border-curator-border focus:border-curator-coral'
                            }`}
                          />
                          {errors.phone && (
                            <p className="text-[11px] text-curator-rose mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> {errors.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-curator-charcoal mb-1.5">
                          Email Address (Optional for e-receipt)
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={e => handleChange('email', e.target.value)}
                          placeholder="e.g. ayesha@example.com"
                          className="w-full px-4 py-3 rounded-2xl bg-[#FAF5EE] border border-curator-border text-xs focus:outline-none focus:border-curator-coral focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    {/* Section 2: Delivery Address */}
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-2 border-b border-curator-border/80 pb-2">
                        <span className="w-5 h-5 rounded-full bg-curator-coral text-white text-xs flex items-center justify-center font-bold">2</span>
                        <h3 className="font-serif font-bold text-base text-curator-charcoal">Delivery Address</h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-curator-charcoal mb-1.5">
                            City / District <span className="text-curator-coral">*</span>
                          </label>
                          <select
                            value={formData.city}
                            onChange={e => handleChange('city', e.target.value)}
                            className="w-full px-4 py-3 rounded-2xl bg-[#FAF5EE] border border-curator-border text-xs focus:outline-none focus:border-curator-coral focus:bg-white transition-all cursor-pointer"
                          >
                            <option value="Dhaka">Dhaka (৳80 Delivery)</option>
                            <option value="Chittagong">Chittagong (৳150 Delivery)</option>
                            <option value="Sylhet">Sylhet (৳150 Delivery)</option>
                            <option value="Rajshahi">Rajshahi (৳150 Delivery)</option>
                            <option value="Khulna">Khulna (৳150 Delivery)</option>
                            <option value="Barisal">Barisal (৳150 Delivery)</option>
                            <option value="Rangpur">Rangpur (৳150 Delivery)</option>
                            <option value="Mymensingh">Mymensingh (৳150 Delivery)</option>
                            <option value="Outside Dhaka">Other Districts (৳150 Delivery)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-curator-charcoal mb-1.5">
                            Area / Thana <span className="text-curator-coral">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.area}
                            onChange={e => handleChange('area', e.target.value)}
                            placeholder="e.g. Dhanmondi / Banani"
                            className={`w-full px-4 py-3 rounded-2xl bg-[#FAF5EE] border text-xs focus:outline-none focus:bg-white transition-all ${
                              errors.area ? 'border-curator-rose ring-1 ring-curator-rose' : 'border-curator-border focus:border-curator-coral'
                            }`}
                          />
                          {errors.area && (
                            <p className="text-[11px] text-curator-rose mt-1 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> {errors.area}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-curator-charcoal mb-1.5">
                            Postal Code
                          </label>
                          <input
                            type="text"
                            value={formData.postalCode}
                            onChange={e => handleChange('postalCode', e.target.value)}
                            placeholder="e.g. 1205"
                            className="w-full px-4 py-3 rounded-2xl bg-[#FAF5EE] border border-curator-border text-xs focus:outline-none focus:border-curator-coral focus:bg-white transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-curator-charcoal mb-1.5">
                          Detailed Street Address <span className="text-curator-coral">*</span>
                        </label>
                        <textarea
                          rows={2}
                          value={formData.address}
                          onChange={e => handleChange('address', e.target.value)}
                          placeholder="House / Flat / Road number, Landmark..."
                          className={`w-full px-4 py-3 rounded-2xl bg-[#FAF5EE] border text-xs focus:outline-none focus:bg-white transition-all resize-none ${
                            errors.address ? 'border-curator-rose ring-1 ring-curator-rose' : 'border-curator-border focus:border-curator-coral'
                          }`}
                        />
                        {errors.address && (
                          <p className="text-[11px] text-curator-rose mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.address}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-curator-charcoal mb-1.5">
                          Order Notes & Instructions (Optional)
                        </label>
                        <input
                          type="text"
                          value={formData.orderNotes}
                          onChange={e => handleChange('orderNotes', e.target.value)}
                          placeholder="e.g. Special gift wrap or call before delivery"
                          className="w-full px-4 py-3 rounded-2xl bg-[#FAF5EE] border border-curator-border text-xs focus:outline-none focus:border-curator-coral focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    {/* Section 3: Payment Method */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2 border-b border-curator-border/80 pb-2">
                        <span className="w-5 h-5 rounded-full bg-curator-coral text-white text-xs flex items-center justify-center font-bold">3</span>
                        <h3 className="font-serif font-bold text-base text-curator-charcoal">Payment Method</h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Cash on Delivery */}
                        <label
                          className={`flex flex-col p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            formData.paymentMethod === 'cod'
                              ? 'border-curator-coral bg-curator-coral-light/40 shadow-sm'
                              : 'border-curator-border hover:border-curator-muted bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Banknote className="w-5 h-5 text-curator-coral" />
                            <input
                              type="radio"
                              name="payment"
                              checked={formData.paymentMethod === 'cod'}
                              onChange={() => handleChange('paymentMethod', 'cod')}
                              className="accent-curator-coral"
                            />
                          </div>
                          <span className="text-xs font-bold text-curator-charcoal">Cash on Delivery</span>
                          <span className="text-[11px] text-curator-muted mt-0.5">Pay in cash when delivered</span>
                        </label>

                        {/* bKash / Nagad */}
                        <label
                          className={`flex flex-col p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            formData.paymentMethod === 'bkash'
                              ? 'border-curator-coral bg-curator-coral-light/40 shadow-sm'
                              : 'border-curator-border hover:border-curator-muted bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Smartphone className="w-5 h-5 text-curator-coral" />
                            <input
                              type="radio"
                              name="payment"
                              checked={formData.paymentMethod === 'bkash'}
                              onChange={() => handleChange('paymentMethod', 'bkash')}
                              className="accent-curator-coral"
                            />
                          </div>
                          <span className="text-xs font-bold text-curator-charcoal">bKash / Nagad</span>
                          <span className="text-[11px] text-curator-muted mt-0.5">Instant Mobile Banking</span>
                        </label>

                        {/* Credit / Debit Card */}
                        <label
                          className={`flex flex-col p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            formData.paymentMethod === 'card'
                              ? 'border-curator-coral bg-curator-coral-light/40 shadow-sm'
                              : 'border-curator-border hover:border-curator-muted bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <CreditCard className="w-5 h-5 text-curator-coral" />
                            <input
                              type="radio"
                              name="payment"
                              checked={formData.paymentMethod === 'card'}
                              onChange={() => handleChange('paymentMethod', 'card')}
                              className="accent-curator-coral"
                            />
                          </div>
                          <span className="text-xs font-bold text-curator-charcoal">Card Payment</span>
                          <span className="text-[11px] text-curator-muted mt-0.5">Visa / Mastercard / Amex</span>
                        </label>
                      </div>
                    </div>

                    {/* Submit Button on Mobile/Desktop */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting || cart.length === 0}
                        className="w-full py-4 px-8 rounded-full bg-curator-coral text-white font-semibold text-base shadow-md hover:bg-curator-coral-hover hover:shadow-curator-glow active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:pointer-events-none"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Confirming Curated Order...</span>
                          </div>
                        ) : (
                          <>
                            <span>Place Order — ৳{finalTotal.toLocaleString()}</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  {/* Right Column: Order Summary (5 cols) */}
                  <div className="lg:col-span-5">
                    <OrderSummary
                      items={cart}
                      subtotal={subtotal}
                      deliveryCharge={deliveryCharge}
                      discount={discount}
                      total={finalTotal}
                      promoCode={promoCode}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>
      )}
    </>
  );
};
