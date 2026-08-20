import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { OrganicBackground } from '../common/OrganicBackground';

interface EditorialSpreadProps {
  onExplore: () => void;
}

export const EditorialSpread: React.FC<EditorialSpreadProps> = ({ onExplore }) => {
  return (
    <section id="editorial" className="py-20 sm:py-28 bg-[#FAF5EE] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
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
                  alt="Women Curator Look"
                  className="w-full h-[450px] sm:h-[520px] object-cover object-top transform hover:scale-[1.03] transition-transform duration-1000 ease-out"
                />
              </div>

              {/* Floating Quote Stamp */}
              <div className="absolute bottom-10 right-10 z-20 max-w-xs bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-curator-blush/40 shadow-xl hidden sm:block">
                <div className="flex items-center gap-1.5 text-curator-coral mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold tracking-wider uppercase font-sans">Our Mission</span>
                </div>
                <p className="font-serif italic text-xs text-curator-charcoal leading-relaxed">
                  "Making everyday fashion effortlessly beautiful, stylish, and comfortable."
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Official Brand Description (5 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 space-y-5 lg:pl-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-curator-surface-peach text-curator-coral text-xs font-semibold uppercase tracking-widest border border-curator-border">
              <span>✦</span>
              <span>The Brand Story</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase tracking-[0.25em] text-curator-muted font-bold block">
                Modern Elegance
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-curator-charcoal leading-[1.05] tracking-tight">
                WOMEN <br />
                <span className="text-curator-coral font-serif italic">CURATOR</span>
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-curator-charcoal/90 leading-relaxed font-sans font-medium">
              Women Curator is a fashion brand dedicated to bringing modern women stylish, elegant, and comfortable clothing at affordable prices.
            </p>

            <p className="text-xs sm:text-sm text-curator-muted leading-relaxed font-sans">
              We carefully curate trendy designs with quality fabrics and thoughtful details, making everyday fashion effortlessly beautiful.
            </p>

            {/* 4 Brand Pillars Mini List */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-curator-border">
                <span className="text-xs font-bold text-curator-coral font-serif block">Style</span>
                <span className="text-[11px] text-curator-muted">Trendy & Elegant</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-curator-border">
                <span className="text-xs font-bold text-curator-coral font-serif block">Comfort</span>
                <span className="text-[11px] text-curator-muted">Relaxed Fit</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-curator-border">
                <span className="text-xs font-bold text-curator-coral font-serif block">Quality</span>
                <span className="text-[11px] text-curator-muted">Premium Fabrics</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#FDFBF7] border border-curator-border">
                <span className="text-xs font-bold text-curator-coral font-serif block">Affordability</span>
                <span className="text-[11px] text-curator-muted">Great Value</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onExplore}
                className="bg-curator-coral text-white font-sans text-sm font-bold tracking-wide py-3.5 px-7 rounded-full shadow-lg hover:shadow-curator-glow hover:bg-curator-coral-hover active:scale-[0.98] transition-all flex items-center gap-2 group"
              >
                <span>Direct Order Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
