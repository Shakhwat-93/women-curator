import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingBag, ArrowRight, ShieldCheck, Truck, RefreshCw, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, ColorOption } from '../../types';
import { OrganicBackground } from '../common/OrganicBackground';
import { useWishlist } from '../../context/WishlistContext';
import { track } from '../../tracking';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('M (38)');
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    if (product && isOpen) {
      const initialColor = product.colors[0];
      const initialSize = product.sizes?.[0] || 'M (38)';
      setSelectedColor(initialColor);
      setSelectedSize(initialSize);
      setActiveImage(product.image_url);
      track.viewItem(product, initialColor?.name, initialSize);
    }
  }, [product, isOpen]);

  if (!isOpen || !product || !selectedColor) return null;

  const isSaved = isInWishlist(product.id);

  const handleInstantOrder = () => {
    track.selectItem(product);
    onClose();
    const el = document.getElementById('order-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-curator-charcoal/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl bg-curator-surface rounded-[2.5rem] border border-curator-border shadow-2xl overflow-hidden z-10 my-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-30 p-2.5 rounded-full bg-white/80 hover:bg-white text-curator-charcoal hover:text-curator-coral shadow-sm transition-all"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Left: Product Image Stage with Organic Background */}
            <div className="relative aspect-[4/5] md:aspect-auto bg-gradient-to-b from-curator-bg to-curator-surface-peach p-6 flex flex-col justify-between overflow-hidden">
              <OrganicBackground variant="card-1" showDots={true} showArc={true} />

              {/* Badges */}
              <div className="relative z-10 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-curator-coral text-xs font-semibold shadow-sm">
                  <span>✦</span>
                  {product.badge || 'New Drop'}
                </span>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-2.5 rounded-full backdrop-blur-md shadow-sm transition-all ${
                    isSaved
                      ? 'bg-curator-coral text-white'
                      : 'bg-white/90 text-curator-charcoal hover:text-curator-coral'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Main Model Presentation */}
              <div className="relative z-10 my-auto flex items-center justify-center">
                <img
                  src={activeImage || product.image_url}
                  alt={product.name}
                  className="max-h-[380px] w-auto object-contain drop-shadow-md rounded-2xl transition-all duration-300"
                />
              </div>

              {/* Thumbnails Gallery */}
              {product.gallery && product.gallery.length > 1 && (
                <div className="relative z-10 flex items-center justify-center gap-2 mt-2">
                  {product.gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                        activeImage === img
                          ? 'border-curator-coral scale-105 shadow-sm'
                          : 'border-white/80 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Editorial Product Details & Purchase Actions */}
            <div className="p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[85vh]">
              <div>
                <div className="flex items-center gap-2 text-xs text-curator-coral font-semibold tracking-wider uppercase mb-1">
                  <span>{product.category_name || 'Curated Drop'}</span>
                  <span>•</span>
                  <div className="flex items-center text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="ml-1 text-curator-charcoal font-medium">
                      {product.rating || '4.9'} ({product.reviews_count || '32'} reviews)
                    </span>
                  </div>
                </div>

                <h2 className="font-serif text-2xl md:text-3xl text-curator-charcoal font-bold tracking-tight">
                  {product.name}
                </h2>

                <p className="text-sm text-curator-muted mt-1 font-medium">
                  {product.subtitle}
                </p>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 mt-4 pb-4 border-b border-curator-border">
                  <span className="font-serif text-3xl font-bold text-curator-coral">
                    ৳{product.price.toLocaleString()}
                  </span>
                  {product.compare_price > product.price && (
                    <span className="text-base text-curator-muted line-through">
                      ৳{product.compare_price.toLocaleString()}
                    </span>
                  )}
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-curator-coral-light text-curator-coral font-semibold ml-auto">
                    Save {Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}%
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs sm:text-sm text-curator-charcoal/80 leading-relaxed mt-4">
                  {product.description}
                </p>

                {/* Color Selector */}
                <div className="mt-5">
                  <label className="text-xs font-bold text-curator-charcoal uppercase tracking-wider block mb-2">
                    Color: <span className="font-normal text-curator-muted">{selectedColor.name}</span>
                  </label>
                  <div className="flex items-center gap-2.5">
                    {product.colors.map(color => (
                      <button
                        key={color.hex}
                        onClick={() => setSelectedColor(color)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                          selectedColor.hex === color.hex
                            ? 'border-curator-coral bg-curator-coral-light/50 text-curator-charcoal shadow-sm'
                            : 'border-curator-border hover:border-curator-muted text-curator-muted'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full inline-block border border-black/10"
                          style={{ backgroundColor: color.hex }}
                        />
                        {color.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Selector */}
                <div className="mt-5">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-curator-charcoal uppercase tracking-wider">
                      Select Size
                    </label>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {(product.sizes || ['S (36)', 'M (38)', 'L (40)', 'XL (42)']).map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                          selectedSize === size
                            ? 'bg-curator-charcoal text-white border-curator-charcoal shadow-sm'
                            : 'bg-white hover:bg-curator-surface-peach text-curator-charcoal border-curator-border'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-4 border-t border-curator-border space-y-2.5">
                <button
                  onClick={handleInstantOrder}
                  className="w-full bg-curator-coral text-white font-sans text-sm font-bold tracking-wide py-4 px-6 rounded-full shadow-md hover:bg-curator-coral-hover hover:shadow-curator-glow active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>এখনই অর্ডার করুন — ৳{product.price.toLocaleString()}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Trust mini icons */}
                <div className="grid grid-cols-3 gap-2 pt-3 text-center text-[11px] text-curator-muted">
                  <div className="flex flex-col items-center gap-1">
                    <Truck className="w-4 h-4 text-curator-coral" />
                    <span>ক্যাশ অন ডেলিভারি</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-curator-coral" />
                    <span>১০০% প্রিমিয়াম কোয়ালিটি</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <RefreshCw className="w-4 h-4 text-curator-coral" />
                    <span>সহজ ৭ দিনের এক্সচেঞ্জ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
