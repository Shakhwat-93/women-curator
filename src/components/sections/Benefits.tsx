import React from 'react';
import { Sparkles, ShieldCheck, HeartHandshake, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

export const Benefits: React.FC = () => {
  const benefits = [
    {
      icon: Sparkles,
      title: 'Artisanal Craftsmanship',
      description: 'Each piece features hand-guided needlework, mother-of-pearl buttons, and meticulous seam finishing.'
    },
    {
      icon: Eye,
      title: 'Thoughtful Design',
      description: 'Proportions sculpted to drape effortlessly on diverse body silhouettes without compromising comfort.'
    },
    {
      icon: HeartHandshake,
      title: 'Curated Limited Drops',
      description: 'Small-batch production ensuring uniqueness, reducing waste, and guaranteeing premier quality control.'
    },
    {
      icon: ShieldCheck,
      title: 'Guaranteed Satisfaction',
      description: 'Hassle-free 7-day exchanges, transparent door-to-door courier tracking, and dedicated styling support.'
    }
  ];

  return (
    <section id="why-us" className="py-20 sm:py-28 bg-[#FAF5EE] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-curator-surface-peach text-curator-coral text-xs font-semibold uppercase tracking-widest mb-3">
            <span>✦</span>
            <span>The Curator Promise</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-curator-charcoal tracking-tight">
            Why Women Curator
          </h2>

          <p className="text-xs sm:text-sm text-curator-muted mt-3 font-sans leading-relaxed">
            Elevating modern wardrobe essentials through thoughtful design, curated exclusivity, and uncompromised textiles.
          </p>
        </div>

        {/* 4 Benefits Cards with organic micro-shapes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-[#FDFBF7] rounded-[2rem] p-7 border border-curator-border shadow-curator-sm hover:shadow-curator hover:border-curator-coral/30 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-curator-coral-light to-curator-blush-soft/60 text-curator-coral flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="font-serif text-lg font-bold text-curator-charcoal mb-2 group-hover:text-curator-coral transition-colors">
                    {benefit.title}
                  </h3>

                  <p className="text-xs text-curator-muted leading-relaxed font-sans">
                    {benefit.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-curator-border/60 flex items-center text-[11px] font-semibold text-curator-coral uppercase tracking-wider">
                  <span>Standard 0{idx + 1}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
