import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  ShoppingBag,
  Sparkles,
  User,
  Phone,
  MapPin,
  Tag,
  Trash2,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Product, ColorOption, DeliverySettings, Order } from '../../types';
import { orderService } from '../../lib/api';
import { OrganicBackground } from '../common/OrganicBackground';
import { track } from '../../tracking';

export interface OrderItemSelection {
  productId: string;
  product: Product;
  selectedColor: ColorOption;
  selectedSize: string;
  quantity: number;
}

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
  // Multi-item Cart / Selected Garments State
  const [orderItems, setOrderItems] = useState<OrderItemSelection[]>(() => {
    const initialColor = selectedProduct?.colors?.[0] || { name: 'Signature', hex: '#DE4F3C' };
    const initialSize = selectedProduct?.sizes?.[0] || 'M (38)';
    return [
      {
        productId: selectedProduct.id,
        product: selectedProduct,
        selectedColor: initialColor,
        selectedSize: initialSize,
        quantity: 1
      }
    ];
  });

  // Customer Destination Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState<'Dhaka' | 'Outside'>('Dhaka');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');

  // Form Submission States
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string; address?: string; items?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<{ orderNumber: string; total: number; items: OrderItemSelection[] } | null>(null);

  // Sync when parent selects a product from outside (e.g. clicking 'Order Now' on a specific card)
  useEffect(() => {
    if (!selectedProduct) return;
    setOrderItems(prev => {
      const exists = prev.some(item => item.productId === selectedProduct.id);
      if (exists) return prev;
      const initialColor = selectedProduct.colors?.[0] || { name: 'Signature', hex: '#DE4F3C' };
      const initialSize = selectedProduct.sizes?.[0] || 'M (38)';
      return [
        ...prev,
        {
          productId: selectedProduct.id,
          product: selectedProduct,
          selectedColor: initialColor,
          selectedSize: initialSize,
          quantity: 1
        }
      ];
    });
  }, [selectedProduct]);

  // Add / Toggle Product from Grid
  const handleToggleProduct = (prod: Product) => {
    onSelectProduct(prod);
    setOrderItems(prev => {
      const existsIndex = prev.findIndex(item => item.productId === prod.id);
      if (existsIndex >= 0) {
        // If already selected, do not remove if it's the only one
        if (prev.length === 1) return prev;
        return prev.filter(item => item.productId !== prod.id);
      } else {
        const initialColor = prod.colors?.[0] || { name: 'Signature', hex: '#DE4F3C' };
        const initialSize = prod.sizes?.[0] || 'M (38)';
        return [
          ...prev,
          {
            productId: prod.id,
            product: prod,
            selectedColor: initialColor,
            selectedSize: initialSize,
            quantity: 1
          }
        ];
      }
    });
    if (errors.items) {
      setErrors(prev => ({ ...prev, items: undefined }));
    }
  };

  // Update Item Options
  const updateItemQuantity = (productId: string, delta: number) => {
    setOrderItems(prev =>
      prev.map(item => {
        if (item.productId !== productId) return item;
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      })
    );
  };

  const updateItemColor = (productId: string, color: ColorOption) => {
    setOrderItems(prev =>
      prev.map(item => (item.productId === productId ? { ...item, selectedColor: color } : item))
    );
  };

  const updateItemSize = (productId: string, size: string) => {
    setOrderItems(prev =>
      prev.map(item => (item.productId === productId ? { ...item, selectedSize: size } : item))
    );
  };

  const removeItem = (productId: string) => {
    if (orderItems.length <= 1) {
      alert('Please keep at least 1 garment in your order.');
      return;
    }
    setOrderItems(prev => prev.filter(item => item.productId !== productId));
  };

  // Dynamic Delivery Calculations from CMS
  const insideFee = deliverySettings?.inside_dhaka_fee ?? 80;
  const outsideFee = deliverySettings?.outside_dhaka_fee ?? 150;
  const freeThreshold = deliverySettings?.free_delivery_threshold ?? 2500;

  const totalItemsCount = orderItems.reduce((sum, it) => sum + it.quantity, 0);
  const subtotal = orderItems.reduce((sum, it) => sum + it.product.price * it.quantity, 0);
  const isFreeDelivery = subtotal >= freeThreshold;
  const deliveryCharge = isFreeDelivery ? 0 : city === 'Dhaka' ? insideFee : outsideFee;
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
    const errs: { fullName?: string; phone?: string; address?: string; items?: string } = {};
    if (orderItems.length === 0) {
      errs.items = 'Please select at least 1 garment to place an order.';
    }
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
        items: orderItems.map(item => ({
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
          total: total,
          items: orderItems
        });

        try {
          confetti({
            particleCount: 100,
            spread: 80,
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-curator-coral text-white text-xs font-bold uppercase tracking-widest mb-3 shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Direct Express Multi-Item Checkout</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-curator-charcoal tracking-tight">
            Order Your Signature Piece(s)
          </h2>

          <p className="text-xs sm:text-sm text-curator-muted mt-2 font-sans">
            {deliverySettings?.delivery_note || 'Select multiple garments, customize your sizes & colors. Cash on Delivery across Bangladesh.'}
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

            {/* Customer Destination & Items Snapshot Card */}
            <div className="mt-6 p-5 rounded-2xl bg-[#FAF5EE]/70 border border-curator-border text-left shadow-sm space-y-3.5">
              <h4 className="text-xs font-bold text-curator-charcoal uppercase tracking-wider border-b border-curator-border/80 pb-2">
                Ordered Garments ({orderCompleted.items.length})
              </h4>

              <div className="space-y-2">
                {orderCompleted.items.map((it, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-curator-border/40 last:border-none">
                    <div className="flex items-center gap-2.5">
                      <img src={it.product.image_url} alt={it.product.name} className="w-9 h-11 object-cover rounded-lg" />
                      <div>
                        <h5 className="font-bold text-curator-charcoal">{it.product.name}</h5>
                        <span className="text-[11px] text-curator-muted font-mono">{it.selectedColor.name} • {it.selectedSize} • Qty: {it.quantity}</span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-curator-coral">৳{(it.product.price * it.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-curator-border text-xs space-y-1">
                <div className="flex items-center gap-2 text-curator-charcoal font-medium">
                  <User className="w-3.5 h-3.5 text-curator-muted" />
                  <span>{fullName}</span>
                </div>
                <div className="flex items-center gap-2 text-curator-charcoal font-mono text-xs">
                  <Phone className="w-3.5 h-3.5 text-curator-muted" />
                  <span>{phone}</span>
                </div>
                <div className="flex items-start gap-2 text-curator-charcoal text-xs">
                  <MapPin className="w-3.5 h-3.5 text-curator-coral flex-shrink-0 mt-0.5" />
                  <span>{address} ({city})</span>
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
                setNotes('');
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
              
              {/* Left Column: Multi-Product Selection & Customizers (6 cols) */}
              <div className="lg:col-span-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal">
                      1. Select Garments ({orderItems.length} Selected)
                    </label>
                    <span className="text-[11px] text-curator-coral font-medium">
                      Tap dresses to add / remove
                    </span>
                  </div>
                  
                  {/* Product Cards Selector Gallery */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1 pb-1">
                    {products.filter(p => p.status !== 'archived' && p.is_active !== false).map((prod) => {
                      const isSelected = orderItems.some(it => it.productId === prod.id);
                      const currentItem = orderItems.find(it => it.productId === prod.id);

                      return (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => handleToggleProduct(prod)}
                          className={`relative flex flex-col p-2 rounded-2xl border text-left transition-all group ${
                            isSelected
                              ? 'border-curator-coral bg-curator-coral-light/50 shadow-sm ring-1 ring-curator-coral'
                              : 'border-curator-border bg-white hover:border-curator-muted/80'
                          }`}
                        >
                          {/* Selection Check Badge */}
                          <div
                            className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold z-10 transition-all ${
                              isSelected
                                ? 'bg-curator-coral text-white shadow-xs'
                                : 'bg-white/80 border border-curator-border text-transparent group-hover:text-curator-muted'
                            }`}
                          >
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>

                          <div className="w-full h-24 rounded-xl overflow-hidden bg-curator-surface-peach mb-2">
                            <img
                              src={prod.image_url}
                              alt={prod.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>

                          <h4 className="font-serif text-xs font-bold text-curator-charcoal line-clamp-1">
                            {prod.name}
                          </h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-serif font-bold text-curator-coral text-xs">
                              ৳{prod.price.toLocaleString()}
                            </span>
                            {isSelected && currentItem && currentItem.quantity > 1 && (
                              <span className="text-[10px] font-mono font-bold text-curator-charcoal bg-white/90 px-1.5 py-0.2 rounded-full border border-curator-border">
                                x{currentItem.quantity}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Garments Customizer Cards */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-curator-charcoal block">
                      Customize Size & Color per Item
                    </span>
                    <span className="text-[11px] text-curator-muted font-mono">
                      {orderItems.length} Garment{orderItems.length > 1 ? 's' : ''} in Bag
                    </span>
                  </div>

                  <AnimatePresence>
                    {orderItems.map((item) => (
                      <motion.div
                        key={item.productId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-4 rounded-2xl bg-white border border-curator-border shadow-xs space-y-3 relative"
                      >
                        {/* Item Header & Delete */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="w-12 h-14 object-cover rounded-xl bg-curator-surface-peach flex-shrink-0"
                            />
                            <div>
                              <h4 className="font-serif text-sm font-bold text-curator-charcoal line-clamp-1">
                                {item.product.name}
                              </h4>
                              <span className="font-serif font-bold text-curator-coral text-xs">
                                ৳{item.product.price.toLocaleString()} each
                              </span>
                            </div>
                          </div>

                          {orderItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItem(item.productId)}
                              className="p-1.5 rounded-full text-curator-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Color Selector */}
                        {item.product.colors && item.product.colors.length > 0 && (
                          <div className="pt-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-curator-muted block mb-1.5 font-mono">
                              Color: <strong className="text-curator-charcoal font-sans">{item.selectedColor.name}</strong>
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {item.product.colors.map(color => (
                                <button
                                  key={color.hex}
                                  type="button"
                                  onClick={() => updateItemColor(item.productId, color)}
                                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-all ${
                                    item.selectedColor.hex === color.hex
                                      ? 'border-curator-coral bg-curator-coral text-white shadow-xs'
                                      : 'border-curator-border bg-[#FAF5EE]/60 text-curator-charcoal hover:border-curator-muted'
                                  }`}
                                >
                                  <span
                                    className="w-2.5 h-2.5 rounded-full inline-block border border-white/40"
                                    style={{ backgroundColor: color.hex }}
                                  />
                                  <span>{color.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Size Selector & Quantity Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-curator-border/60">
                          {/* Size */}
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-curator-muted block mb-1 font-mono">
                              Size
                            </span>
                            <div className="flex gap-1">
                              {(item.product.sizes && item.product.sizes.length > 0
                                ? item.product.sizes
                                : ['S (36)', 'M (38)', 'L (40)', 'XL (42)']
                              ).map(sz => (
                                <button
                                  key={sz}
                                  type="button"
                                  onClick={() => updateItemSize(item.productId, sz)}
                                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold border transition-all text-center ${
                                    item.selectedSize === sz
                                      ? 'bg-curator-charcoal text-white border-curator-charcoal shadow-xs'
                                      : 'bg-[#FAF5EE]/60 text-curator-charcoal border-curator-border hover:bg-white'
                                  }`}
                                >
                                  {sz.split(' ')[0]}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Quantity */}
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-curator-muted block mb-1 font-mono">
                              Quantity
                            </span>
                            <div className="flex items-center justify-between border border-curator-border rounded-xl bg-[#FAF5EE]/60 p-0.5">
                              <button
                                type="button"
                                onClick={() => updateItemQuantity(item.productId, -1)}
                                className="w-7 h-7 rounded-lg text-curator-charcoal hover:bg-white flex items-center justify-center font-bold"
                              >
                                -
                              </button>
                              <span className="font-mono font-bold text-xs text-curator-charcoal">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateItemQuantity(item.productId, 1)}
                                className="w-7 h-7 rounded-lg text-curator-charcoal hover:bg-white flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Promo Code Box */}
                <div className="p-4 rounded-2xl bg-white border border-curator-border shadow-xs">
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-curator-muted" />
                      <input
                        type="text"
                        value={promoCode}
                        onChange={e => setPromoCode(e.target.value)}
                        placeholder="PROMO CODE (CURATOR10)"
                        className="w-full pl-9 pr-3 py-2.5 rounded-full border border-curator-border bg-[#FAF5EE]/50 text-xs font-mono uppercase focus:outline-none focus:border-curator-coral"
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
                    <p className={`text-[11px] mt-1.5 font-medium ${appliedDiscount > 0 ? 'text-emerald-600' : 'text-curator-rose'}`}>
                      {promoMessage}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Customer Destination & Live Checkout (6 cols) */}
              <div className="lg:col-span-6 space-y-6">
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
                        placeholder="Enter your full name"
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
                        placeholder="01XXXXXXXXX"
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
                          placeholder="House/Flat #, Road/Street, Area, District/Thana"
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
                        placeholder="e.g. 1205"
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

                  {/* Live Multi-Item Cost Breakdown Table */}
                  <div className="p-4 rounded-2xl bg-curator-surface-peach/50 border border-curator-border space-y-2 text-xs">
                    <div className="flex justify-between text-curator-muted">
                      <span>Items Subtotal ({totalItemsCount} item{totalItemsCount > 1 ? 's' : ''}):</span>
                      <span className="font-semibold font-mono text-curator-charcoal">৳{subtotal.toLocaleString()}</span>
                    </div>

                    {/* Breakdown per item preview */}
                    <div className="py-1 border-y border-curator-border/50 space-y-1">
                      {orderItems.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-[11px] text-curator-muted font-mono">
                          <span className="truncate max-w-[200px]">{it.product.name} ({it.selectedSize}) x{it.quantity}</span>
                          <span>৳{(it.product.price * it.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between text-curator-muted">
                      <span>Delivery Fee ({city === 'Dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}):</span>
                      <span className="font-semibold font-mono text-curator-charcoal">
                        {deliveryCharge === 0 ? 'FREE (Threshold met)' : `৳${deliveryCharge}`}
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
                    <span>Cash on Delivery — Inspect all garments upon delivery before payment.</span>
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
                        <span>Confirm Order ({totalItemsCount} Piece{totalItemsCount > 1 ? 's' : ''}) — ৳{total.toLocaleString()}</span>
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
