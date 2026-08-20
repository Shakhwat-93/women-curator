import React from 'react';
import { Star, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Testimonial } from '../../types';

interface TestimonialsProps {
  testimonials?: Testimonial[];
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    customer_name: 'Ayesha Siddika',
    city: 'Dhaka',
    review: 'অর্ডারের পরের দিনই ডেলিভারি পেয়েছি। ফেব্রিকের কোয়ালিটি এবং জামার ফিটিং এক কথায় অসাধারণ! বিশেষ করে হাতা ও গলার সুতার কাজ খুবই নিখুঁত।',
    rating: 5.0,
    is_featured: true,
    is_active: true,
    sort_order: 1
  },
  {
    id: '2',
    customer_name: 'Nusrat Jahan',
    city: 'Chittagong',
    review: 'The fabric is so breathable and luxurious. Exactly as shown in the photoshoot. Will definitely order from the next drop as well!',
    rating: 5.0,
    is_featured: true,
    is_active: true,
    sort_order: 2
  },
  {
    id: '3',
    customer_name: 'Samira Rahman',
    city: 'Sylhet',
    review: 'ক্যাশ অন ডেলিভারিতে চেক করে নেওয়ার সুযোগ থাকায় নির্ভয়ে অর্ডার করেছিলাম। কালার ও ফিটিং পারফেক্ট। ১০০% রেকমেন্ডেড!',
    rating: 5.0,
    is_featured: true,
    is_active: true,
    sort_order: 3
  }
];

export const Testimonials: React.FC<TestimonialsProps> = ({ testimonials = DEFAULT_TESTIMONIALS }) => {
  const activeReviews = testimonials && testimonials.length > 0
    ? testimonials.filter(t => t.is_active)
    : DEFAULT_TESTIMONIALS;

  return (
    <section className="py-16 sm:py-24 bg-[#FAF5EE] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/80 border border-curator-border text-curator-coral text-xs font-semibold uppercase tracking-widest mb-3 shadow-curator-sm">
            <Sparkles className="w-3 h-3 text-curator-coral" />
            <span>Customer Love</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-curator-charcoal tracking-tight">
            Voices of the Muse
          </h2>

          <p className="text-xs sm:text-sm text-curator-muted font-sans mt-3 max-w-md mx-auto leading-relaxed">
            Real feedback from modern women across Bangladesh who own their vibe with Women Curator.
          </p>
        </div>

        {/* 3-Column Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {activeReviews.map((item, idx) => (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#FDFBF7] rounded-[2rem] p-7 border border-curator-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: Math.round(item.rating || 5) }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-curator-coral px-2.5 py-0.5 rounded-full bg-curator-coral-light">
                    Verified Order
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-curator-charcoal/90 leading-relaxed font-sans italic">
                  "{item.review}"
                </p>
              </div>

              <div className="pt-5 mt-4 border-t border-curator-border/60 flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-sm font-bold text-curator-charcoal">
                    {item.customer_name}
                  </h4>
                  <span className="text-[11px] text-curator-muted font-sans">
                    {item.city || 'Dhaka'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
