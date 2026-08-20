import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, ExternalLink, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAdminToast } from '../context/AdminToastContext';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { info } = useAdminToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Realtime Supabase order subscription
    const channel = supabase
      .channel('admin-orders-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload: any) => {
          setUnreadCount(prev => prev + 1);
          info(`🔔 New Order Received: ${payload.new?.customer_name} (৳${payload.new?.total})`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [info]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/orders?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-curator-border px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl border border-curator-border text-curator-charcoal hover:bg-curator-surface-peach lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-curator-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search orders, products, customers... (Ctrl + K)"
            className="w-full pl-9 pr-4 py-2 rounded-full border border-curator-border bg-[#FAF5EE]/60 text-xs focus:outline-none focus:border-curator-coral focus:bg-white transition-all font-sans"
          />
        </form>
      </div>

      {/* Right: Quick Action Buttons & Realtime Notification */}
      <div className="flex items-center gap-2.5">
        <Link
          to="/admin/products/new"
          className="hidden sm:flex items-center gap-1.5 py-2 px-4 rounded-full bg-curator-coral text-white text-xs font-bold shadow-md hover:bg-curator-coral-hover active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Product</span>
        </Link>

        {/* Live Order Notification Pill */}
        <Link
          to="/admin/orders"
          className="relative p-2.5 rounded-full border border-curator-border hover:bg-curator-surface-peach text-curator-charcoal transition-all"
          title="Orders"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-curator-coral text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
              {unreadCount}
            </span>
          )}
        </Link>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 py-2 px-3.5 rounded-full border border-curator-border text-xs font-semibold text-curator-charcoal hover:text-curator-coral hover:border-curator-coral transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Live Store</span>
        </a>
      </div>
    </header>
  );
};
