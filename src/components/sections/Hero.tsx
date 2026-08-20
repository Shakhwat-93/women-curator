import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrganicBackground } from '../common/OrganicBackground';

interface HeroProps {
  onShopCollection: () => void;
  onDirectOrder: () => void;
}

const HERO_SLIDES = [
  {
    id: 1,
    image: '/assets/hero-banner-3models.jpg',
    title: 'New Drop 2026',
    subtitle: 'Style • Comfort • Quality • Affordability',
    tag: 'New Collection'
  },
  {
    id: 2,
    image: '/assets/model-magenta-banner.jpg',
    title: 'Embroidered Flare Tunic',
    subtitle: 'Effortlessly Beautiful & Comfortable',
    tag: 'Trending'
  },
  {
    id: 3,
    image: '/assets/model-black-banner.jpg',
    title: 'Monochrome Noir Tunic',
    subtitle: 'Carefully Curated Details',
    tag: 'Exclusive'
  }
];

export const Hero: React.FC<HeroProps> = ({ onShopCollection, onDirectOrder }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  return (
    <section className="relative pt-16 sm:pt-24 pb-8 sm:pb-12 overflow-hidden bg-gradient-to-b from-[#FAF5EE] via-[#FAF5EE] to-[#F5EBE0]">
      {/* Background Signature Organic Geometry */}
      <OrganicBackground
        variant="hero"
        showDots={true}
        showArc={true}
        showShadows={true}
        className="opacity-95"
      />

      <div className="relative max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 z-10">
        
        {/* ─── MOBILE VIEW: HERO AUTO SLIDER ─── */}
        <div className="block lg:hidden">
          <div
            onClick={onDirectOrder}
            className="relative w-full rounded-[2rem] overflow-hidden shadow-2xl border border-white/80 bg-white cursor-pointer group"
          >
            <div className="relative w-full aspect-[16/10.5] overflow-hidden bg-[#FDFBF7]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={HERO_SLIDES[currentSlide].id}
                  src={HERO_SLIDES[currentSlide].image}
                  alt={HERO_SLIDES[currentSlide].title}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full object-cover object-center"
                />
              </AnimatePresence>

              {/* Prev / Next controls */}
              <button
                onClick={handlePrev}
                aria-label="Previous slide"
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm text-curator-charcoal flex items-center justify-center shadow-md active:scale-90 z-20"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleNext}
                aria-label="Next slide"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm text-curator-charcoal flex items-center justify-center shadow-md active:scale-90 z-20"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {/* Top Floating Badge */}
              <div className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-md border border-curator-blush/40 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-curator-coral animate-ping" />
                <span className="text-[10px] font-bold text-curator-charcoal font-serif">
                  {HERO_SLIDES[currentSlide].tag}
                </span>
              </div>

              {/* Slide Dots Indicator */}
              <div className="absolute bottom-2.5 inset-x-0 flex justify-center items-center gap-1.5 z-20">
                {HERO_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlide(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentSlide === idx
                        ? 'w-6 bg-curator-coral shadow-sm'
                        : 'w-1.5 bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <button
              onClick={onDirectOrder}
              className="py-3.5 px-4 rounded-full bg-curator-coral text-white font-sans text-xs font-bold shadow-lg hover:bg-curator-coral-hover active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Direct Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onShopCollection}
              className="py-3.5 px-4 rounded-full bg-white text-curator-charcoal border border-curator-border font-sans text-xs font-semibold shadow-sm hover:bg-curator-surface-peach active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-curator-coral" />
              <span>View 4 Drops</span>
            </button>
          </div>
        </div>

        {/* ─── DESKTOP VIEW: EDITORIAL SPLIT ─── */}
        <div className="hidden lg:grid grid-cols-12 gap-8 items-center">
          {/* Left Column: Brand Story & Headline (5 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-5 text-left z-20 space-y-5"
          >
            {/* Brand Pill */}
            <div className="inline-flex items-center gap-2">
              <span className="font-serif text-lg text-curator-charcoal tracking-wide">
                Women
              </span>
              <span className="text-curator-coral text-sm">✦</span>
              <span className="font-serif text-lg text-curator-coral font-medium">
                Curator
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-0">
              <h1 className="font-serif text-6xl xl:text-[5.2rem] leading-[0.95] tracking-tight text-curator-charcoal">
                New{' '}
                <span className="text-curator-coral font-serif font-bold inline-block hover:scale-[1.02] transition-transform">
                  Drop
                </span>
              </h1>

              {/* Accent Script: "own the Vibe" */}
              <div className="pt-2">
                <div className="relative inline-block">
                  <span className="font-script text-5xl xl:text-6xl text-curator-charcoal font-normal tracking-wide">
                    own the{' '}
                    <span className="text-curator-coral italic font-script">
                      Vibe
                    </span>
                  </span>

                  <svg
                    className="w-full h-5 text-curator-coral -mt-1"
                    viewBox="0 0 200 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M 10 12 C 60 4, 140 3, 190 14"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Official Brand Description */}
            <p className="text-xs sm:text-sm text-curator-muted max-w-md font-sans leading-relaxed pt-1">
              Women Curator is a fashion brand dedicated to bringing modern women stylish, elegant, and comfortable clothing at affordable prices. We carefully curate trendy designs with quality fabrics and thoughtful details, making everyday fashion effortlessly beautiful.
            </p>

            {/* 4 Pillars Badge */}
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-curator-surface-peach/80 border border-curator-border text-xs font-semibold text-curator-charcoal">
              <span className="text-curator-coral font-bold">•</span>
              <span>Style</span>
              <span className="text-curator-coral font-bold">•</span>
              <span>Comfort</span>
              <span className="text-curator-coral font-bold">•</span>
              <span>Quality</span>
              <span className="text-curator-coral font-bold">•</span>
              <span>Affordability</span>
            </div>

            {/* Call to Action Buttons */}
            <div className="pt-3 flex items-center gap-3.5">
              <button
                onClick={onDirectOrder}
                className="bg-curator-coral text-white font-sans text-sm font-bold tracking-wide py-4 px-8 rounded-full shadow-lg hover:shadow-curator-glow hover:bg-curator-coral-hover active:scale-[0.98] transition-all duration-300 flex items-center gap-2.5 group"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Direct Order Now</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <button
                onClick={onShopCollection}
                className="inline-flex items-center gap-2 py-4 px-6 rounded-full bg-white/90 hover:bg-white text-curator-charcoal hover:text-curator-coral text-xs font-semibold border border-curator-border shadow-sm transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-curator-coral" />
                <span>View 4 Drops</span>
              </button>
            </div>
          </motion.div>

          {/* Right Column: Hero Artwork Auto Slider (7 cols) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="col-span-7 relative flex items-center justify-center"
          >
            <div
              onClick={onDirectOrder}
              className="relative w-full rounded-[3rem] overflow-hidden shadow-2xl border border-white/60 group bg-white cursor-pointer"
            >
              <div className="relative w-full aspect-[16/10.5] overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={HERO_SLIDES[currentSlide].id}
                    src={HERO_SLIDES[currentSlide].image}
                    alt={HERO_SLIDES[currentSlide].title}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Arrow navigation buttons on hover */}
                <button
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-curator-charcoal flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 z-20"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-curator-charcoal flex items-center justify-center shadow-lg transition-all opacity-0 group-hover:opacity-100 z-20"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Overlaid Badges */}
                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-curator-blush/40 flex items-center gap-2 z-20">
                  <span className="w-2 h-2 rounded-full bg-curator-coral animate-ping" />
                  <span className="text-xs font-bold text-curator-charcoal font-serif">
                    {HERO_SLIDES[currentSlide].tag}
                  </span>
                </div>

                {/* Bottom Slider Dots */}
                <div className="absolute bottom-4 inset-x-0 flex justify-center items-center gap-2 z-20">
                  {HERO_SLIDES.map((slide, idx) => (
                    <button
                      key={slide.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentSlide(idx);
                      }}
                      className={`h-2 rounded-full transition-all duration-400 ${
                        currentSlide === idx
                          ? 'w-8 bg-curator-coral shadow-md'
                          : 'w-2 bg-white/75 hover:bg-white'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};
