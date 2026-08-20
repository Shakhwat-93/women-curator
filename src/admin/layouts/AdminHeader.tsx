import React, { useState, useEffect } from 'react';
import { Search, Bell, ExternalLink, Plus, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAdminToast } from '../context/AdminToastContext';
import { useAdminAuth } from '../context/AdminAuthContext';
import { AdminProfileModal } from '../components/AdminProfileModal';

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { info } = useAdminToast();
  const { user } = useAdminAuth();
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
          info(`🔔 New Order: ${payload.new?.customer_name} (৳${payload.new?.total})`);
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
      setIsMobileSearchOpen(false);
      navigate(`/admin/orders?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <AdminProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      <header className="sticky top-0 z-30 h-14 sm:h-16 bg-white/95 backdrop-blur-md border-b border-curator-border px-3 sm:px-6 flex items-center justify-between gap-3 shadow-xs">
        
        {/* Mobile Brand Logo & App Bar */}
        <div className="flex items-center gap-2 lg:hidden">
          <Link to="/admin" className="flex items-center gap-1 select-none">
            <span className="font-serif text-base font-bold tracking-tight text-curator-charcoal">
              Women
            </span>
            <span className="text-curator-coral text-xs">✦</span>
            <span className="font-serif text-base font-normal text-curator-coral">
              Admin
            </span>
          </Link>
        </div>

        {/* Desktop Global Search Bar */}
        <div className="hidden lg:flex items-center gap-3 flex-1 max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-curator-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search orders, customers, products..."
              className="w-full pl-9 pr-4 py-2 rounded-full border border-curator-border bg-[#FAF5EE]/60 text-xs focus:outline-none focus:border-curator-coral focus:bg-white transition-all font-sans"
            />
          </form>
        </div>

        {/* Mobile Search Overlay Trigger */}
        {isMobileSearchOpen ? (
          <form onSubmit={handleSearchSubmit} className="flex lg:hidden items-center gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-curator-muted" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search orders..."
                className="w-full pl-9 pr-3 py-1.5 rounded-full border border-curator-coral bg-white text-xs focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(false)}
              className="p-1.5 rounded-full text-curator-muted hover:text-curator-charcoal"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        ) : null}

        {/* Right Action Icons: Add Product, Search, Notifications, Profile */}
        <div className={`flex items-center gap-1.5 sm:gap-2.5 ${isMobileSearchOpen ? 'hidden' : 'flex'}`}>
          {/* Mobile Search Icon */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(true)}
            aria-label="Open search"
            className="lg:hidden p-2 rounded-full border border-curator-border text-curator-charcoal hover:bg-curator-surface-peach"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Quick Add Product Drop (Hidden on smallest screens to save space) */}
          <Link
            to="/admin/products/new"
            aria-label="Add new product drop"
            className="hidden sm:flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-curator-coral text-white text-xs font-bold shadow-sm hover:bg-curator-coral-hover active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Drop</span>
          </Link>

          {/* Realtime Order Alert Notification Pill */}
          <Link
            to="/admin/orders"
            aria-label="Orders notification"
            className="relative p-2 sm:p-2.5 rounded-full border border-curator-border hover:bg-curator-surface-peach text-curator-charcoal transition-all"
            title="Orders"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-curator-coral text-white text-[9px] sm:text-[10px] font-bold flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </Link>

          {/* Storefront Link (Desktop only) */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 py-1.5 px-3 rounded-full border border-curator-border text-xs font-semibold text-curator-charcoal hover:text-curator-coral hover:border-curator-coral transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Live Store</span>
          </a>

          {/* User Profile Avatar Trigger */}
          <button
            type="button"
            onClick={() => setIsProfileOpen(true)}
            aria-label="Admin Profile Menu"
            className="flex items-center gap-2 p-1 pl-1 pr-2 sm:pr-3 rounded-full border border-curator-border hover:border-curator-coral bg-[#FAF5EE]/60 transition-all cursor-pointer select-none active:scale-95"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-curator-coral text-white font-serif font-bold text-xs flex items-center justify-center shadow-xs">
              {user?.full_name?.charAt(0) || 'A'}
            </div>
            <span className="hidden sm:inline text-xs font-bold text-curator-charcoal truncate max-w-[100px]">
              {user?.full_name?.split(' ')[0] || 'Admin'}
            </span>
          </button>
        </div>
      </header>
    </>
  );
};
