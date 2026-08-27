import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div
      id="app-toast-notification"
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gray-900 text-white text-xs font-medium shadow-xl backdrop-blur-sm transition-all duration-200 animate-in fade-in zoom-in-95"
      role="status"
      aria-live="polite"
    >
      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      <span>{message}</span>
    </div>
  );
};
