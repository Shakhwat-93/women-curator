import React from 'react';

interface BadgeProps {
  variant?: 'new' | 'curated' | 'sale' | 'bestseller' | 'neutral';
  children: React.ReactNode;
  className?: string;
  icon?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'new',
  children,
  className = '',
  icon = true
}) => {
  const styles = {
    new: 'bg-white/90 text-curator-coral border border-curator-blush/30 shadow-sm backdrop-blur-md',
    curated: 'bg-curator-coral text-white shadow-sm',
    sale: 'bg-curator-rose text-white shadow-sm',
    bestseller: 'bg-curator-surface-peach text-curator-charcoal border border-curator-border',
    neutral: 'bg-white/80 text-curator-muted backdrop-blur-sm'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${styles[variant]} ${className}`}
    >
      {icon && variant === 'new' && (
        <span className="text-curator-coral text-[10px] animate-pulse">✦</span>
      )}
      {children}
    </span>
  );
};
