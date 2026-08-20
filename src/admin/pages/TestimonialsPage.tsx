import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Star, Sparkles, X } from 'lucide-react';
import { testimonialService } from '../../lib/api';
import { Testimonial } from '../../types';
import { useAdminToast } from '../context/AdminToastContext';
import { AdminTableSkeleton } from '../components/AdminSkeleton';

export const TestimonialsPage: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<Partial<Testimonial> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useAdminToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await testimonialService.getTestimonials();
      setTestimonials(data);
    } catch {
      error('Failed to load testimonials');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.customer_name || !editingItem?.review) {
      error('Name and review text are required');
      return;
    }
    setIsSaving(true);
    try {
      const res = await testimonialService.saveTestimonial(editingItem);
      if (res.success) {
        success('Testimonial saved successfully');
        setEditingItem(null);
        loadData();
      } else {
        error(res.error || 'Failed to save testimonial');
      }
    } catch {
      error('Failed to save testimonial');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await testimonialService.deleteTestimonial(id);
      if (res.success) {
        success('Testimonial deleted');
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
      {/* Modal Editor */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-curator-charcoal/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full border border-curator-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-curator-border pb-2">
              <h3 className="font-serif text-lg font-bold text-curator-charcoal">
                {editingItem.id ? 'Edit Review' : 'Add New Customer Review'}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-full text-curator-muted hover:text-curator-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                  Customer Name <span className="text-curator-coral">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingItem.customer_name || ''}
                  onChange={e => setEditingItem({ ...editingItem, customer_name: e.target.value })}
                  placeholder="e.g. Ayesha Siddika"
                  className="w-full px-4 py-2.5 rounded-xl border border-curator-border text-xs focus:outline-none focus:border-curator-coral"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    value={editingItem.city || ''}
                    onChange={e => setEditingItem({ ...editingItem, city: e.target.value })}
                    placeholder="Dhaka / Chittagong"
                    className="w-full px-4 py-2.5 rounded-xl border border-curator-border text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                    Star Rating (1-5)
                  </label>
                  <select
                    value={editingItem.rating || 5}
                    onChange={e => setEditingItem({ ...editingItem, rating: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-curator-border text-xs focus:outline-none"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5.0)</option>
                    <option value={4}>⭐⭐⭐⭐ (4.0)</option>
                    <option value={3}>⭐⭐⭐ (3.0)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1">
                  Customer Review (Bengali / English) <span className="text-curator-coral">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={editingItem.review || ''}
                  onChange={e => setEditingItem({ ...editingItem, review: e.target.value })}
                  placeholder="Review comment..."
                  className="w-full px-4 py-2.5 rounded-xl border border-curator-border text-xs resize-none focus:outline-none focus:border-curator-coral"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-5 py-2.5 rounded-full border border-curator-border text-xs font-semibold text-curator-charcoal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-full bg-curator-coral text-white text-xs font-bold hover:bg-curator-coral-hover shadow-md transition-all"
                >
                  {isSaving ? 'Saving...' : 'Save Review'}
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
            <span>Social Proof</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-curator-charcoal">
            Customer Reviews ({testimonials.length})
          </h1>
        </div>

        <button
          onClick={() => setEditingItem({ customer_name: '', city: 'Dhaka', rating: 5, review: '', is_active: true })}
          className="inline-flex items-center gap-2 py-3 px-6 rounded-full bg-curator-coral text-white text-xs font-bold uppercase tracking-wider shadow-lg hover:bg-curator-coral-hover hover:shadow-curator-glow active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Review</span>
        </button>
      </div>

      {/* Testimonials Grid */}
      {isLoading ? (
        <AdminTableSkeleton rows={3} />
      ) : testimonials.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-curator-border p-12 text-center">
          <p className="text-xs text-curator-muted">No testimonials added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-[2rem] p-6 border border-curator-border shadow-sm flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: Math.round(item.rating || 5) }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-curator-muted font-bold">
                    {item.city}
                  </span>
                </div>

                <p className="text-xs text-curator-charcoal/90 leading-relaxed font-sans italic">
                  "{item.review}"
                </p>
              </div>

              <div className="pt-3 border-t border-curator-border/60 flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-sm font-bold text-curator-charcoal">
                    {item.customer_name}
                  </h4>
                  <span className="text-[10px] text-emerald-700 font-semibold">✓ Verified Buyer</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="p-1.5 rounded-lg border border-curator-border hover:bg-curator-surface-peach text-curator-charcoal"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
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
