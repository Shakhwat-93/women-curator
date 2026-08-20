import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
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
  ChevronRight
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminMoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminMoreDrawer: React.FC<AdminMoreDrawerProps> = ({ isOpen, onClose }) => {
  const { logout, user } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/admin/login');
  };

  const navSections = [
    {
      title: 'CATALOG & ORGANIZATION',
      items: [
        { label: 'Categories', path: '/admin/categories', icon: FolderTree, desc: 'Manage dress categories' },
        { label: 'Collections', path: '/admin/collections', icon: Layers, desc: 'Capsule & seasonal drops' }
      ]
    },
    {
      title: 'CONTENT & HOMEPAGE CMS',
      items: [
        { label: 'Homepage Sections', path: '/admin/content/homepage', icon: Sliders, desc: 'Reorder & toggle sections' },
        { label: 'Hero Slides', path: '/admin/content/hero', icon: Sparkles, desc: 'Campaign banners & blobs' },
        { label: 'Testimonials', path: '/admin/content/testimonials', icon: MessageSquareQuote, desc: 'Customer reviews & ratings' },
        { label: 'Navigation Menu', path: '/admin/content/navigation', icon: Compass, desc: 'Navbar link destinations' }
      ]
    },
    {
      title: 'MARKETING & AUDIENCE',
      items: [
        { label: 'Announcement Bar', path: '/admin/marketing/announcement', icon: Megaphone, desc: 'Top promotion banner' },
        { label: 'Newsletter Leads', path: '/admin/marketing/newsletter', icon: Mail, desc: 'Subscriber emails & export' }
      ]
    },
    {
      title: 'SETTINGS & MEDIA',
      items: [
        { label: 'Media Cloud Library', path: '/admin/media', icon: Image, desc: 'Supabase storage files' },
        { label: 'Store Settings', path: '/admin/settings/store', icon: Store, desc: 'Brand, helpline, address' },
        { label: 'Delivery Fees', path: '/admin/settings/delivery', icon: Truck, desc: 'Inside/Outside Dhaka rates' },
        { label: 'Admin Team', path: '/admin/settings/admins', icon: Users, desc: 'Roles & authorizations' }
      ]
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-end lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-curator-charcoal/60 backdrop-blur-sm"
          />

          {/* Bottom Sheet Window */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-h-[85vh] bg-[#FDFBF7] rounded-t-[2.5rem] shadow-2xl border-t border-curator-border z-10 flex flex-col overflow-hidden pb-[env(safe-area-inset-bottom)]"
          >
            {/* Grab Handle */}
            <div className="w-12 h-1.5 rounded-full bg-curator-muted/30 mx-auto mt-3 mb-1" />

            {/* Header */}
            <div className="px-6 py-3 border-b border-curator-border/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold text-curator-charcoal">
                  Store Management
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-curator-coral-light text-curator-coral font-bold font-mono uppercase">
                  {user?.role || 'Owner'}
                </span>
              </div>

              <button
                onClick={onClose}
                aria-label="Close menu"
                className="w-8 h-8 rounded-full bg-white border border-curator-border text-curator-muted flex items-center justify-center hover:text-curator-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Navigation Groups */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {navSections.map((sec, idx) => (
                <div key={idx} className="space-y-2">
                  <span className="px-2 text-[10px] font-bold tracking-widest text-curator-muted font-mono uppercase">
                    {sec.title}
                  </span>

                  <div className="bg-white rounded-2xl border border-curator-border divide-y divide-curator-border/50 overflow-hidden shadow-xs">
                    {sec.items.map(item => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center justify-between p-3.5 transition-colors min-h-[48px] ${
                            isActive
                              ? 'bg-curator-coral-light/60 text-curator-coral font-bold'
                              : 'text-curator-charcoal hover:bg-curator-surface-peach/50'
                          }`
                        }
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-[#FAF5EE] border border-curator-border/60 flex items-center justify-center flex-shrink-0 text-curator-coral">
                            <item.icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold truncate leading-tight">
                              {item.label}
                            </h4>
                            <p className="text-[10px] text-curator-muted truncate mt-0.5">
                              {item.desc}
                            </p>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-curator-muted flex-shrink-0" />
                      </NavLink>
                    ))}
                  </div>
                </div>
              ))}

              {/* Bottom Quick Links (View Storefront & Logout) */}
              <div className="pt-2 grid grid-cols-2 gap-3">
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-curator-border bg-white text-xs font-bold text-curator-charcoal hover:text-curator-coral shadow-xs min-h-[48px]"
                >
                  <ExternalLink className="w-4 h-4 text-curator-coral" />
                  <span>View Store</span>
                </a>

                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100 shadow-xs min-h-[48px]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
