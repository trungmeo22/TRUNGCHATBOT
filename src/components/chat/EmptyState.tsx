import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface EmptyStateProps {
  onSelectSuggestion?: (query: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = () => {
  return (
    <div
      id="chat-empty-state"
      className="flex flex-col items-center justify-center min-h-[40vh] max-w-xl mx-auto px-4 py-8 text-center animate-in fade-in duration-300"
    >
      {/* Blue medical badge */}
      <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs mb-4">
        <ShieldCheck className="w-7 h-7 stroke-[2]" />
      </div>

      <h1 className="text-[16.5px] sm:text-[17.5px] font-medium text-gray-500 tracking-normal max-w-lg leading-relaxed">
        Hỏi đáp kiến thức y khoa theo nguồn tài liệu tùy chọn, trích dẫn chính xác, chống Hallucination!
      </h1>
    </div>
  );
};
