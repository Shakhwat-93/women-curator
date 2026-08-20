import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface AdminToastContextType {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const AdminToastContext = createContext<AdminToastContextType | undefined>(undefined);

export const AdminToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType = 'success') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3800);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <AdminToastContext.Provider
      value={{
        toast: addToast,
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        info: (msg) => addToast(msg, 'info')
      }}
    >
      {children}

      {/* Floating Toast Container — positioned above mobile bottom nav bar (bottom-20) */}
      <div className="fixed bottom-20 sm:bottom-5 right-4 left-4 sm:left-auto sm:right-5 z-50 flex flex-col gap-2 max-w-sm w-auto sm:w-full pointer-events-none pb-[env(safe-area-inset-bottom)]">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 15, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              className={`pointer-events-auto p-3.5 sm:p-4 rounded-2xl shadow-xl border flex items-center gap-3 backdrop-blur-md ${
                t.type === 'success'
                  ? 'bg-white/95 border-emerald-200 text-emerald-950'
                  : t.type === 'error'
                  ? 'bg-white/95 border-rose-200 text-rose-950'
                  : 'bg-white/95 border-curator-border text-curator-charcoal'
              }`}
            >
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />}
              {t.type === 'info' && <Info className="w-5 h-5 text-curator-coral flex-shrink-0" />}

              <p className="text-xs font-semibold leading-snug flex-1 font-sans">{t.message}</p>

              <button
                onClick={() => removeToast(t.id)}
                aria-label="Dismiss toast"
                className="p-1 rounded-full text-curator-muted hover:text-curator-charcoal"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AdminToastContext.Provider>
  );
};

export const useAdminToast = () => {
  const context = useContext(AdminToastContext);
  if (!context) throw new Error('useAdminToast must be used within AdminToastProvider');
  return context;
};
