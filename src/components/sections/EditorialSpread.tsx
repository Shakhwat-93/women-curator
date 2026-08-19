import React from 'react';
import { ArrowRight, Sparkles, Feather, Gem } from 'lucide-react';
import { motion } from 'framer-motion';
import { OrganicBackground } from '../common/OrganicBackground';

interface EditorialSpreadProps {
  onExplore: () => void;
}

export const EditorialSpread: React.FC<EditorialSpreadProps> = ({ onExplore }) => {
  return (
    <section id="editorial" className="py-24 sm:py-32 bg-[#FAF5EE] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Asymmetric Large Fashion Showcase (7 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 relative"
          >
            <div className="relative rounded-[3rem] overflow-hidden bg-[#F8ECE4] border border-curator-border shadow-2xl p-4 sm:p-6">
              <OrganicBackground variant="editorial" showDots={true} showArc={true} showShadows={true} />

              <div className="relative z-10 rounded-[2.2rem] overflow-hidden">
                <img
                  src="/assets/model-magenta-banner.jpg"
                  alt="Editorial Look — Women Curator"
                  className="w-full h-[480px] sm:h-[560px] object-cover object-top transform hover:scale-[1.03] transition-transform duration-1000 ease-out"
                />
              </div>

              {/* Floating Quote Stamp */}
              <div className="absolute bottom-10 right-10 z-20 max-w-xs bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-curator-blush/40 shadow-xl hidden sm:block">
                <div className="flex items-center gap-1.5 text-curator-coral mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold tracking-wider uppercase font-sans">Craft Philosophy</span>
                </div>
                <p className="font-serif italic text-xs text-curator-charcoal leading-relaxed">
                  "Every pleat and contour is calculated to flatter naturally without constriction."
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Editorial Magazine Narrative (5 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 space-y-6 lg:pl-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-curator-surface-peach text-curator-coral text-xs font-semibold uppercase tracking-widest border border-curator-border">
              <span>✦</span>
              <span>Editorial Series No. 04</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase tracking-[0.25em] text-curator-muted font-bold block">
                The Master Collection
              </span>
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-curator-charcoal leading-[1.05] tracking-tight">
                CURATED <br />
                <span className="text-curator-coral font-serif italic">FOR HER</span>
              </h2>
            </div>

            <p className="font-serif text-lg sm:text-xl text-curator-charcoal/90 italic leading-snug">
              "Pieces designed to make everyday dressing feel extraordinary."
            </p>

            <p className="text-xs sm:text-sm text-curator-muted leading-relaxed font-sans">
              Women Curator was conceived at the intersection of haute couture aesthetics and everyday practicality. We celebrate effortless elegance through tailored silhouettes that breathe with modern confidence.
            </p>

            {/* Pillar highlights */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-curator-coral-light text-curator-coral flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Feather className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-curator-charcoal">Artisanal Modal & Breathable Silks</h4>
                  <p className="text-[11px] text-curator-muted">Weightless drapes that stay wrinkle-resistant from day to night.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-curator-coral-light text-curator-coral flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Gem className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-curator-charcoal">Handcrafted Neckline Threadwork</h4>
                  <p className="text-[11px] text-curator-muted">Intricate flora and geometric border motifs embroidered by master artisans.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={onExplore}
                className="bg-curator-coral text-white font-sans text-sm font-semibold tracking-wide py-4 px-8 rounded-full shadow-lg hover:shadow-curator-glow hover:bg-curator-coral-hover active:scale-[0.98] transition-all flex items-center gap-2.5 group"
              >
                <span>Explore Collection</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
