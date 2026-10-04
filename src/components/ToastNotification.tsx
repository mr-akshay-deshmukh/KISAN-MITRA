import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, LogOut, Sparkles, X, ShieldCheck } from 'lucide-react';
import { GoogleLogoIcon } from './GoogleIcons';

export interface ToastMessage {
  id: string;
  type: 'google_login' | 'google_logout' | 'success' | 'info';
  title: string;
  message?: string;
  userAvatar?: string;
  userEmail?: string;
}

interface ToastNotificationProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  return (
    <div className="absolute top-5 right-5 z-50 pointer-events-none flex flex-col items-end space-y-2">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.9, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, scale: 0.9, filter: 'blur(4px)' }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="pointer-events-auto max-w-sm w-full bg-[#141B17]/95 border border-[#2C3631] text-[#E5E9E7] p-3.5 rounded-2xl shadow-2xl backdrop-blur-xl flex items-start gap-3 ring-1 ring-[#C2D66E]/20"
          >
            {/* Icon Banner */}
            <div className="shrink-0 mt-0.5">
              {toast.type === 'google_login' ? (
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
                  <GoogleLogoIcon className="w-5 h-5" />
                </div>
              ) : toast.type === 'google_logout' ? (
                <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-300">
                  <LogOut className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[#C2D66E]/20 border border-[#C2D66E]/40 flex items-center justify-center text-[#C2D66E]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-xs text-[#E5E9E7] truncate leading-tight">
                  {toast.title}
                </h4>
                {toast.type === 'google_login' && (
                  <span className="text-[9px] bg-[#C2D66E]/20 text-[#C2D66E] px-1.5 py-0.2 rounded font-black uppercase tracking-wider shrink-0">
                    Google
                  </span>
                )}
              </div>

              {toast.message && (
                <p className="text-[11px] text-[#8E9B94] mt-0.5 line-clamp-2 leading-relaxed">
                  {toast.message}
                </p>
              )}

              {toast.userEmail && (
                <div className="flex items-center gap-1 text-[10px] text-[#C2D66E] font-mono mt-1 truncate">
                  <ShieldCheck className="w-3 h-3 text-[#C2D66E] shrink-0" />
                  <span className="truncate">{toast.userEmail}</span>
                </div>
              )}
            </div>

            {/* Dismiss Button */}
            <button
              onClick={onClose}
              className="text-[#8E9B94] hover:text-[#E5E9E7] p-1 rounded-lg hover:bg-[#1A221E] transition-colors shrink-0 cursor-pointer"
              title="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
