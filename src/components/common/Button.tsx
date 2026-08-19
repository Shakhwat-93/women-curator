import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'coral' | 'secondary' | 'outline' | 'ghost' | 'cream';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'coral',
  size = 'md',
  icon: Icon,
  iconPosition = 'right',
  isLoading = false,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-300 select-none active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const sizeClasses = {
    sm: 'text-xs px-4 py-2 rounded-full gap-1.5',
    md: 'text-sm px-6 py-3 rounded-full gap-2',
    lg: 'text-base px-8 py-4 rounded-full gap-2.5 font-semibold tracking-wide',
    icon: 'p-2.5 rounded-full aspect-square'
  };

  const variantClasses = {
    coral: 'bg-curator-coral text-white hover:bg-curator-coral-hover shadow-md hover:shadow-curator-glow hover:-translate-y-0.5',
    secondary: 'bg-curator-surface-peach text-curator-charcoal hover:bg-curator-blush-soft border border-curator-border',
    outline: 'bg-transparent text-curator-charcoal border border-curator-charcoal/20 hover:border-curator-coral hover:text-curator-coral hover:bg-curator-coral-light/30',
    ghost: 'bg-transparent text-curator-charcoal hover:text-curator-coral hover:bg-curator-coral-light/20',
    cream: 'bg-curator-surface text-curator-charcoal shadow-curator-sm hover:shadow-curator hover:text-curator-coral border border-curator-border'
  };

  return (
    <button
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : (
        Icon && iconPosition === 'left' && <Icon className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
      )}

      <span>{children}</span>

      {!isLoading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      )}
    </button>
  );
};
