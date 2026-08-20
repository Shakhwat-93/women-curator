import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Star, Sparkles, X } from 'lucide-react';
import { testimonialService } from '../../lib/api';
import { Testimonial } from '../../types';
import { useAdminToast } from '../context/AdminToastContext';
import { AdminTableSkeleton } from '../components/AdminSkeleton';
import { motion, AnimatePresence } from 'framer-motion';

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
        {editingItem && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingItem(null)}
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
                  {editingItem.id ? 'Edit Review' : 'Add Verified Review'}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="p-1 rounded-full text-curator-muted hover:text-curator-charcoal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                    Customer Full Name <span className="text-curator-coral">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.customer_name || ''}
                    onChange={e => setEditingItem({ ...editingItem, customer_name: e.target.value })}
                    placeholder="e.g. Ayesha Siddika"
                    className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs focus:outline-none focus:border-curator-coral min-h-[48px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                      City / Location
                    </label>
                    <input
                      type="text"
                      value={editingItem.city || ''}
                      onChange={e => setEditingItem({ ...editingItem, city: e.target.value })}
                      placeholder="e.g. Dhaka, Gulshan"
                      className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs focus:outline-none focus:border-curator-coral min-h-[48px]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                      Star Rating
                    </label>
                    <select
                      value={editingItem.rating || 5}
                      onChange={e => setEditingItem({ ...editingItem, rating: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-2xl border border-curator-border text-xs focus:outline-none bg-white min-h-[48px]"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5.0 Stars)</option>
                      <option value={4}>⭐⭐⭐⭐ (4.0 Stars)</option>
                      <option value={3}>⭐⭐⭐ (3.0 Stars)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-curator-charcoal mb-1.5">
                    Customer Review Feedback <span className="text-curator-coral">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={editingItem.review || ''}
                    onChange={e => setEditingItem({ ...editingItem, review: e.target.value })}
                    placeholder="Write customer review..."
                    className="w-full p-4 rounded-2xl border border-curator-border text-xs focus:outline-none focus:border-curator-coral"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="flex-1 sm:flex-initial px-5 py-3 rounded-full border border-curator-border text-xs font-bold text-curator-charcoal hover:bg-curator-surface-peach min-h-[48px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 sm:flex-initial px-7 py-3 rounded-full bg-curator-coral text-white text-xs font-bold shadow-md hover:bg-curator-coral-hover min-h-[48px]"
                  >
                    {isSaving ? 'Saving...' : 'Save Review'}
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
            <span>Social Proof</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-curator-charcoal">
            Customer Reviews ({testimonials.length})
          </h1>
        </div>

        <button
          onClick={() => setEditingItem({ customer_name: '', city: 'Dhaka', rating: 5, review: '', is_active: true })}
          className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-curator-coral text-white text-xs font-bold shadow-md hover:bg-curator-coral-hover active:scale-95 transition-all self-stretch sm:self-auto min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Review</span>
        </button>
      </div>

      {/* Testimonials Grid */}
      {isLoading ? (
        <AdminTableSkeleton rows={3} />
      ) : testimonials.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-curator-border p-12 text-center">
          <p className="text-xs text-curator-muted">No testimonials added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-6 border border-curator-border shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: item.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingItem(item)}
                      aria-label="Edit review"
                      className="p-1.5 rounded-lg text-curator-muted hover:text-curator-charcoal hover:bg-curator-surface-peach min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      aria-label="Delete review"
                      className="p-1.5 rounded-lg text-curator-muted hover:text-rose-600 hover:bg-rose-50 min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-curator-charcoal leading-relaxed italic">
                  "{item.review || item.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-curator-border/60">
                <h4 className="font-serif text-xs font-bold text-curator-charcoal">
                  {item.customer_name || item.name}
                </h4>
                <p className="text-[10px] text-curator-muted font-mono">
                  {item.city || item.location || 'Dhaka'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
