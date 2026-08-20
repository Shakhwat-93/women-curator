import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  FolderTree,
  Sliders,
  Sparkles,
  MessageSquareQuote,
  Compass,
  Megaphone,
  Mail,
  Store,
  Truck,
  Image,
  Users,
  ExternalLink,
  LogOut,
  X,
  Activity
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  end?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const { logout, user } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navGroups: NavGroup[] = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true }
      ]
    },
    {
      title: 'STORE',
      items: [
        { label: 'Products', path: '/admin/products', icon: Package },
        { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
        { label: 'Categories', path: '/admin/categories', icon: FolderTree },
        { label: 'Collections', path: '/admin/collections', icon: Layers }
      ]
    },
    {
      title: 'CONTENT & CMS',
      items: [
        { label: 'Homepage Sections', path: '/admin/content/homepage', icon: Sliders },
        { label: 'Hero Slides', path: '/admin/content/hero', icon: Sparkles },
        { label: 'Testimonials', path: '/admin/content/testimonials', icon: MessageSquareQuote },
        { label: 'Navigation', path: '/admin/content/navigation', icon: Compass }
      ]
    },
    {
      title: 'MARKETING & ANALYTICS',
      items: [
        { label: 'Analytics & Tracking', path: '/admin/settings/tracking', icon: Activity },
        { label: 'Announcement Bar', path: '/admin/marketing/announcement', icon: Megaphone },
        { label: 'Newsletter', path: '/admin/marketing/newsletter', icon: Mail }
      ]
    },
    {
      title: 'SETTINGS & MEDIA',
      items: [
        { label: 'Media Library', path: '/admin/media', icon: Image },
        { label: 'Store Settings', path: '/admin/settings/store', icon: Store },
        { label: 'Delivery Fees', path: '/admin/settings/delivery', icon: Truck },
        { label: 'Admin Team', path: '/admin/settings/admins', icon: Users }
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-curator-charcoal/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Window */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-[#FDFBF7] border-r border-curator-border flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 px-6 flex items-center justify-between border-b border-curator-border/80">
            <NavLink to="/admin" className="flex items-center gap-1.5 select-none">
              <span className="font-serif text-lg font-bold tracking-tight text-curator-charcoal">
                Women
              </span>
              <span className="text-curator-coral text-xs">✦</span>
              <span className="font-serif text-lg font-normal text-curator-coral">
                Admin
              </span>
            </NavLink>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-curator-muted hover:text-curator-charcoal lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links List */}
          <div className="p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
            {navGroups.map((group, idx) => (
              <div key={idx} className="space-y-1.5">
                <span className="px-3 text-[10px] font-bold tracking-widest text-curator-muted/80 uppercase font-mono">
                  {group.title}
                </span>

                <div className="space-y-0.5">
                  {group.items.map(item => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-curator-coral text-white shadow-sm font-bold'
                            : 'text-curator-charcoal hover:bg-curator-surface-peach/70 hover:text-curator-coral'
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-curator-border bg-[#FAF5EE]/80 space-y-2">
          <div className="px-3 py-1.5 flex items-center justify-between text-xs">
            <div className="min-w-0">
              <p className="font-bold text-curator-charcoal truncate">{user?.full_name || 'Admin'}</p>
              <p className="text-[10px] text-curator-muted font-mono capitalize">{user?.role || 'owner'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-curator-border bg-white text-[11px] font-semibold text-curator-charcoal hover:text-curator-coral hover:border-curator-coral transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Storefront</span>
            </a>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-rose-200 bg-rose-50 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
