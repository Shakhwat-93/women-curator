import React from 'react';
import { Product } from '../../types';
import { ProductCard } from '../product/ProductCard';
import { ProductCardSkeleton } from '../common/LoadingSkeleton';
import { Sparkles, ArrowRight } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  onQuickView: (product: Product) => void;
  onDirectOrder: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  onQuickView,
  onDirectOrder
}) => {
  // Only show active products
  const activeProducts = products.filter(p => p.status !== 'archived' && p.is_active !== false);

  return (
    <section id="products" className="py-16 sm:py-24 bg-[#FAF5EE] relative overflow-hidden">
      {/* Decorative subtle ambient glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-curator-blush/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-curator-coral/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/80 border border-curator-border text-curator-coral text-xs font-semibold uppercase tracking-widest mb-3 shadow-curator-sm">
            <Sparkles className="w-3 h-3 text-curator-coral" />
            <span>Curated Drops</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-curator-charcoal tracking-tight">
            New Collection
          </h2>

          <p className="text-xs sm:text-sm text-curator-muted font-sans mt-3 max-w-md mx-auto leading-relaxed">
            Exclusive tunics and fashion drops crafted with signature embroidery, fluted cuts, and effortless modern drapery.
          </p>
        </div>

        {/* Responsive Product Grid — Displays ALL Active Products */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-6 lg:gap-7">
            {[0, 1, 2, 3].map(i => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-6 lg:gap-7">
            {activeProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                index={idx}
                onQuickView={onQuickView}
                onDirectOrder={onDirectOrder}
              />
            ))}
          </div>
        )}

        {/* Bottom Banner Strip */}
        <div className="mt-14 p-6 sm:p-8 rounded-[2rem] bg-gradient-to-r from-[#FCEEE8] via-[#FAF5EE] to-[#FCEEE8] border border-curator-border flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-curator-coral text-white font-serif flex items-center justify-center font-bold text-lg flex-shrink-0">
              ✦
            </span>
            <div>
              <h4 className="font-serif text-base font-bold text-curator-charcoal">
                Need Help Selecting Your Size or Color?
              </h4>
              <p className="text-xs text-curator-muted font-sans">
                Our fashion concierge is available for instant WhatsApp consultation and custom size measurements.
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/8801540400247"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-curator-charcoal text-white text-xs font-semibold hover:bg-curator-coral transition-colors flex-shrink-0"
          >
            <span>WhatsApp Stylist</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};
