import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-curator-surface rounded-card p-4 border border-curator-border shadow-curator animate-pulse flex flex-col justify-between">
      {/* Top Image stage placeholder with organic tint */}
      <div className="relative w-full aspect-[4/5] rounded-3xl bg-curator-surface-peach/60 overflow-hidden flex items-center justify-center">
        <div className="w-3/4 h-3/4 rounded-full bg-curator-blush/20 blur-xl animate-pulse" />
        <div className="absolute top-4 left-4 w-20 h-6 bg-white/70 rounded-full" />
        <div className="absolute top-4 right-4 w-8 h-8 bg-white/70 rounded-full" />
      </div>

      {/* Content Placeholder */}
      <div className="mt-4 pt-2 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-curator-muted/20" />
          <div className="w-4 h-4 rounded-full bg-curator-muted/20" />
        </div>
        <div className="h-5 bg-curator-charcoal/10 rounded w-3/4" />
        <div className="h-4 bg-curator-muted/10 rounded w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-curator-coral/20 rounded w-20" />
          <div className="h-4 bg-curator-muted/10 rounded w-12" />
        </div>
        <div className="h-11 bg-curator-coral/30 rounded-full w-full mt-2" />
      </div>
    </div>
  );
};

export const SectionSkeleton: React.FC = () => {
  return (
    <div className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
      <div className="text-center max-w-xl mx-auto mb-12 space-y-3">
        <div className="h-4 bg-curator-coral/20 rounded-full w-24 mx-auto" />
        <div className="h-8 bg-curator-charcoal/10 rounded w-64 mx-auto" />
        <div className="h-4 bg-curator-muted/10 rounded w-80 mx-auto" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};
