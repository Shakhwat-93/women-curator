import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Shield, LogOut, ExternalLink, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminProfileModal: React.FC<AdminProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/admin/login');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-curator-charcoal/60 backdrop-blur-sm"
        />

        {/* Sheet / Modal */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          className="relative w-full max-w-sm bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 shadow-2xl border border-curator-border z-10 space-y-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-curator-border/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-curator-coral-light text-curator-coral font-serif font-bold text-base flex items-center justify-center border border-curator-coral/20">
                {user?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <h3 className="font-serif text-sm font-bold text-curator-charcoal truncate">
                  {user?.full_name || 'Store Owner'}
                </h3>
                <span className="text-[10px] px-2 py-0.2 rounded-full bg-curator-surface-peach text-curator-coral font-bold font-mono uppercase inline-block">
                  {user?.role || 'owner'}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close profile modal"
              className="w-8 h-8 rounded-full bg-curator-surface-peach/60 text-curator-muted flex items-center justify-center hover:text-curator-charcoal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Account Details */}
          <div className="p-3.5 rounded-2xl bg-[#FAF5EE]/70 border border-curator-border space-y-2 text-xs">
            <div className="flex items-center gap-2.5 text-curator-charcoal">
              <Mail className="w-3.5 h-3.5 text-curator-coral flex-shrink-0" />
              <span className="font-mono text-[11px] truncate">{user?.email || 'admin@womencurator.com'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-curator-muted">
              <Shield className="w-3.5 h-3.5 text-curator-coral flex-shrink-0" />
              <span className="text-[11px]">Role: <strong className="text-curator-charcoal uppercase font-mono">{user?.role || 'owner'}</strong></span>
            </div>
          </div>

          {/* Actions List */}
          <div className="space-y-1.5 pt-1">
            <Link
              to="/admin/settings/store"
              onClick={onClose}
              className="flex items-center gap-3 p-3 rounded-2xl border border-curator-border hover:bg-curator-surface-peach text-xs font-semibold text-curator-charcoal transition-colors"
            >
              <Settings className="w-4 h-4 text-curator-coral" />
              <span>Store & Helpline Settings</span>
            </Link>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-2xl border border-curator-border hover:bg-curator-surface-peach text-xs font-semibold text-curator-charcoal transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-curator-coral" />
              <span>View Customer Storefront</span>
            </a>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors mt-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Admin</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
