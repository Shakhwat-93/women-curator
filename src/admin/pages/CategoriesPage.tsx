import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Sparkles, FolderTree, X } from 'lucide-react';
import { categoryService } from '../../lib/api';
import { Category } from '../../types';
import { useAdminToast } from '../context/AdminToastContext';
import { AdminTableSkeleton } from '../components/AdminSkeleton';

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
      const res = await categoryService.saveCategory(editingCat);
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
        error('Failed to delete');
      }
    } catch {
      error('Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      {/* Category Modal */}
      {editingCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-curator-charcoal/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full border border-curator-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-curator-border pb-2">
              <h3 className="font-serif text-lg font-bold text-curator-charcoal">
                {editingCat.id ? 'Edit Category' : 'Create Category'}
              </h3>
              <button onClick={() => setEditingCat(null)} className="p-1.5 rounded-full text-curator-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                  Category Name <span className="text-curator-coral">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingCat.name || ''}
                  onChange={e => setEditingCat({ ...editingCat, name: e.target.value })}
                  placeholder="e.g. Tunics & Kurtis"
                  className="w-full px-4 py-2.5 rounded-xl border border-curator-border text-xs focus:outline-none focus:border-curator-coral"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  value={editingCat.slug || ''}
                  onChange={e => setEditingCat({ ...editingCat, slug: e.target.value })}
                  placeholder="e.g. tunics"
                  className="w-full px-4 py-2.5 rounded-xl border border-curator-border text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editingCat.description || ''}
                  onChange={e => setEditingCat({ ...editingCat, description: e.target.value })}
                  placeholder="Short tagline..."
                  className="w-full px-4 py-2.5 rounded-xl border border-curator-border text-xs resize-none focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
                  className="px-5 py-2.5 rounded-full border border-curator-border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-full bg-curator-coral text-white text-xs font-bold hover:bg-curator-coral-hover shadow-md transition-all"
                >
                  {isSaving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
          className="inline-flex items-center gap-2 py-3 px-6 rounded-full bg-curator-coral text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-curator-coral-hover hover:shadow-curator-glow active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <AdminTableSkeleton rows={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map(cat => (
            <div
              key={cat.id}
              className="bg-white rounded-[2rem] p-6 border border-curator-border shadow-sm flex flex-col justify-between space-y-4"
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
                    className="p-1.5 rounded-lg border border-curator-border hover:bg-curator-surface-peach text-curator-charcoal"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600"
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
