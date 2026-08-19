import React from 'react';
import { SEED_TESTIMONIALS } from '../../data/seedData';
import { Star, Quote, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-20 sm:py-28 bg-[#F6EFE6] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-curator-coral text-xs font-semibold uppercase tracking-widest mb-3 shadow-sm">
            <span>✦</span>
            <span>Voices of the Muse</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-curator-charcoal tracking-tight">
            Curated by Her, Loved by You
          </h2>

          <p className="text-xs sm:text-sm text-curator-muted mt-3 font-sans leading-relaxed">
            Real impressions from contemporary fashion enthusiasts, creatives, and stylists.
          </p>
        </div>

        {/* 3 Testimonials Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {SEED_TESTIMONIALS.map((testimonial, idx) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="bg-[#FDFBF7] rounded-[2.2rem] p-7 sm:p-8 border border-curator-border shadow-curator flex flex-col justify-between relative overflow-hidden"
            >
              <div className="relative z-10">
                {/* Rating stars */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-amber-500 gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-curator-blush/40" />
                </div>

                {/* Comment */}
                <p className="font-serif italic text-sm sm:text-base text-curator-charcoal leading-relaxed">
                  "{testimonial.comment}"
                </p>
              </div>

              {/* Author & Product */}
              <div className="mt-8 pt-4 border-t border-curator-border flex items-center gap-3.5 relative z-10">
                <img
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-curator-blush/60 flex-shrink-0"
                />
                <div>
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-curator-charcoal flex items-center gap-1.5">
                    <span>{testimonial.name}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </h4>
                  <p className="text-[11px] text-curator-muted">
                    {testimonial.role} • {testimonial.location}
                  </p>
                  <p className="text-[10px] text-curator-coral font-medium mt-0.5">
                    Purchased: {testimonial.productBought}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
