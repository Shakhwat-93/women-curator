import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Eye, EyeOff, Save, Sparkles } from 'lucide-react';
import { homepageService } from '../../lib/api';
import { HomepageSection } from '../../types';
import { useAdminToast } from '../context/AdminToastContext';
import { AdminTableSkeleton } from '../components/AdminSkeleton';

export const HomepageSectionsPage: React.FC = () => {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { success, error } = useAdminToast();

  const loadSections = async () => {
    setIsLoading(true);
    try {
      const data = await homepageService.getSections();
      setSections(data);
    } catch {
      error('Failed to load sections');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const next = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= next.length) return;

    const temp = next[index];
    next[index] = next[targetIndex];
    next[targetIndex] = temp;

    setSections(next);
  };

  const handleToggle = (index: number) => {
    const next = [...sections];
    next[index] = { ...next[index], is_enabled: !next[index].is_enabled };
    setSections(next);
  };

  const handleTitleChange = (index: number, newTitle: string) => {
    const next = [...sections];
    next[index] = { ...next[index], title: newTitle };
    setSections(next);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await homepageService.updateSectionsOrder(sections);
      if (res.success) {
        success('Homepage layout saved! Storefront updated.');
      } else {
        error(res.error || 'Failed to save layout');
      }
    } catch {
      error('Failed to save layout');
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
            <span>Storefront Architecture</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-curator-charcoal">
            Homepage Sections
          </h1>
          <p className="text-xs text-curator-muted font-sans mt-0.5">
            Reorder or toggle visibility of landing page sections with live sync
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-curator-coral text-white text-xs font-bold shadow-md hover:bg-curator-coral-hover active:scale-95 transition-all self-stretch sm:self-auto disabled:opacity-50 min-h-[44px]"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving...' : 'Save Section Order'}</span>
        </button>
      </div>

      {/* Sections List */}
      {isLoading ? (
        <AdminTableSkeleton rows={6} />
      ) : (
        <div className="space-y-3 max-w-4xl">
          {sections.map((sec, idx) => (
            <div
              key={sec.id || sec.section_key}
              className={`p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] border transition-all flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 ${
                sec.is_enabled
                  ? 'bg-white border-curator-border shadow-xs'
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              {/* Order Number & Title */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="w-8 h-8 rounded-xl bg-[#FAF5EE] border border-curator-border font-mono text-xs font-bold text-curator-coral flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <input
                    type="text"
                    value={sec.title}
                    onChange={e => handleTitleChange(idx, e.target.value)}
                    className="font-serif text-sm sm:text-base font-bold text-curator-charcoal bg-transparent border-b border-transparent hover:border-curator-border focus:border-curator-coral focus:outline-none w-full py-0.5"
                  />
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-curator-surface-peach text-curator-muted font-mono uppercase">
                      {sec.section_key}
                    </span>
                    <span className="text-[11px] text-curator-muted truncate">
                      {sec.subtitle || 'Landing section'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions: Reorder & Toggle */}
              <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-curator-border/40">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    aria-label="Move section up"
                    className="p-2.5 rounded-xl border border-curator-border hover:bg-curator-surface-peach text-curator-charcoal disabled:opacity-30 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === sections.length - 1}
                    aria-label="Move section down"
                    className="p-2.5 rounded-xl border border-curator-border hover:bg-curator-surface-peach text-curator-charcoal disabled:opacity-30 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggle(idx)}
                  className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all min-h-[40px] ${
                    sec.is_enabled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-gray-100 text-gray-600 border border-gray-300'
                  }`}
                >
                  {sec.is_enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{sec.is_enabled ? 'Visible' : 'Hidden'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
