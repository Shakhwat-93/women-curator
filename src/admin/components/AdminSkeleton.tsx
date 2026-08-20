import React from 'react';

export const AdminTableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full bg-white rounded-[2rem] border border-curator-border p-5 shadow-sm space-y-4 animate-pulse">
      <div className="h-8 bg-curator-surface-peach rounded-xl w-1/4" />
      <div className="space-y-3 pt-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-2 border-b border-curator-border/50">
            <div className="w-12 h-14 bg-curator-surface-peach rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-curator-surface-peach rounded w-1/3" />
              <div className="h-3 bg-curator-surface-peach/60 rounded w-1/5" />
            </div>
            <div className="h-6 bg-curator-surface-peach rounded-full w-20" />
            <div className="h-6 bg-curator-surface-peach rounded-full w-16" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-[2rem] border border-curator-border p-6 shadow-sm space-y-3 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-curator-surface-peach rounded w-24" />
        <div className="w-8 h-8 rounded-full bg-curator-surface-peach" />
      </div>
      <div className="h-8 bg-curator-surface-peach rounded-xl w-32" />
      <div className="h-3 bg-curator-surface-peach/60 rounded w-20" />
    </div>
  );
};
