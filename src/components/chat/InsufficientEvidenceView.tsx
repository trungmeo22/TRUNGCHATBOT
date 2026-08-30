import React from 'react';
import { HelpCircle, Sparkles, BookOpen, Layers } from 'lucide-react';

interface InsufficientEvidenceViewProps {
  onSuggestionClick?: (suggestion: string) => void;
  isScopedToSingleSource?: boolean;
}

export const InsufficientEvidenceView: React.FC<InsufficientEvidenceViewProps> = ({
  onSuggestionClick,
  isScopedToSingleSource = false,
}) => {
  return (
    <div
      id="insufficient-evidence-card"
      className="flex items-start gap-4 max-w-[760px] mx-auto py-4 px-4 sm:px-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-950 animate-in fade-in duration-200"
    >
      <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-300/80 flex items-center justify-center text-amber-800 shrink-0 mt-0.5 shadow-2xs">
        <HelpCircle className="w-5 h-5" />
      </div>

      <div className="flex-1 space-y-3">
        <div>
          <h3 className="text-base font-bold text-amber-950 tracking-tight">
            Chưa đủ bằng chứng trong kho tài liệu hiện tại
          </h3>
          <p className="text-sm sm:text-[15px] text-amber-900/90 leading-relaxed mt-1">
            Tài liệu trong phạm vi nguồn hiện chọn chưa đủ để trả lời câu hỏi này một cách đáng tin cậy và chính xác.
          </p>
        </div>

        <div className="pt-2.5 space-y-2 border-t border-amber-200/60">
          <div className="text-xs font-bold text-amber-900 uppercase tracking-wider">
            Gợi ý tra cứu:
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-200/90 text-amber-950 text-xs sm:text-sm font-medium shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Thử diễn đạt câu hỏi cụ thể hơn theo danh pháp y khoa
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-amber-200/90 text-amber-950 text-xs sm:text-sm font-medium shadow-2xs">
              <Layers className="w-3.5 h-3.5 text-amber-600" />
              Bạn có thể thử mở rộng phạm vi nguồn tài liệu (Tất cả nguồn)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
