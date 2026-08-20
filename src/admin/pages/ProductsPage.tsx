import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Edit2,
  Copy,
  Trash2,
  Sparkles,
  Package,
  MoreVertical,
  X,
  Check
} from 'lucide-react';
import { productService } from '../../lib/api';
import { Product } from '../../types';
import { AdminTableSkeleton } from '../components/AdminSkeleton';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAdminToast } from '../context/AdminToastContext';
import { motion, AnimatePresence } from 'framer-motion';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all');
  const [selectedProductForDelete, setSelectedProductForDelete] = useState<Product | null>(null);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const { success, error } = useAdminToast();
  const navigate = useNavigate();

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (e) {
      console.error('Failed to load products:', e);
      error('Could not load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDuplicate = async (prod: Product) => {
    setActiveActionMenuId(null);
    const copy: Partial<Product> = {
      ...prod,
      id: `prod-${Date.now()}`,
      name: `${prod.name} (Copy)`,
      status: 'draft'
    };

    const res = await productService.saveProduct(copy);
    if (res.success && res.data) {
      setProducts(prev => [res.data!, ...prev]);
      success(`Duplicated "${prod.name}" as draft`);
    } else {
      error(res.error || 'Failed to duplicate product');
    }
  };

  const confirmDelete = async () => {
    if (!selectedProductForDelete) return;
    const prodId = selectedProductForDelete.id;
    const res = await productService.deleteProduct(prodId);
    if (res.success) {
      setProducts(prev => prev.filter(p => p.id !== prodId));
      success(`Deleted "${selectedProductForDelete.name}"`);
    } else {
      error(res.error || 'Failed to delete product');
    }
    setSelectedProductForDelete(null);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subtitle?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? p.status === 'active' || p.is_active
        : p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-curator-coral-light text-curator-coral text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Store Inventory</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-curator-charcoal">
            Products ({products.length})
          </h1>
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-curator-coral text-white font-sans text-xs font-bold shadow-md hover:bg-curator-coral-hover active:scale-95 transition-all min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product Drop</span>
        </Link>
      </div>

      {/* Search & Status Filter Bar */}
      <div className="bg-white rounded-2xl sm:rounded-[2rem] p-3 sm:p-4 border border-curator-border shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-curator-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search products by title, category, fabric..."
            className="w-full pl-9 pr-4 py-2.5 rounded-full border border-curator-border bg-[#FAF5EE]/50 text-xs focus:outline-none focus:border-curator-coral font-sans"
          />
        </div>

        {/* Mobile Filter Sheet Trigger & Desktop Pills */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Mobile Filter Button */}
          <button
            type="button"
            onClick={() => setIsFilterSheetOpen(true)}
            className="sm:hidden flex items-center justify-center gap-1.5 px-4 py-2 rounded-full border border-curator-border bg-[#FAF5EE]/70 text-xs font-bold text-curator-charcoal min-h-[40px]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-curator-coral" />
            <span className="capitalize">{statusFilter === 'all' ? 'All Status' : statusFilter}</span>
          </button>

          {/* Desktop Status Pills */}
          <div className="hidden sm:flex items-center bg-[#FAF5EE] rounded-full p-1 border border-curator-border">
            {(['all', 'active', 'draft', 'archived'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold capitalize transition-all ${
                  statusFilter === st
                    ? 'bg-curator-coral text-white font-bold shadow-xs'
                    : 'text-curator-muted hover:text-curator-charcoal'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM SHEET FOR FILTERS */}
      <AnimatePresence>
        {isFilterSheetOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end sm:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterSheetOpen(false)}
              className="fixed inset-0 bg-curator-charcoal/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative w-full bg-white rounded-t-[2.5rem] p-6 z-10 space-y-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            >
              <div className="w-12 h-1.5 rounded-full bg-curator-muted/30 mx-auto -mt-2 mb-2" />
              <div className="flex items-center justify-between border-b border-curator-border pb-3">
                <h3 className="font-serif text-base font-bold text-curator-charcoal">Filter Products</h3>
                <button onClick={() => setIsFilterSheetOpen(false)} className="p-1 text-curator-muted">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-curator-muted uppercase font-mono">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['all', 'active', 'draft', 'archived'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => {
                        setStatusFilter(st);
                        setIsFilterSheetOpen(false);
                      }}
                      className={`p-3 rounded-2xl border text-xs font-bold capitalize flex items-center justify-between min-h-[48px] ${
                        statusFilter === st
                          ? 'border-curator-coral bg-curator-coral-light/60 text-curator-coral'
                          : 'border-curator-border bg-white text-curator-charcoal'
                      }`}
                    >
                      <span>{st}</span>
                      {statusFilter === st && <Check className="w-4 h-4 text-curator-coral" />}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PRODUCTS CONTAINER */}
      {isLoading ? (
        <AdminTableSkeleton />
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-curator-border p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-curator-coral-light text-curator-coral mx-auto flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-base font-bold text-curator-charcoal">No Products Found</h3>
          <p className="text-xs text-curator-muted max-w-sm mx-auto">
            {searchQuery ? `No products match "${searchQuery}".` : 'Get started by creating your first product drop.'}
          </p>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-curator-coral text-white text-xs font-bold shadow-xs hover:bg-curator-coral-hover"
          >
            <Plus className="w-4 h-4" />
            <span>Create Drop</span>
          </Link>
        </div>
      ) : (
        <>
          {/* ─── MOBILE: PRODUCT CARDS LIST (< 768px) ─── */}
          <div className="block md:hidden space-y-3">
            {filteredProducts.map(prod => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl p-3.5 border border-curator-border shadow-xs space-y-3 relative"
              >
                <div className="flex items-start gap-3">
                  <Link to={`/admin/products/${prod.id}`} className="flex-shrink-0">
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="w-16 h-20 object-cover rounded-xl bg-curator-bg border border-curator-border/60"
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <Link to={`/admin/products/${prod.id}`} className="min-w-0">
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-curator-surface-peach text-curator-coral font-mono font-bold uppercase inline-block mb-1">
                          {prod.badge || 'New'}
                        </span>
                        <h3 className="font-serif text-sm font-bold text-curator-charcoal truncate">
                          {prod.name}
                        </h3>
                        <p className="text-[11px] text-curator-muted truncate">
                          {prod.subtitle || prod.category_name || 'Signature Drop'}
                        </p>
                      </Link>

                      {/* 3-dots Menu Button */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setActiveActionMenuId(activeActionMenuId === prod.id ? null : prod.id)}
                          aria-label="Product actions"
                          className="p-1.5 rounded-full text-curator-muted hover:text-curator-charcoal hover:bg-curator-surface-peach min-h-[36px] min-w-[36px] flex items-center justify-center"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Floating Action Menu Popover */}
                        {activeActionMenuId === prod.id && (
                          <div className="absolute right-0 top-8 z-20 w-36 bg-white rounded-2xl shadow-xl border border-curator-border py-1.5 text-xs font-semibold divide-y divide-curator-border/40">
                            <button
                              onClick={() => {
                                setActiveActionMenuId(null);
                                navigate(`/admin/products/${prod.id}`);
                              }}
                              className="w-full px-3.5 py-2.5 text-left flex items-center gap-2 hover:bg-curator-surface-peach text-curator-charcoal min-h-[40px]"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-curator-coral" />
                              <span>Edit</span>
                            </button>
                            <button
                              onClick={() => handleDuplicate(prod)}
                              className="w-full px-3.5 py-2.5 text-left flex items-center gap-2 hover:bg-curator-surface-peach text-curator-charcoal min-h-[40px]"
                            >
                              <Copy className="w-3.5 h-3.5 text-curator-muted" />
                              <span>Duplicate</span>
                            </button>
                            <button
                              onClick={() => {
                                setActiveActionMenuId(null);
                                setSelectedProductForDelete(prod);
                              }}
                              className="w-full px-3.5 py-2.5 text-left flex items-center gap-2 hover:bg-rose-50 text-rose-600 min-h-[40px]"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-curator-border/40">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-serif font-bold text-sm text-curator-coral">
                          ৳{prod.price.toLocaleString()}
                        </span>
                        {prod.compare_price > prod.price && (
                          <span className="text-[10px] text-curator-muted line-through">
                            ৳{prod.compare_price.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono font-bold">
                          {prod.stock || 50} in stock
                        </span>

                        <span
                          className={`w-2 h-2 rounded-full ${
                            prod.status === 'draft'
                              ? 'bg-amber-400'
                              : prod.status === 'archived'
                              ? 'bg-gray-400'
                              : 'bg-emerald-500'
                          }`}
                          title={prod.status || 'active'}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ─── DESKTOP: FULL DATA TABLE (>= 768px) ─── */}
          <div className="hidden md:block bg-white rounded-[2rem] border border-curator-border shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF5EE]/70 border-b border-curator-border text-curator-muted font-mono uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Product</th>
                  <th className="py-3.5 px-4 font-semibold">Price</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold">Colors / Sizes</th>
                  <th className="py-3.5 px-4 font-semibold">Stock</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-curator-border/60">
                {filteredProducts.map(prod => (
                  <tr key={prod.id} className="hover:bg-curator-surface-peach/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="w-12 h-14 object-cover rounded-xl bg-curator-bg flex-shrink-0 border border-curator-border/60"
                        />
                        <div className="min-w-0">
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-curator-coral-light text-curator-coral font-mono font-bold uppercase inline-block mb-0.5">
                            {prod.badge || 'New'}
                          </span>
                          <h4 className="font-serif text-sm font-bold text-curator-charcoal truncate">
                            {prod.name}
                          </h4>
                          <p className="text-[10px] text-curator-muted truncate">
                            {prod.subtitle || 'Premium fabric • Effortless style'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-curator-charcoal">
                      <span className="text-curator-coral text-sm">৳{prod.price.toLocaleString()}</span>
                      {prod.compare_price > prod.price && (
                        <span className="text-[10px] text-curator-muted line-through block">
                          ৳{prod.compare_price.toLocaleString()}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-curator-charcoal font-medium">
                      {prod.category_name || 'Tunics'}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 mb-1">
                        {prod.colors?.slice(0, 3).map((c, i) => (
                          <span
                            key={i}
                            className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-curator-muted font-mono">
                        {prod.sizes?.length || 4} sizes
                      </span>
                    </td>

                    <td className="py-4 px-4 font-mono">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                        {prod.stock || 50} in stock
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                          prod.status === 'draft'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : prod.status === 'archived'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {prod.status || 'active'}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          to={`/admin/products/${prod.id}`}
                          title="Edit Drop"
                          className="p-2 rounded-xl border border-curator-border hover:border-curator-coral hover:text-curator-coral text-curator-muted transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(prod)}
                          title="Duplicate Drop"
                          className="p-2 rounded-xl border border-curator-border hover:border-curator-coral hover:text-curator-coral text-curator-muted transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedProductForDelete(prod)}
                          title="Delete Drop"
                          className="p-2 rounded-xl border border-curator-border hover:border-rose-300 hover:text-rose-600 text-curator-muted transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(selectedProductForDelete)}
        title="Delete Product Drop"
        message={`Are you sure you want to remove "${selectedProductForDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Product"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setSelectedProductForDelete(null)}
      />
    </div>
  );
};
