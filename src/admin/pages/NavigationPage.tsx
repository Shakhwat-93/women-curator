import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Sparkles } from 'lucide-react';
import { navigationService } from '../../lib/api';
import { NavigationItem } from '../../types';
import { useAdminToast } from '../context/AdminToastContext';
import { AdminTableSkeleton } from '../components/AdminSkeleton';

export const NavigationPage: React.FC = () => {
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useAdminToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await navigationService.getNavigation();
      setItems(data);
    } catch {
      error('Failed to load navigation');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddItem = () => {
    const newItem: NavigationItem = {
      id: `nav-${Date.now()}`,
      label: 'New Link',
      url: '#products',
      sort_order: items.length + 1,
      is_active: true
    };
    setItems([...items, newItem]);
  };

  const handleUpdate = (idx: number, key: keyof NavigationItem, val: any) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [key]: val };
    setItems(updated);
  };

  const handleDelete = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await navigationService.saveNavigation(items);
      if (res.success) {
        success('Navigation menu saved! Live storefront updated.');
      } else {
        error(res.error || 'Failed to save navigation');
      }
    } catch {
      error('Failed to save navigation');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-curator-coral-light text-curator-coral text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Store Navigation</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-curator-charcoal">
            Navbar Menu Links
          </h1>
          <p className="text-xs text-curator-muted font-sans mt-0.5">
            Configure header menu destinations and links
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddItem}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl border border-curator-border bg-white text-xs font-bold text-curator-charcoal hover:text-curator-coral shadow-xs min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Link</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-curator-coral text-white text-xs font-bold shadow-md hover:bg-curator-coral-hover active:scale-95 disabled:opacity-50 min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Menu'}</span>
          </button>
        </div>
      </div>

      {/* Items List */}
      {isLoading ? (
        <AdminTableSkeleton rows={4} />
      ) : (
        <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 border border-curator-border shadow-xs space-y-3 max-w-3xl">
          {items.map((item, idx) => (
            <div key={item.id} className="flex items-center gap-2 sm:gap-3 p-3 rounded-2xl bg-[#FAF5EE]/60 border border-curator-border">
              <span className="w-7 h-7 rounded-xl bg-white border border-curator-border font-mono text-xs font-bold text-curator-coral flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </span>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={item.label}
                  onChange={e => handleUpdate(idx, 'label', e.target.value)}
                  placeholder="Link Label"
                  className="px-3 py-2 rounded-xl border border-curator-border bg-white text-xs font-bold text-curator-charcoal focus:outline-none min-h-[40px]"
                />
                <input
                  type="text"
                  value={item.url}
                  onChange={e => handleUpdate(idx, 'url', e.target.value)}
                  placeholder="#section-id or URL"
                  className="px-3 py-2 rounded-xl border border-curator-border bg-white text-xs font-mono text-curator-muted focus:outline-none min-h-[40px]"
                />
              </div>

              <button
                type="button"
                onClick={() => handleDelete(idx)}
                aria-label="Remove menu item"
                className="p-2 rounded-xl text-curator-muted hover:text-rose-600 hover:bg-rose-50 min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
