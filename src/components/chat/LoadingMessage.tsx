import React from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';

interface LoadingMessageProps {
  text?: string;
}

export const LoadingMessage: React.FC<LoadingMessageProps> = ({
  text = 'Đang tra cứu và tổng hợp từ tài liệu...',
}) => {
  return (
    <div
      id="chat-loading-message"
      className="flex items-start gap-4 max-w-[720px] mx-auto py-4 px-3 sm:px-4 rounded-xl transition-colors animate-in fade-in duration-200"
    >
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-2xs">
        <ShieldCheck className="w-4 h-4" />
      </div>

      <div className="flex-1 space-y-3 pt-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
          <span>{text}</span>
        </div>

        {/* Subtle skeleton lines */}
        <div className="space-y-2 max-w-md pt-1">
          <div className="h-3 bg-gray-200/70 rounded-full w-full animate-pulse" />
          <div className="h-3 bg-gray-200/70 rounded-full w-4/5 animate-pulse" />
          <div className="h-3 bg-gray-200/60 rounded-full w-2/3 animate-pulse" />
        </div>
      </div>
    </div>
  );
};
