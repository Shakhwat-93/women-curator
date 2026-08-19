import React, { useState } from 'react';
import { ArrowRight, Mail, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { OrganicBackground } from '../common/OrganicBackground';

export const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setIsSubmitted(true);
  };

  return (
    <section className="py-20 sm:py-28 bg-[#FAF5EE] relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative bg-gradient-to-br from-[#FDFBF7] to-[#F9ECE4] rounded-[3rem] p-8 sm:p-14 lg:p-16 border border-curator-border shadow-2xl text-center overflow-hidden">
          {/* Background Blobs */}
          <OrganicBackground variant="banner" showDots={true} showArc={true} showShadows={false} />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/90 text-curator-coral text-xs font-semibold uppercase tracking-widest shadow-sm">
              <Sparkles className="w-3 h-3" />
              <span>VIP Curation</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-curator-charcoal tracking-tight">
              Stay in the Curated Circle
            </h2>

            <p className="text-xs sm:text-sm text-curator-muted font-sans max-w-md mx-auto leading-relaxed">
              New drops, curated seasonal edits, private runway previews, and exclusive offers delivered gracefully to your inbox.
            </p>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 sm:p-5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center gap-3 text-xs font-semibold"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>Welcome to the Circle! Use voucher <strong>CURATOR10</strong> for 10% off your first drop.</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-curator-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="w-full pl-11 pr-4 py-4 rounded-full bg-white border border-curator-border text-xs focus:outline-none focus:border-curator-coral shadow-sm text-curator-charcoal"
                  />
                </div>

                <button
                  type="submit"
                  className="py-4 px-8 rounded-full bg-curator-coral text-white font-sans text-xs font-semibold tracking-wider uppercase shadow-md hover:bg-curator-coral-hover hover:shadow-curator-glow active:scale-[0.98] transition-all flex items-center justify-center gap-2 group flex-shrink-0"
                >
                  <span>Join Us</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            )}

            <p className="text-[11px] text-curator-muted/80">
              We respect your privacy. No spam, ever. Unsubscribe with one click anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
