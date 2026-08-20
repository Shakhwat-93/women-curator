import React, { useState, useEffect } from 'react';
import { ShoppingBag, Phone } from 'lucide-react';
import { NavigationItem, SiteSettings } from '../../types';

interface NavbarProps {
  onOrderNow: () => void;
  navigationItems?: NavigationItem[];
  siteSettings?: SiteSettings | null;
}

export const Navbar: React.FC<NavbarProps> = ({ onOrderNow, navigationItems, siteSettings }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = navigationItems && navigationItems.length > 0 ? navigationItems.filter(i => i.is_active) : [
    { id: '1', label: 'New Collection', url: '#products' },
    { id: '2', label: 'Fabric & Details', url: '#editorial' },
    { id: '3', label: 'Customer Reviews', url: '#reviews' },
    { id: '4', label: 'Direct Order', url: '#order-form' }
  ];

  const phone = siteSettings?.phone || '01540400247';

  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-400 ${
        isScrolled
          ? 'bg-[#FAF5EE]/95 backdrop-blur-md shadow-curator-sm py-3 border-b border-curator-border/60'
          : 'bg-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center">
            <a href="#" className="group flex items-center gap-1.5 select-none">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-curator-charcoal group-hover:text-curator-coral transition-colors">
                {siteSettings?.store_name?.split(' ')[0] || 'Women'}
              </span>
              <span className="text-curator-coral text-xs sm:text-sm animate-pulse">✦</span>
              <span className="font-serif text-xl sm:text-2xl font-normal tracking-wide text-curator-coral">
                {siteSettings?.store_name?.split(' ')[1] || 'Curator'}
              </span>
            </a>
          </div>

          {/* Center Dynamic Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((item, i) => (
              <a
                key={item.id || i}
                href={item.url}
                className="text-xs font-semibold uppercase tracking-widest text-curator-charcoal hover:text-curator-coral transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Action: Direct Order CTA & Helpline */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={`tel:${phone}`}
              className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-semibold text-curator-charcoal hover:text-curator-coral py-2 px-3.5 rounded-full bg-white border border-curator-border shadow-sm"
            >
              <Phone className="w-3.5 h-3.5 text-curator-coral" />
              <span>{phone}</span>
            </a>

            <button
              onClick={onOrderNow}
              className="flex items-center gap-2 bg-curator-coral hover:bg-curator-coral-hover text-white py-2.5 px-5 sm:px-6 rounded-full text-xs font-bold font-sans shadow-md hover:shadow-curator-glow active:scale-95 transition-all"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Order Now</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
