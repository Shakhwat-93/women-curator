import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Copy, Sparkles, AlertCircle } from 'lucide-react';
import { productService } from '../../lib/api';
import { Product } from '../../types';
import { AdminTableSkeleton } from '../components/AdminSkeleton';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAdminToast } from '../context/AdminToastContext';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all');
  const [selectedProductToDelete, setSelectedProductToDelete] = useState<Product | null>(null);

  const { success, error } = useAdminToast();

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch {
      error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDuplicate = async (prod: Product) => {
    const dup: Partial<Product> = {
      ...prod,
      id: `wc-drop-${Date.now()}`,
      name: `${prod.name} (Copy)`,
      slug: `${prod.slug || 'copy'}-${Date.now().toString().slice(-4)}`
    };
    const res = await productService.saveProduct(dup);
    if (res.success) {
      success('Product duplicated successfully');
      loadProducts();
    } else {
      error(res.error || 'Failed to duplicate product');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProductToDelete) return;
    const res = await productService.deleteProduct(selectedProductToDelete.id);
    if (res.success) {
      success('Product deleted successfully');
      loadProducts();
    } else {
      error(res.error || 'Failed to delete product');
    }
    setSelectedProductToDelete(null);
  };

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (p.status || 'active') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!selectedProductToDelete}
        title="Delete Product"
        message={`Are you sure you want to remove "${selectedProductToDelete?.name}"? Historical orders referencing this product will still be preserved.`}
        confirmText="Delete"
        onConfirm={handleDeleteConfirm}
        onClose={() => setSelectedProductToDelete(null)}
      />

      {/* Header */}
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
          className="inline-flex items-center gap-2 py-3 px-6 rounded-full bg-curator-coral text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-curator-coral-hover hover:shadow-curator-glow active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Search and Filters Card */}
      <div className="bg-white rounded-[2rem] p-4 border border-curator-border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-curator-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search products by title..."
            className="w-full pl-9 pr-4 py-2 rounded-full border border-curator-border bg-[#FAF5EE]/50 text-xs focus:outline-none focus:border-curator-coral focus:bg-white transition-all font-sans"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#FAF5EE] rounded-full p-1 border border-curator-border w-full sm:w-auto overflow-x-auto text-xs font-semibold">
          {(['all', 'active', 'draft', 'archived'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-full capitalize whitespace-nowrap transition-all ${
                statusFilter === tab
                  ? 'bg-curator-coral text-white shadow-sm font-bold'
                  : 'text-curator-muted hover:text-curator-charcoal'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      {isLoading ? (
        <AdminTableSkeleton rows={5} />
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-curator-border p-12 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-curator-muted mx-auto" />
          <h3 className="font-serif text-lg font-bold text-curator-charcoal">No Products Found</h3>
          <p className="text-xs text-curator-muted max-w-sm mx-auto">
            Try adjusting your search filter or click below to create your first fashion drop.
          </p>
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-curator-coral text-white text-xs font-bold hover:bg-curator-coral-hover transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Product</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-curator-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF5EE]/70 border-b border-curator-border text-curator-muted font-mono uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6 font-semibold">Product</th>
                  <th className="py-4 px-4 font-semibold">Price</th>
                  <th className="py-4 px-4 font-semibold">Category</th>
                  <th className="py-4 px-4 font-semibold">Colors / Sizes</th>
                  <th className="py-4 px-4 font-semibold">Stock</th>
                  <th className="py-4 px-4 font-semibold">Status</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-curator-border/60 font-sans">
                {filteredProducts.map(prod => (
                  <tr key={prod.id} className="hover:bg-curator-surface-peach/30 transition-colors">
                    {/* Image + Title */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="w-14 h-16 object-cover rounded-2xl bg-curator-bg flex-shrink-0 shadow-sm border border-curator-border/60"
                        />
                        <div className="min-w-0 max-w-xs">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-curator-coral-light text-curator-coral font-bold font-mono">
                            {prod.badge || 'New Drop'}
                          </span>
                          <h4 className="font-serif text-sm font-bold text-curator-charcoal truncate mt-1">
                            {prod.name}
                          </h4>
                          <p className="text-[11px] text-curator-muted truncate">{prod.subtitle}</p>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4">
                      <span className="font-mono font-bold text-sm text-curator-coral block">
                        ৳{prod.price?.toLocaleString()}
                      </span>
                      {prod.compare_price > prod.price && (
                        <span className="font-mono text-[10px] text-curator-muted line-through block">
                          ৳{prod.compare_price?.toLocaleString()}
                        </span>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 font-medium text-curator-charcoal">
                      {prod.category_name || 'Tunics'}
                    </td>

                    {/* Swatches & Sizes */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1 mb-1">
                        {prod.colors?.map(c => (
                          <span
                            key={c.hex}
                            className="w-3.5 h-3.5 rounded-full inline-block border border-black/10 shadow-xs"
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-curator-muted font-mono">
                        {prod.sizes?.length || 4} sizes
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="py-4 px-4 font-mono">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          (prod.stock || 50) < 10
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {prod.stock || 50} in stock
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase font-mono ${
                          (prod.status || 'active') === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{prod.status || 'active'}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/products/${prod.id}`}
                          title="Edit Product & Card"
                          className="p-2 rounded-xl border border-curator-border hover:bg-curator-coral hover:text-white hover:border-curator-coral text-curator-charcoal transition-all shadow-xs"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleDuplicate(prod)}
                          title="Duplicate Product"
                          className="p-2 rounded-xl border border-curator-border hover:bg-curator-surface-peach text-curator-charcoal transition-all shadow-xs"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setSelectedProductToDelete(prod)}
                          title="Delete Product"
                          className="p-2 rounded-xl border border-rose-200 hover:bg-rose-600 hover:text-white text-rose-600 transition-all shadow-xs"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
