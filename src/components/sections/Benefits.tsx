import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const Benefits: React.FC = () => {
  const pillars = [
    {
      title: 'Style',
      bengaliTitle: 'স্টাইল ও ট্রেন্ডি ডিজাইন',
      description: 'আধুনিক নারীদের জন্য বাছাই করা ট্রেন্ডি ও রুচিশীল কাট যা আপনার সৌন্দর্য ও আত্মবিশ্বাস বাড়িয়ে তোলে।'
    },
    {
      title: 'Comfort',
      bengaliTitle: 'আরামদায়ক ফিট',
      description: 'প্রিমিয়াম সিল্ক-মোডাল ও ব্রিদেবল ফেব্রিক, যা সারাদিনের যেকোনো আয়োজনে অত্যন্ত আরামদায়ক।'
    },
    {
      title: 'Quality',
      bengaliTitle: 'ভালো মানের কাপড়',
      description: 'প্রতিটি পণ্য নিখুঁত ফিনিশিং ও স্থায়িত্বের কথা মাথায় রেখে carefully curated করা হয়।'
    },
    {
      title: 'Affordability',
      bengaliTitle: 'সাশ্রয়ী মূল্য',
      description: 'হাই-ফ্যাশন ও প্রিমিয়াম ডিজাইনের পোশাক সরাসরি আপনার সাধ্যের মধ্যে পৌঁছে দেওয়া আমাদের লক্ষ্য।'
    }
  ];

  return (
    <section id="why-us" className="py-20 sm:py-28 bg-[#FAF5EE] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header with Official Bengali Brand Philosophy */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-curator-surface-peach text-curator-coral text-xs font-bold uppercase tracking-widest shadow-sm border border-curator-border">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Style • Comfort • Quality • Affordability</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-curator-charcoal tracking-tight">
            কেন Women Curator?
          </h2>

          <p className="text-sm sm:text-base text-curator-charcoal/90 leading-relaxed font-sans font-medium">
            Women Curator-এ আমরা শুধু পোশাক বিক্রি করি না—আমরা আপনার স্টাইল ও আত্মবিশ্বাসকে গুরুত্ব দিই। ✨
          </p>

          <p className="text-xs sm:text-sm text-curator-muted leading-relaxed max-w-2xl mx-auto">
            ট্রেন্ডি ডিজাইন, ভালো মানের কাপড়, আরামদায়ক ফিট এবং সাশ্রয়ী মূল্যে আমরা নিয়ে আসি আধুনিক নারীদের জন্য বাছাই করা পোশাক। প্রতিটি পণ্য মান ও সৌন্দর্যের কথা মাথায় রেখে carefully curated করা হয়।
          </p>
        </div>

        {/* 4 Pillars Grid (Style • Comfort • Quality • Affordability) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-7">
          {pillars.map((pillar, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#FDFBF7] rounded-[2rem] p-7 border border-curator-border shadow-curator-sm hover:shadow-curator hover:border-curator-coral/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <span className="font-mono text-xs font-bold text-curator-coral px-2.5 py-1 rounded-full bg-curator-coral-light">
                    0{idx + 1}
                  </span>
                  <span className="text-xs font-bold tracking-wider uppercase text-curator-muted font-mono">
                    {pillar.title}
                  </span>
                </div>

                <h3 className="font-serif text-lg font-bold text-curator-charcoal mb-2 group-hover:text-curator-coral transition-colors">
                  {pillar.bengaliTitle}
                </h3>

                <p className="text-xs text-curator-muted leading-relaxed font-sans">
                  {pillar.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-curator-border/60 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Carefully Curated</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Official Signature Tagline Banner */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-white/90 backdrop-blur-md px-8 py-4 rounded-full border border-curator-border shadow-sm">
            <span className="font-serif italic text-sm sm:text-base text-curator-charcoal font-semibold">
              "আপনার স্টাইল, আমাদের যত্ন — <span className="text-curator-coral font-bold not-italic">Women Curator</span>। 🤍"
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
