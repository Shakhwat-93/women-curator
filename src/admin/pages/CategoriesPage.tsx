import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Sparkles, FolderTree, X } from 'lucide-react';
import { categoryService } from '../../lib/api';
import { Category } from '../../types';
import { useAdminToast } from '../context/AdminToastContext';
import { AdminTableSkeleton } from '../components/AdminSkeleton';
import { motion, AnimatePresence } from 'framer-motion';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCat, setEditingCat] = useState<Partial<Category> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useAdminToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch {
      error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCat?.name) {
      error('Category name is required');
      return;
    }
    setIsSaving(true);
    try {
      const payload: Partial<Category> = {
        ...editingCat,
        slug: editingCat.slug || editingCat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      };
      const res = await categoryService.saveCategory(payload);
      if (res.success) {
        success('Category saved successfully');
        setEditingCat(null);
        loadData();
      } else {
        error(res.error || 'Failed to save category');
      }
    } catch {
      error('Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await categoryService.deleteCategory(id);
      if (res.success) {
        success('Category deleted');
        loadData();
      } else {
        error(res.error || 'Failed to delete');
      }
    } catch {
      error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-12">
      {/* Editor Modal / Bottom Sheet */}
      <AnimatePresence>
        {editingCat && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingCat(null)}
              className="fixed inset-0 bg-curator-charcoal/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              className="relative bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl z-10 space-y-5 border border-curator-border pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            >
              <div className="w-12 h-1.5 rounded-full bg-curator-muted/30 mx-auto -mt-2 mb-2 sm:hidden" />
              <div className="flex items-center justify-between border-b border-curator-border pb-3">
                <h3 className="font-serif text-lg font-bold text-curator-charcoal">
                  {editingCat.id ? 'Edit Category' : 'Create Category'}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
                  className="p-1 rounded-full text-curator-muted hover:text-curator-charcoal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                    Category Name <span className="text-curator-coral">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCat.name || ''}
                    onChange={e => setEditingCat({ ...editingCat, name: e.target.value })}
                    placeholder="e.g. Tunics & Kurtis"
                    className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs font-serif font-bold text-curator-charcoal focus:outline-none focus:border-curator-coral min-h-[48px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={editingCat.slug || ''}
                    onChange={e => setEditingCat({ ...editingCat, slug: e.target.value })}
                    placeholder="e.g. tunics"
                    className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs font-mono focus:outline-none min-h-[48px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editingCat.description || ''}
                    onChange={e => setEditingCat({ ...editingCat, description: e.target.value })}
                    placeholder="Brief category description..."
                    className="w-full p-4 rounded-2xl border border-curator-border text-xs focus:outline-none focus:border-curator-coral"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingCat(null)}
                    className="flex-1 sm:flex-initial px-5 py-3 rounded-full border border-curator-border text-xs font-bold text-curator-charcoal hover:bg-curator-surface-peach min-h-[48px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 sm:flex-initial px-7 py-3 rounded-full bg-curator-coral text-white text-xs font-bold shadow-md hover:bg-curator-coral-hover min-h-[48px]"
                  >
                    {isSaving ? 'Saving...' : 'Save Category'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-curator-coral-light text-curator-coral text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Store Organization</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-curator-charcoal">
            Categories ({categories.length})
          </h1>
        </div>

        <button
          onClick={() => setEditingCat({ name: '', slug: '', description: '', is_active: true })}
          className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-curator-coral text-white text-xs font-bold shadow-md hover:bg-curator-coral-hover active:scale-95 transition-all self-stretch sm:self-auto min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <AdminTableSkeleton rows={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map(cat => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-6 border border-curator-border shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="w-10 h-10 rounded-2xl bg-curator-coral-light text-curator-coral flex items-center justify-center mb-3">
                  <FolderTree className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-base font-bold text-curator-charcoal">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-curator-muted font-mono mt-0.5">/{cat.slug}</p>
                <p className="text-xs text-curator-muted mt-2 font-sans">{cat.description || 'No description'}</p>
              </div>

              <div className="pt-3 border-t border-curator-border/60 flex items-center justify-between">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono font-bold">
                  Active
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingCat(cat)}
                    aria-label="Edit category"
                    className="p-2 rounded-xl border border-curator-border hover:bg-curator-surface-peach text-curator-charcoal min-h-[36px] min-w-[36px] flex items-center justify-center"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    aria-label="Delete category"
                    className="p-2 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 min-h-[36px] min-w-[36px] flex items-center justify-center"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
