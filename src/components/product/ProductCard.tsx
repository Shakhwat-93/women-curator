import React, { useState } from 'react';
import { Heart, ArrowRight, Eye, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product, ColorOption } from '../../types';
import { OrganicBackground } from '../common/OrganicBackground';
import { useWishlist } from '../../context/WishlistContext';

interface ProductCardProps {
  product: Product;
  index?: number;
  onQuickView?: (product: Product) => void;
  onDirectOrder?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index = 0,
  onQuickView,
  onDirectOrder
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedColor, setSelectedColor] = useState<ColorOption>(product.colors[0]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const isSaved = isInWishlist(product.id);

  // Derive parametric variant for organic background variation
  const variantIndex = (index % 4) + 1;
  const bgVariant = `card-${variantIndex}` as 'card-1' | 'card-2' | 'card-3' | 'card-4';

  const handleOrderNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDirectOrder) {
      onDirectOrder(product);
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDirectOrder) {
      onDirectOrder(product);
    }
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={() => onQuickView && onQuickView(product)}
      className="group relative bg-[#FDFBF7] rounded-[2rem] p-3.5 sm:p-4 border border-[#EFE5DC] hover:border-curator-blush/60 shadow-curator hover:shadow-curator-lg transition-all duration-400 flex flex-col justify-between cursor-pointer"
    >
      {/* 1. PRODUCT IMAGE STAGE (Matches Reference Card 1:1) */}
      <div className="relative w-full aspect-[4/5] rounded-[1.6rem] overflow-hidden bg-gradient-to-b from-[#FAF5EE] to-[#F7ECE4] flex items-center justify-center select-none">
        {/* Organic Background Composition Layer */}
        <OrganicBackground
          variant={bgVariant}
          showDots={true}
          showArc={true}
          showShadows={true}
          className="scale-[1.02] group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* Top Badges & Actions */}
        <div className="absolute top-3 inset-x-3.5 flex items-center justify-between z-20 pointer-events-auto">
          {/* New Drop Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-sm border border-curator-blush/30">
            <span className="text-curator-coral text-xs">✦</span>
            <span className="text-curator-charcoal text-[11px] font-semibold tracking-wide">
              {product.badge?.replace('✦ ', '') || 'New Drop'}
            </span>
          </div>

          {/* Wishlist Heart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product);
            }}
            aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md shadow-sm ${
              isSaved
                ? 'bg-curator-coral text-white scale-110'
                : 'bg-white/95 text-curator-charcoal hover:text-curator-coral hover:bg-white hover:scale-105'
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${isSaved ? 'fill-current' : ''}`}
            />
          </button>
        </div>

        {/* High-Fashion Model / Product Presentation */}
        <div className="relative w-full h-full flex items-end justify-center z-10 pt-4">
          <motion.img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04] ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-curator-coral/30 border-t-curator-coral animate-spin" />
            </div>
          )}
        </div>

        {/* Quick View Hover Pill overlay */}
        <div className="absolute inset-x-0 bottom-4 flex justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView && onQuickView(product);
            }}
            className="pointer-events-auto inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 text-curator-charcoal hover:text-curator-coral text-xs font-semibold shadow-md backdrop-blur-md transition-all hover:scale-105"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>

        {/* Color Swatches positioned at bottom-left of image stage */}
        <div className="absolute bottom-3 left-3.5 flex items-center gap-1.5 z-20 pointer-events-auto bg-white/60 backdrop-blur-sm p-1 rounded-full border border-white/60">
          {product.colors.map((color) => {
            const isSelected = selectedColor.hex === color.hex;
            return (
              <button
                key={color.hex}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedColor(color);
                }}
                title={color.name}
                aria-label={`Select color ${color.name}`}
                className={`w-4.5 h-4.5 rounded-full transition-transform duration-200 ${
                  isSelected ? 'ring-2 ring-offset-1 ring-curator-coral scale-110' : 'opacity-85 hover:opacity-100 hover:scale-105'
                }`}
                style={{ backgroundColor: color.hex, width: '18px', height: '18px' }}
              />
            );
          })}
        </div>
      </div>

      {/* 2. PRODUCT DETAILS AREA (Matches Reference Typography & Spacing) */}
      <div className="mt-3.5 px-1 flex flex-col justify-between flex-grow">
        {/* Title and Subtitle */}
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-serif text-[1.18rem] leading-snug text-curator-charcoal font-semibold tracking-tight group-hover:text-curator-coral transition-colors duration-200 line-clamp-1">
              {product.name}
            </h3>

            {/* Price (Coral Accent with previous strikethrough) */}
            <div className="text-right flex-shrink-0">
              <span className="text-[1.22rem] font-bold font-serif text-curator-coral tracking-tight">
                ৳{product.price.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-curator-muted font-medium">
              {product.subtitle}
            </p>
            {product.compare_price > product.price && (
              <span className="text-xs text-curator-muted-light line-through font-sans">
                ৳{product.compare_price.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* 3. SIGNATURE SHOP NOW / DIRECT ORDER CTA BUTTON */}
        <div className="mt-4 pt-1 flex items-center gap-2">
          <button
            onClick={handleOrderNow}
            className="flex-1 bg-curator-coral text-white font-sans text-sm font-semibold tracking-wide py-3 px-5 rounded-full shadow-sm hover:shadow-curator-glow hover:bg-curator-coral-hover active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group/btn"
          >
            <span>Shop Now</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </button>

          {/* Quick Select Button */}
          <button
            onClick={handleQuickAdd}
            title="Select & Order"
            className={`p-3 rounded-full border border-curator-border hover:border-curator-coral text-curator-charcoal hover:text-curator-coral hover:bg-curator-coral-light/40 transition-all active:scale-95 ${
              addedAnimation ? 'bg-curator-coral text-white border-curator-coral' : 'bg-white'
            }`}
          >
            {addedAnimation ? <Check className="w-4 h-4" /> : <span className="text-sm font-semibold">+</span>}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
