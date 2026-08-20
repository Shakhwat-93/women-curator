import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Lock, ArrowRight, AlertCircle, ShoppingBag, Sparkles, User, Phone, MapPin, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Product, ColorOption, DeliverySettings, Order } from '../../types';
import { orderService } from '../../lib/api';
import { OrganicBackground } from '../common/OrganicBackground';
import { track } from '../../tracking';

interface DirectOrderSectionProps {
  products: Product[];
  selectedProduct: Product;
  onSelectProduct: (product: Product) => void;
  deliverySettings?: DeliverySettings | null;
}

export const DirectOrderSection: React.FC<DirectOrderSectionProps> = ({
  products,
  selectedProduct,
  onSelectProduct,
  deliverySettings
}) => {
  const [selectedColor, setSelectedColor] = useState<ColorOption>(selectedProduct.colors[0] || { name: 'Signature', hex: '#DE4F3C' });
  const [selectedSize, setSelectedSize] = useState<string>('M (38)');
  const [quantity, setQuantity] = useState<number>(1);

  // Customer Form Fields
  const [fullName, setFullName] = useState('Shakhwat hossain rasel');
  const [phone, setPhone] = useState('01540400247');
  const [address, setAddress] = useState('mahiganj Rangpur');
  const [city, setCity] = useState<'Dhaka' | 'Outside'>('Outside');
  const [postalCode, setPostalCode] = useState('5403');
  const [notes, setNotes] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');

  // States
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string; address?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<{ orderNumber: string; total: number } | null>(null);

  // Update color and size when selectedProduct changes
  React.useEffect(() => {
    if (selectedProduct && selectedProduct.colors && selectedProduct.colors.length > 0) {
      setSelectedColor(selectedProduct.colors[0]);
      setSelectedSize(selectedProduct.sizes?.[0] || 'M (38)');
    }
  }, [selectedProduct]);

  // Dynamic Delivery Calculations from CMS
  const insideFee = deliverySettings?.inside_dhaka_fee ?? 80;
  const outsideFee = deliverySettings?.outside_dhaka_fee ?? 150;
  const freeThreshold = deliverySettings?.free_delivery_threshold ?? 2500;

  const itemPrice = selectedProduct.price;
  const subtotal = itemPrice * quantity;
  const deliveryCharge = subtotal >= freeThreshold ? 0 : (city === 'Dhaka' ? insideFee : outsideFee);
  const total = Math.max(0, subtotal + deliveryCharge - appliedDiscount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoCode.trim().toUpperCase();
    if (clean === 'CURATOR10' || clean === 'VIBE10') {
      const disc = Math.round(subtotal * 0.10);
      setAppliedDiscount(disc);
      setPromoMessage('10% Exclusive discount applied!');
    } else if (clean === 'FIRSTDROP' || clean === 'WOMEN200') {
      setAppliedDiscount(200);
      setPromoMessage('৳200 voucher applied!');
    } else {
      setPromoMessage('Invalid promo code. Try CURATOR10');
    }
  };

  const validate = () => {
    const errs: { fullName?: string; phone?: string; address?: string } = {};
    if (!fullName.trim()) {
      errs.fullName = 'Please enter your full name';
    }
    if (!phone.trim()) {
      errs.phone = 'Valid phone number is required';
    } else if (!/^(?:\+88|88)?01[3-9]\d{8}$/.test(phone.replace(/[\s-]/g, ''))) {
      errs.phone = 'Please enter a valid 11-digit mobile number (e.g. 01712345678)';
    }
    if (!address.trim()) {
      errs.address = 'Please provide full delivery address';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleDirectOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const orderNumber = `WC-${Date.now().toString().slice(-6)}`;

      const orderPayload: Partial<Order> = {
        order_number: orderNumber,
        customer_name: fullName.trim(),
        phone: phone.trim(),
        email: '',
        address: `${address.trim()}${postalCode ? ` - ${postalCode.trim()}` : ''}`,
        city: city === 'Dhaka' ? 'Dhaka' : 'Outside Dhaka',
        area: city === 'Dhaka' ? 'Inside Dhaka' : 'Outside Dhaka',
        postal_code: postalCode.trim(),
        notes: notes.trim(),
        payment_method: 'Cash on Delivery',
        subtotal,
        delivery_charge: deliveryCharge,
        discount: appliedDiscount,
        total: total,
        status: 'pending',
        items: [
          {
            product_id: selectedProduct.id,
            product_name: selectedProduct.name,
            product_image: selectedProduct.image_url,
            color_name: selectedColor.name,
            size: selectedSize,
            quantity: quantity,
            unit_price: selectedProduct.price,
            subtotal: subtotal
          }
        ]
      };

      const res = await orderService.createOrder(orderPayload);

      if (res.success) {
        const fullCreatedOrder: Order = res.order || {
          ...(orderPayload as any),
          order_number: res.orderId || orderNumber,
          created_at: new Date().toISOString()
        };

        // FIRE CANONICAL ZERO-DUPLICATE PURCHASE TRACKING
        track.purchase(fullCreatedOrder);

        setOrderCompleted({
          orderNumber: res.orderId || orderNumber,
          total: total
        });

        try {
          confetti({
            particleCount: 90,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#DE4F3C', '#F4A999', '#FAF5EE', '#BD4857']
          });
        } catch {
          // ignore
        }
      }
    } catch {
      alert('Order submission error. Please check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="order-form" className="py-16 sm:py-24 bg-[#F8ECE4] relative overflow-hidden">
      {/* Background Organic Geometry */}
      <OrganicBackground variant="checkout" showDots={true} showArc={true} showShadows={true} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-curator-coral text-white text-xs font-bold uppercase tracking-widest mb-3 shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Direct Express Checkout</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-curator-charcoal tracking-tight">
            Order Your Signature Piece
          </h2>

          <p className="text-xs sm:text-sm text-curator-muted mt-2 font-sans">
            {deliverySettings?.delivery_note || 'Inspect fabric & quality upon delivery. Cash on Delivery across Bangladesh.'}
          </p>
        </div>

        {orderCompleted ? (
          /* Order Confirmation Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2.5rem] p-8 sm:p-12 border border-curator-border shadow-2xl text-center max-w-2xl mx-auto"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-50 text-emerald-600 border-4 border-emerald-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <span className="text-xs font-bold uppercase tracking-widest text-curator-coral font-mono">
              ORDER PLACED SUCCESSFULLY
            </span>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-curator-charcoal mt-1">
              Thank You, {fullName}!
            </h3>

            <p className="text-xs sm:text-sm text-curator-muted mt-2 max-w-md mx-auto leading-relaxed font-sans">
              Order Reference: <strong className="text-curator-charcoal font-mono text-base font-bold">{orderCompleted.orderNumber}</strong>. Our concierge team will call to confirm before priority dispatch.
            </p>

            {/* Customer Destination Snapshot Card */}
            <div className="mt-6 p-5 rounded-2xl bg-white border border-curator-border text-left shadow-sm space-y-3.5">
              <h4 className="text-sm font-bold text-curator-charcoal border-b border-curator-border/80 pb-2">
                Customer Destination
              </h4>

              <div className="flex items-center gap-3 text-curator-charcoal">
                <User className="w-4 h-4 text-curator-muted flex-shrink-0" />
                <span className="font-mono text-sm font-semibold">{fullName}</span>
              </div>

              <div className="flex items-center gap-3 text-curator-charcoal">
                <Phone className="w-4 h-4 text-curator-muted flex-shrink-0" />
                <span className="font-mono text-sm tracking-wide">{phone}</span>
              </div>

              <div className="flex items-start gap-3 text-curator-charcoal pt-1">
                <MapPin className="w-4 h-4 text-curator-coral flex-shrink-0 mt-0.5" />
                <div className="font-mono text-xs leading-relaxed">
                  <strong className="block font-sans font-bold text-curator-charcoal text-xs mb-0.5">Shipping Address:</strong>
                  <span>{address}</span>
                  {postalCode && <span className="block mt-0.5">{city === 'Dhaka' ? 'Dhaka' : 'Rangpur'} - {postalCode}</span>}
                </div>
              </div>

              <div className="flex justify-between items-baseline pt-3 border-t border-curator-border font-bold">
                <span className="text-xs text-curator-muted font-sans">Total Payable (Cash on Delivery):</span>
                <span className="font-serif text-lg font-bold text-curator-coral">৳{orderCompleted.total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setOrderCompleted(null);
                setFullName('');
                setPhone('');
                setAddress('');
              }}
              className="mt-6 px-8 py-3.5 rounded-full bg-curator-coral text-white text-xs font-bold uppercase tracking-wider hover:bg-curator-coral-hover transition-all shadow-md"
            >
              Place Another Order
            </button>
          </motion.div>
        ) : (
          /* Main Order Funnel Container */
          <div className="bg-[#FDFBF7] rounded-[2.5rem] p-6 sm:p-10 border border-curator-border shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
              
              {/* Left Column: Product Selection & Configuration (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-2.5">
                    1. Select Garment
                  </label>
                  
                  {/* Product Cards Selector Tabs */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                    {products.filter(p => p.status !== 'archived' && p.is_active !== false).map((prod) => {
                      const isCurrent = selectedProduct.id === prod.id;
                      return (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => onSelectProduct(prod)}
                          className={`flex items-center gap-2.5 p-2 rounded-2xl border text-left transition-all ${
                            isCurrent
                              ? 'border-curator-coral bg-curator-coral-light/60 shadow-sm ring-1 ring-curator-coral'
                              : 'border-curator-border bg-white hover:bg-curator-surface-peach/50'
                          }`}
                        >
                          <img
                            src={prod.image_url}
                            alt={prod.name}
                            className="w-12 h-14 object-cover rounded-xl bg-curator-bg flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-serif text-xs font-bold text-curator-charcoal truncate">
                              {prod.name}
                            </h4>
                            <span className="font-serif font-bold text-curator-coral text-xs block mt-0.5">
                              ৳{prod.price.toLocaleString()}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Active Selected Dress Visual Showcase */}
                <div className="p-4 rounded-2xl bg-white border border-curator-border shadow-sm flex items-center gap-4">
                  <div className="w-20 h-24 rounded-xl overflow-hidden bg-curator-surface-peach flex-shrink-0">
                    <img
                      src={selectedProduct.image_url}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-curator-coral-light text-curator-coral font-bold font-mono">
                      {selectedProduct.badge || 'New Drop'}
                    </span>
                    <h3 className="font-serif text-base font-bold text-curator-charcoal mt-1 line-clamp-1">
                      {selectedProduct.name}
                    </h3>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-serif text-lg font-bold text-curator-coral">
                        ৳{selectedProduct.price.toLocaleString()}
                      </span>
                      {selectedProduct.compare_price > selectedProduct.price && (
                        <span className="text-xs text-curator-muted line-through font-mono">
                          ৳{selectedProduct.compare_price.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Color Selector */}
                {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-2">
                      Color: <span className="text-curator-coral font-semibold">{selectedColor.name}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.colors.map(color => (
                        <button
                          key={color.hex}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-medium transition-all ${
                            selectedColor.hex === color.hex
                              ? 'border-curator-coral bg-curator-coral text-white shadow-sm'
                              : 'border-curator-border bg-white text-curator-charcoal hover:border-curator-muted'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full inline-block border border-white/40"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span>{color.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-2">
                    Select Size
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(selectedProduct.sizes && selectedProduct.sizes.length > 0 ? selectedProduct.sizes : ['S (36)', 'M (38)', 'L (40)', 'XL (42)']).map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`py-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                          selectedSize === size
                            ? 'bg-curator-charcoal text-white border-curator-charcoal shadow-sm'
                            : 'bg-white text-curator-charcoal border-curator-border hover:bg-curator-surface-peach'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-curator-border">
                  <span className="text-xs font-bold uppercase tracking-wider text-curator-charcoal">
                    Quantity:
                  </span>
                  <div className="inline-flex items-center rounded-full border border-curator-border bg-curator-surface-peach/40 px-2 py-0.5">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-7 h-7 rounded-full text-curator-charcoal hover:bg-white flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-bold font-mono text-curator-charcoal">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-7 h-7 rounded-full text-curator-charcoal hover:bg-white flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Promo Code Box */}
                <div className="pt-1">
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-curator-muted" />
                      <input
                        type="text"
                        value={promoCode}
                        onChange={e => setPromoCode(e.target.value)}
                        placeholder="PROMO CODE (CURATOR10)"
                        className="w-full pl-9 pr-3 py-2.5 rounded-full border border-curator-border bg-white text-xs font-mono uppercase focus:outline-none focus:border-curator-coral"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-full bg-curator-charcoal text-white text-xs font-bold hover:bg-curator-coral transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                  {promoMessage && (
                    <p className={`text-[11px] mt-1 font-medium ${appliedDiscount > 0 ? 'text-emerald-600' : 'text-curator-rose'}`}>
                      {promoMessage}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Customer Destination & Live Checkout (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <form onSubmit={handleDirectOrder} className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-curator-border">
                    <label className="text-xs font-bold uppercase tracking-wider text-curator-charcoal">
                      2. Customer Destination & Shipping Details
                    </label>
                  </div>

                  {/* Customer Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-curator-charcoal mb-1">
                      Full Name <span className="text-curator-coral">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-curator-muted" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={e => {
                          setFullName(e.target.value);
                          if (errors.fullName) setErrors(prev => ({ ...prev, fullName: undefined }));
                        }}
                        placeholder="e.g. Shakhwat hossain rasel"
                        className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-white border text-xs font-mono focus:outline-none transition-all ${
                          errors.fullName ? 'border-curator-rose ring-1 ring-curator-rose' : 'border-curator-border focus:border-curator-coral'
                        }`}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-[11px] text-curator-rose mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Customer Phone */}
                  <div>
                    <label className="block text-xs font-semibold text-curator-charcoal mb-1">
                      Mobile Phone Number <span className="text-curator-coral">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-curator-muted" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => {
                          setPhone(e.target.value);
                          if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                        }}
                        placeholder="e.g. 01540400247"
                        className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-white border text-xs font-mono focus:outline-none transition-all ${
                          errors.phone ? 'border-curator-rose ring-1 ring-curator-rose' : 'border-curator-border focus:border-curator-coral'
                        }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-[11px] text-curator-rose mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.phone}
                      </p>
                    )}
                  </div>

                  {/* Dynamic Delivery Location Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-curator-charcoal mb-1">
                      Delivery Location <span className="text-curator-coral">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label
                        className={`flex items-center gap-2 p-3 rounded-2xl border cursor-pointer transition-all ${
                          city === 'Dhaka'
                            ? 'border-curator-coral bg-curator-coral-light/50 font-semibold'
                            : 'border-curator-border bg-white text-curator-muted'
                        }`}
                      >
                        <input
                          type="radio"
                          name="direct_city"
                          checked={city === 'Dhaka'}
                          onChange={() => setCity('Dhaka')}
                          className="accent-curator-coral"
                        />
                        <span className="text-xs text-curator-charcoal font-medium">Inside Dhaka (৳{insideFee})</span>
                      </label>

                      <label
                        className={`flex items-center gap-2 p-3 rounded-2xl border cursor-pointer transition-all ${
                          city === 'Outside'
                            ? 'border-curator-coral bg-curator-coral-light/50 font-semibold'
                            : 'border-curator-border bg-white text-curator-muted'
                        }`}
                      >
                        <input
                          type="radio"
                          name="direct_city"
                          checked={city === 'Outside'}
                          onChange={() => setCity('Outside')}
                          className="accent-curator-coral"
                        />
                        <span className="text-xs text-curator-charcoal font-medium">Outside Dhaka (৳{outsideFee})</span>
                      </label>
                    </div>
                  </div>

                  {/* Full Address & Postal Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-curator-charcoal mb-1">
                        Shipping Address <span className="text-curator-coral">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-curator-muted" />
                        <textarea
                          rows={2}
                          value={address}
                          onChange={e => {
                            setAddress(e.target.value);
                            if (errors.address) setErrors(prev => ({ ...prev, address: undefined }));
                          }}
                          placeholder="e.g. mahiganj Rangpur"
                          className={`w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border text-xs font-mono focus:outline-none resize-none transition-all ${
                            errors.address ? 'border-curator-rose ring-1 ring-curator-rose' : 'border-curator-border focus:border-curator-coral'
                          }`}
                        />
                      </div>
                      {errors.address && (
                        <p className="text-[11px] text-curator-rose mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.address}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-curator-charcoal mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={e => setPostalCode(e.target.value)}
                        placeholder="5403"
                        className="w-full px-4 py-3 rounded-2xl bg-white border border-curator-border text-xs font-mono focus:outline-none focus:border-curator-coral transition-all"
                      />
                    </div>
                  </div>

                  {/* Order Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-curator-charcoal mb-1">
                      Order Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Special instructions or gift packaging request..."
                      className="w-full px-4 py-2.5 rounded-2xl bg-white border border-curator-border text-xs font-sans focus:outline-none focus:border-curator-coral transition-all"
                    />
                  </div>

                  {/* Live Cost Breakdown Table */}
                  <div className="p-4 rounded-2xl bg-curator-surface-peach/50 border border-curator-border space-y-2 text-xs">
                    <div className="flex justify-between text-curator-muted">
                      <span>Item Subtotal ({quantity} item{quantity > 1 ? 's' : ''}):</span>
                      <span className="font-semibold font-mono text-curator-charcoal">৳{subtotal.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between text-curator-muted">
                      <span>Delivery Fee ({city === 'Dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}):</span>
                      <span className="font-semibold font-mono text-curator-charcoal">
                        {deliveryCharge === 0 ? 'FREE' : `৳${deliveryCharge}`}
                      </span>
                    </div>

                    {appliedDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Voucher Discount:</span>
                        <span className="font-mono">-৳{appliedDiscount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-baseline pt-2 border-t border-curator-border text-sm font-bold text-curator-charcoal">
                      <span>Total Payable:</span>
                      <span className="font-serif text-xl font-bold text-curator-coral">
                        ৳{total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Cash on Delivery Guarantee badge */}
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-curator-border/80 text-[11px] text-curator-muted">
                    <ShieldCheck className="w-4 h-4 text-curator-coral flex-shrink-0" />
                    <span>Cash on Delivery — Inspect your dress before final payment.</span>
                  </div>

                  {/* BIG PROMINENT CORAL SUBMIT BUTTON */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 sm:py-5 px-8 rounded-full bg-curator-coral text-white font-sans text-base font-bold tracking-wide shadow-xl hover:bg-curator-coral-hover hover:shadow-curator-glow active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 group disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Placing Your Order...</span>
                      </div>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5" />
                        <span>Confirm Order — ৳{total.toLocaleString()}</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-curator-muted">
                    <Lock className="w-3 h-3 inline mr-1 text-emerald-600" />
                    100% Encrypted & Safe. Our concierge team will contact you to confirm delivery.
                  </p>
                </form>
              </div>

            </div>
          </div>
        )}
      </div>
    </section>
  );
};
