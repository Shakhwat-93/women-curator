import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Product } from '../../types';

interface StickyMobileOrderBarProps {
  currentProduct: Product;
  onOrderClick: () => void;
}

export const StickyMobileOrderBar: React.FC<StickyMobileOrderBarProps> = ({
  currentProduct,
  onOrderClick
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled past 250px
      setIsVisible(window.scrollY > 250);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 p-3 bg-white/95 backdrop-blur-md border-t border-curator-border shadow-2xl lg:hidden">
      <div className="flex items-center justify-between gap-3 max-w-md mx-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={currentProduct.image_url}
            alt={currentProduct.name}
            className="w-10 h-12 object-cover rounded-lg bg-curator-bg flex-shrink-0"
          />
          <div className="min-w-0">
            <h4 className="font-serif text-xs font-bold text-curator-charcoal truncate">
              {currentProduct.name}
            </h4>
            <span className="font-serif font-bold text-curator-coral text-sm">
              ৳{currentProduct.price.toLocaleString()}
            </span>
          </div>
        </div>

        <button
          onClick={onOrderClick}
          className="flex-1 py-3 px-5 rounded-full bg-curator-coral text-white font-sans text-xs font-bold shadow-lg hover:bg-curator-coral-hover active:scale-95 transition-all flex items-center justify-center gap-1.5"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Order Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
