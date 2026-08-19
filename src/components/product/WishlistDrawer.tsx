import React from 'react';
import { X, Heart, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

export const WishlistDrawer: React.FC = () => {
  const { wishlist, isWishlistOpen, setIsWishlistOpen, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!isWishlistOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsWishlistOpen(false)}
          className="absolute inset-0 bg-curator-charcoal/50 backdrop-blur-sm transition-opacity"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-screen max-w-md bg-curator-surface border-l border-curator-border shadow-2xl flex flex-col justify-between"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-curator-border flex items-center justify-between bg-[#FBF7F2]">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-curator-coral fill-current" />
                <h2 className="font-serif text-xl font-bold text-curator-charcoal">
                  Curated Wishlist
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-curator-coral-light text-curator-coral font-bold">
                  {wishlist.length}
                </span>
              </div>

              <button
                onClick={() => setIsWishlistOpen(false)}
                className="p-2 rounded-full hover:bg-white text-curator-charcoal hover:text-curator-coral transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Wishlist Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {wishlist.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-curator-coral-light flex items-center justify-center text-curator-coral">
                    <Heart className="w-8 h-8" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-curator-charcoal">
                    Your Wishlist is Empty
                  </h3>
                  <p className="text-xs text-curator-muted max-w-xs">
                    Save your favorite pieces from the collection by clicking the heart icon on any product.
                  </p>
                  <button
                    onClick={() => setIsWishlistOpen(false)}
                    className="px-6 py-2.5 rounded-full bg-curator-coral text-white text-xs font-semibold hover:bg-curator-coral-hover transition-all"
                  >
                    Explore New Drop
                  </button>
                </div>
              ) : (
                wishlist.map(product => (
                  <div
                    key={product.id}
                    className="flex gap-4 p-3.5 rounded-2xl bg-white border border-curator-border shadow-curator-sm hover:border-curator-blush transition-all"
                  >
                    <div className="w-20 h-24 rounded-xl overflow-hidden bg-curator-surface-peach flex-shrink-0">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-serif text-sm font-semibold text-curator-charcoal line-clamp-1">
                            {product.name}
                          </h4>
                          <button
                            onClick={() => removeFromWishlist(product.id)}
                            className="text-curator-muted hover:text-curator-rose transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-curator-muted line-clamp-1 mt-0.5">
                          {product.subtitle}
                        </p>
                        <div className="font-serif font-bold text-curator-coral text-sm mt-1">
                          ৳{product.price.toLocaleString()}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          addToCart(product);
                          removeFromWishlist(product.id);
                        }}
                        className="mt-2 text-xs font-semibold py-1.5 px-3 rounded-full bg-curator-surface-peach text-curator-coral hover:bg-curator-coral hover:text-white transition-all flex items-center justify-center gap-1.5 w-full"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Move to Bag</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {wishlist.length > 0 && (
              <div className="p-6 border-t border-curator-border bg-[#FBF7F2]">
                <button
                  onClick={() => {
                    wishlist.forEach(p => addToCart(p));
                    setIsWishlistOpen(false);
                  }}
                  className="w-full py-3.5 px-6 rounded-full bg-curator-coral text-white font-semibold text-sm shadow-md hover:bg-curator-coral-hover flex items-center justify-center gap-2 transition-all"
                >
                  <span>Move All to Shopping Bag</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
