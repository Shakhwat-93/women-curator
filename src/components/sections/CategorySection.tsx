import React from 'react';
import { SEED_CATEGORIES } from '../../data/seedData';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { OrganicBackground } from '../common/OrganicBackground';

interface CategorySectionProps {
  onSelectCategory?: (slug: string) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({ onSelectCategory }) => {
  return (
    <section id="categories" className="py-20 sm:py-28 bg-[#F6EFE6] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-curator-coral text-xs font-semibold uppercase tracking-widest mb-3">
              <Sparkles className="w-3 h-3" />
              <span>Curation Portfolio</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-curator-charcoal tracking-tight">
              Curated Collections
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-curator-muted max-w-md font-sans leading-relaxed">
            Explore curated design capsules designed for multifaceted occasions — from everyday luxury to high-profile evenings.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SEED_CATEGORIES.map((cat, idx) => {
            const bgVariant = `card-${(idx % 4) + 1}` as 'card-1' | 'card-2' | 'card-3' | 'card-4';
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                onClick={() => onSelectCategory && onSelectCategory(cat.slug)}
                className="group relative bg-[#FDFBF7] rounded-[2.2rem] p-4 border border-curator-border hover:border-curator-coral/40 shadow-curator hover:shadow-curator-lg transition-all duration-400 cursor-pointer flex flex-col justify-between overflow-hidden"
              >
                {/* Artwork Area with Organic Backdrop */}
                <div className="relative w-full aspect-[4/5] rounded-[1.8rem] overflow-hidden bg-curator-surface-peach flex items-end justify-center">
                  <OrganicBackground variant={bgVariant} showDots={true} showArc={true} />

                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="relative z-10 w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Badge */}
                  <div className="absolute top-3.5 left-3.5 z-20 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[11px] font-bold text-curator-charcoal shadow-sm">
                    {cat.itemCount} Designs
                  </div>
                </div>

                {/* Content */}
                <div className="mt-4 px-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-bold text-curator-charcoal group-hover:text-curator-coral transition-colors">
                      {cat.name}
                    </h3>
                    <div className="w-8 h-8 rounded-full bg-curator-surface-peach text-curator-coral group-hover:bg-curator-coral group-hover:text-white flex items-center justify-center transition-all duration-300">
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                  <p className="text-xs text-curator-muted mt-1 line-clamp-2 leading-relaxed">
                    {cat.tagline}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
