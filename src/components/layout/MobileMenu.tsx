import React from 'react';
import { X, ArrowRight, Heart, ShoppingBag, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { wishlist, setIsWishlistOpen } = useWishlist();

  if (!isOpen) return null;

  const links = [
    { label: 'New Drop', href: '#products' },
    { label: 'Collections', href: '#categories' },
    { label: 'Editorial Spread', href: '#editorial' },
    { label: 'Spotlight Look', href: '#featured' },
    { label: 'Why Women Curator', href: '#why-us' },
    { label: 'Client Reviews', href: '#testimonials' }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-curator-charcoal/50 backdrop-blur-sm"
        />

        <div className="fixed inset-y-0 left-0 max-w-full flex pr-12">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-screen max-w-xs bg-curator-bg border-r border-curator-border shadow-2xl flex flex-col justify-between p-6"
          >
            {/* Top Logo & Close */}
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-curator-border">
                <a href="#" onClick={onClose} className="flex items-center gap-1">
                  <span className="font-serif text-xl font-bold text-curator-charcoal">Women</span>
                  <span className="text-curator-coral text-xs">✦</span>
                  <span className="font-serif text-xl text-curator-coral">Curator</span>
                </a>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white text-curator-charcoal"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="py-6 space-y-4">
                {links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.href}
                    onClick={onClose}
                    className="flex items-center justify-between text-sm font-semibold uppercase tracking-wider text-curator-charcoal hover:text-curator-coral transition-colors py-2"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-4 h-4 text-curator-muted" />
                  </a>
                ))}
              </nav>
            </div>

            {/* Bottom Actions */}
            <div className="space-y-4 pt-6 border-t border-curator-border">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    onClose();
                    setIsWishlistOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-white border border-curator-border text-xs font-semibold text-curator-charcoal"
                >
                  <Heart className="w-4 h-4 text-curator-coral" />
                  <span>Wishlist ({wishlist.length})</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    setIsCartOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-curator-coral text-white text-xs font-semibold"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Bag ({totalItems})</span>
                </button>
              </div>

              <div className="text-[11px] text-curator-muted space-y-1">
                <p className="flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-curator-coral" />
                  <span>+880 1700-000000</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-curator-coral" />
                  <span>concierge@womencurator.com</span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
