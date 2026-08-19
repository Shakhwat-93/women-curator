import React from 'react';
import { ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#FAF5EE] border-t border-curator-border py-8 text-curator-charcoal relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-1.5 select-none">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-curator-charcoal">
              Women
            </span>
            <span className="text-curator-coral text-xs sm:text-sm animate-pulse">✦</span>
            <span className="font-serif text-xl sm:text-2xl font-normal text-curator-coral">
              Curator
            </span>
          </a>

          {/* Credit & Copyright */}
          <div className="text-xs text-curator-muted font-sans flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3">
            <span>© 2026 WOMEN CURATOR. All rights reserved.</span>
            <span className="hidden sm:inline text-curator-border">•</span>
            <span className="flex items-center gap-1 text-curator-charcoal font-medium">
              <span>Built by</span>
              <strong className="text-curator-coral font-semibold">Shakhwat Hossain Rasel</strong>
            </span>
          </div>

          {/* Back to top */}
          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 py-2 px-4 rounded-full bg-white border border-curator-border hover:border-curator-coral hover:text-curator-coral transition-all text-xs font-semibold shadow-sm text-curator-charcoal"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
