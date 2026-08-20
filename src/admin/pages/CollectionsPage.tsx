import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Sparkles, Layers, X } from 'lucide-react';
import { collectionService } from '../../lib/api';
import { Collection } from '../../types';
import { useAdminToast } from '../context/AdminToastContext';
import { AdminTableSkeleton } from '../components/AdminSkeleton';

export const CollectionsPage: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCol, setEditingCol] = useState<Partial<Collection> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useAdminToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await collectionService.getCollections();
      setCollections(data);
    } catch {
      error('Failed to load collections');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCol?.name) {
      error('Collection name is required');
      return;
    }
    setIsSaving(true);
    try {
      const res = await collectionService.saveCollection(editingCol);
      if (res.success) {
        success('Collection saved successfully');
        setEditingCol(null);
        loadData();
      } else {
        error(res.error || 'Failed to save collection');
      }
    } catch {
      error('Failed to save collection');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await collectionService.deleteCollection(id);
      if (res.success) {
        success('Collection deleted');
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
      {/* Modal */}
      {editingCol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-curator-charcoal/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full border border-curator-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-curator-border pb-2">
              <h3 className="font-serif text-lg font-bold text-curator-charcoal">
                {editingCol.id ? 'Edit Collection' : 'Create Collection Drop'}
              </h3>
              <button onClick={() => setEditingCol(null)} className="p-1.5 rounded-full text-curator-muted">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                  Collection Name <span className="text-curator-coral">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingCol.name || ''}
                  onChange={e => setEditingCol({ ...editingCol, name: e.target.value })}
                  placeholder="e.g. Autumn Capsule 2026"
                  className="w-full px-4 py-2.5 rounded-xl border border-curator-border text-xs focus:outline-none focus:border-curator-coral"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                  Slug (URL)
                </label>
                <input
                  type="text"
                  value={editingCol.slug || ''}
                  onChange={e => setEditingCol({ ...editingCol, slug: e.target.value })}
                  placeholder="e.g. autumn-2026"
                  className="w-full px-4 py-2.5 rounded-xl border border-curator-border text-xs font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                  Accent Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={editingCol.accent_color || '#DE4F3C'}
                    onChange={e => setEditingCol({ ...editingCol, accent_color: e.target.value })}
                    className="w-8 h-8 rounded-full cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={editingCol.accent_color || '#DE4F3C'}
                    onChange={e => setEditingCol({ ...editingCol, accent_color: e.target.value })}
                    className="flex-1 px-4 py-2 rounded-xl border border-curator-border text-xs font-mono uppercase"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingCol(null)}
                  className="px-5 py-2.5 rounded-full border border-curator-border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-full bg-curator-coral text-white text-xs font-bold hover:bg-curator-coral-hover shadow-md transition-all"
                >
                  {isSaving ? 'Saving...' : 'Save Collection'}
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
            <span>Editorial Capsules</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-curator-charcoal">
            Collections ({collections.length})
          </h1>
        </div>

        <button
          onClick={() => setEditingCol({ name: '', slug: '', accent_color: '#DE4F3C', is_active: true })}
          className="inline-flex items-center gap-2 py-3 px-6 rounded-full bg-curator-coral text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-curator-coral-hover hover:shadow-curator-glow active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <AdminTableSkeleton rows={3} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map(col => (
            <div
              key={col.id}
              className="bg-white rounded-[2rem] p-6 border border-curator-border shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white"
                    style={{ backgroundColor: col.accent_color || '#DE4F3C' }}
                  >
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-curator-surface-peach font-mono font-bold">
                    /{col.slug}
                  </span>
                </div>

                <h3 className="font-serif text-base font-bold text-curator-charcoal">
                  {col.name}
                </h3>
                <p className="text-xs text-curator-muted mt-1 font-sans">{col.description || 'Capsule collection drop'}</p>
              </div>

              <div className="pt-3 border-t border-curator-border/60 flex items-center justify-between">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-mono font-bold">
                  Featured
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingCol(col)}
                    className="p-1.5 rounded-lg border border-curator-border hover:bg-curator-surface-peach text-curator-charcoal"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(col.id)}
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
