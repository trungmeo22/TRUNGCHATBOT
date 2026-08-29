import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface EmptyStateProps {
  onSelectSuggestion?: (query: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = () => {
  return (
    <div
      id="chat-empty-state"
      className="flex flex-col items-center justify-center min-h-[40vh] max-w-lg mx-auto px-4 py-8 text-center animate-in fade-in duration-300"
    >
      {/* Blue medical badge */}
      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs mb-4">
        <ShieldCheck className="w-6 h-6 stroke-[2]" />
      </div>

      <h1 className="text-[15px] font-normal text-[#d4d7e3] tracking-normal max-w-md">
        Hỏi đáp kiến thức y khoa theo nguồn tài liệu tùy chọn, trích dẫn chính xác, chống Hallucination!
      </h1>
    </div>
  );
};
