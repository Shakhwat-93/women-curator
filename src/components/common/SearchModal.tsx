import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../../types';

interface SearchModalProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  products,
  isOpen,
  onClose,
  onSelectProduct
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const filtered = query.trim()
    ? products.filter(
        p =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          (p.subtitle && p.subtitle.toLowerCase().includes(query.toLowerCase())) ||
          (p.description && p.description.toLowerCase().includes(query.toLowerCase())) ||
          (p.category_name && p.category_name.toLowerCase().includes(query.toLowerCase()))
      )
    : products;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-curator-charcoal/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-2xl bg-curator-surface rounded-[2.5rem] border border-curator-border shadow-2xl overflow-hidden z-10 p-6"
        >
          <div className="flex items-center justify-between pb-4 border-b border-curator-border">
            <div className="flex items-center gap-3 flex-1">
              <Search className="w-5 h-5 text-curator-coral" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search tunics, fabrics, silhouettes..."
                className="w-full text-base font-medium bg-transparent text-curator-charcoal placeholder:text-curator-muted focus:outline-none"
              />
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white text-curator-charcoal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 max-h-96 overflow-y-auto space-y-2.5">
            <span className="text-[11px] uppercase tracking-wider text-curator-muted font-bold block mb-2">
              {query.trim() ? `Results (${filtered.length})` : 'Curated Suggestions'}
            </span>

            {filtered.length === 0 ? (
              <p className="text-xs text-curator-muted py-6 text-center">
                No garments found matching "{query}".
              </p>
            ) : (
              filtered.map(product => (
                <div
                  key={product.id}
                  onClick={() => {
                    onSelectProduct(product);
                    onClose();
                  }}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-curator-surface-peach border border-curator-border cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-12 h-14 object-cover rounded-xl bg-curator-bg"
                    />
                    <div>
                      <h4 className="font-serif text-sm font-semibold text-curator-charcoal">
                        {product.name}
                      </h4>
                      <p className="text-xs text-curator-muted">{product.subtitle}</p>
                    </div>
                  </div>
                  <span className="font-serif font-bold text-curator-coral text-sm">
                    ৳{product.price.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
