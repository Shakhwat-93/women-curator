import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = true,
  onConfirm,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-curator-charcoal/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white rounded-[2rem] p-6 shadow-2xl border border-curator-border z-10"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-curator-muted hover:text-curator-charcoal hover:bg-curator-surface-peach"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isDanger ? 'bg-rose-100 text-rose-600' : 'bg-curator-coral-light text-curator-coral'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg font-bold text-curator-charcoal">{title}</h3>
          </div>

          <p className="text-xs text-curator-muted leading-relaxed mb-6 font-sans">
            {message}
          </p>

          <div className="flex items-center justify-end gap-2.5">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-curator-border text-xs font-semibold text-curator-charcoal hover:bg-curator-surface-peach transition-all"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-5 py-2.5 rounded-full text-xs font-bold text-white shadow-md transition-all ${
                isDanger
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-curator-coral hover:bg-curator-coral-hover'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
