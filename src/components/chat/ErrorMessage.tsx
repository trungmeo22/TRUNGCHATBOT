import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message = 'Không thể kết nối tới máy chủ.',
  onRetry,
}) => {
  return (
    <div
      id="chat-error-card"
      className="flex items-start gap-4 max-w-[720px] mx-auto py-4 px-4 rounded-xl bg-red-50/70 border border-red-200/80 text-red-900 animate-in fade-in duration-200"
    >
      <div className="w-8 h-8 rounded-full bg-red-100 border border-red-200 flex items-center justify-center text-red-700 shrink-0 mt-0.5">
        <AlertCircle className="w-4 h-4" />
      </div>

      <div className="flex-1 space-y-2">
        <div className="text-xs font-bold text-red-800 uppercase tracking-wider">
          Thông báo hệ thống
        </div>
        <p className="text-sm text-red-900 leading-relaxed font-medium">
          {message}
        </p>

        {onRetry && (
          <div className="pt-1">
            <button
              type="button"
              id="error-retry-btn"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-red-300 text-red-800 hover:bg-red-50 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Thử lại</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
