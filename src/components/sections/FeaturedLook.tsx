import React from 'react';
import { ArrowRight, Star, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';
import { OrganicBackground } from '../common/OrganicBackground';

interface FeaturedLookProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const FeaturedLook: React.FC<FeaturedLookProps> = ({ product, onQuickView }) => {
  const scrollToOrder = () => {
    const el = document.getElementById('order-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="featured" className="py-16 sm:py-24 bg-[#F6EFE6] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-[#FDFBF7] rounded-[3rem] p-6 sm:p-10 lg:p-12 border border-curator-border shadow-2xl relative overflow-hidden">
          {/* Organic Backdrop */}
          <OrganicBackground variant="banner" showDots={true} showArc={true} showShadows={true} />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Model Showcase (6 cols) */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              <div className="relative w-full max-w-md rounded-[2.5rem] overflow-hidden bg-gradient-to-b from-curator-bg to-curator-surface-peach p-4 shadow-xl">
                <img
                  src="/assets/model-black-banner.jpg"
                  alt="Spotlight Model — Monochrome Cuff Noir Tunic"
                  className="w-full h-[450px] sm:h-[520px] object-cover object-top rounded-[2rem] transform hover:scale-[1.02] transition-transform duration-700"
                />

                {/* Overlaid Badges */}
                <div className="absolute top-8 left-8 px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md shadow-md text-xs font-bold text-curator-charcoal font-serif">
                  ✦ Spotlight Look of the Week
                </div>
              </div>
            </div>

            {/* Right: Look Information & Purchase (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-curator-coral-light text-curator-coral text-xs font-semibold uppercase tracking-wider">
                <span>Featured Runway Piece</span>
              </div>

              <div>
                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-curator-charcoal tracking-tight leading-tight">
                  Monochrome Cuff <br />
                  <span className="text-curator-coral">Noir Tunic</span>
                </h2>

                <p className="text-xs sm:text-sm text-curator-muted font-medium mt-1">
                  Geometric heritage cuff embroidery with relaxed drapery
                </p>
              </div>

              {/* Price & Rating */}
              <div className="flex items-center gap-4 py-2 border-y border-curator-border">
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-3xl font-bold text-curator-coral">
                    ৳1,750
                  </span>
                  <span className="text-sm text-curator-muted line-through font-sans">
                    ৳2,450
                  </span>
                </div>
                <div className="h-6 w-px bg-curator-border" />
                <div className="flex items-center text-amber-500 text-xs font-semibold">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="ml-1 text-curator-charcoal">5.0 (24 Verified Reviews)</span>
                </div>
              </div>

              {/* Fabric Specs */}
              <p className="text-xs sm:text-sm text-curator-charcoal/80 leading-relaxed font-sans">
                Tailored in jet-black premium georgette, this tunic delivers a bold contrast statement with intricate black-and-white patterned sleeve cuffs and high split side hems. Perfect for sophisticated daily elegance.
              </p>

              {/* Features list */}
              <div className="grid grid-cols-2 gap-2 text-xs text-curator-charcoal font-medium">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-curator-coral/10 text-curator-coral flex items-center justify-center text-[10px]">✓</span>
                  <span>Lightweight Georgette</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-curator-coral/10 text-curator-coral flex items-center justify-center text-[10px]">✓</span>
                  <span>Handcrafted Cuffs</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-curator-coral/10 text-curator-coral flex items-center justify-center text-[10px]">✓</span>
                  <span>Relaxed Flare Fit</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-curator-coral/10 text-curator-coral flex items-center justify-center text-[10px]">✓</span>
                  <span>7-Day Return Guarantee</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={scrollToOrder}
                  className="bg-curator-coral text-white font-sans text-sm font-semibold tracking-wide py-4 px-8 rounded-full shadow-lg hover:shadow-curator-glow hover:bg-curator-coral-hover active:scale-[0.98] transition-all flex items-center gap-2 group"
                >
                  <span>সরাসরি অর্ডার করুন — ৳১,৭৫০</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => onQuickView(product)}
                  className="py-4 px-6 rounded-full bg-white border border-curator-border text-curator-charcoal hover:text-curator-coral hover:border-curator-coral text-xs font-semibold transition-all flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-curator-coral" />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
