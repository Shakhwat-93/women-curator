import React, { useState, useEffect } from 'react';
import { Mail, Download, Search, Sparkles, RefreshCw } from 'lucide-react';
import { marketingService } from '../../lib/api';
import { NewsletterSubscriber } from '../../types';
import { useAdminToast } from '../context/AdminToastContext';
import { AdminTableSkeleton } from '../components/AdminSkeleton';

export const NewsletterPage: React.FC = () => {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { success, error } = useAdminToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await marketingService.getSubscribers();
      setSubscribers(data);
    } catch {
      error('Failed to load subscribers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExportCSV = () => {
    if (subscribers.length === 0) return;
    const headers = ['Email', 'Name', 'Status', 'Date Subscribed'];
    const rows = subscribers.map(s => [s.email, `"${s.name || ''}"`, s.status, s.created_at || '']);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `newsletter-subscribers-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Subscribers exported as CSV');
  };

  const filtered = subscribers.filter(s =>
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 lg:pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-curator-coral-light text-curator-coral text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3" />
            <span>Audience & Leads</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-curator-charcoal">
            Newsletter Subscribers ({subscribers.length})
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl border border-curator-border bg-white text-xs font-bold text-curator-charcoal hover:text-curator-coral shadow-xs transition-colors min-h-[44px]"
          >
            <Download className="w-4 h-4 text-curator-coral" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={loadData}
            title="Refresh"
            aria-label="Refresh subscribers"
            className="p-2.5 rounded-full border border-curator-border bg-white text-curator-charcoal shadow-xs flex-shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-[2rem] p-3 sm:p-4 border border-curator-border shadow-xs max-w-sm">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-curator-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search email..."
            className="w-full pl-9 pr-4 py-2 rounded-full border border-curator-border bg-[#FAF5EE]/50 text-xs focus:outline-none focus:border-curator-coral font-sans"
          />
        </div>
      </div>

      {isLoading ? (
        <AdminTableSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-curator-border p-12 text-center space-y-2">
          <Mail className="w-10 h-10 text-curator-muted mx-auto" />
          <p className="text-xs text-curator-muted">No subscribers yet.</p>
        </div>
      ) : (
        <>
          {/* MOBILE: Cards (< 768px) */}
          <div className="block md:hidden space-y-3">
            {filtered.map((sub, i) => (
              <div
                key={sub.id || i}
                className="bg-white rounded-2xl p-4 border border-curator-border shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-curator-charcoal truncate max-w-[200px]">
                    {sub.email}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold font-mono">
                    {sub.status || 'subscribed'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-curator-muted">
                  <span>{sub.name || 'Lead'}</span>
                  <span className="font-mono text-[10px]">
                    {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP: Table (>= 768px) */}
          <div className="hidden md:block bg-white rounded-[2rem] border border-curator-border shadow-xs overflow-hidden max-w-4xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF5EE]/70 border-b border-curator-border font-mono text-[10px] uppercase text-curator-muted">
                <tr>
                  <th className="py-3.5 px-6 font-semibold">Email Address</th>
                  <th className="py-3.5 px-4 font-semibold">Name</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Subscribed Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-curator-border/60">
                {filtered.map((sub, i) => (
                  <tr key={sub.id || i} className="hover:bg-curator-surface-peach/20 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-semibold text-curator-charcoal">
                      {sub.email}
                    </td>
                    <td className="py-3.5 px-4 text-curator-muted">
                      {sub.name || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold font-mono">
                        {sub.status || 'subscribed'}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right font-mono text-[11px] text-curator-muted">
                      {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : 'Recent'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
