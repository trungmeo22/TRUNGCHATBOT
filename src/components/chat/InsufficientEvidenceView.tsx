import React from 'react';
import { HelpCircle, Sparkles, BookOpen } from 'lucide-react';

interface InsufficientEvidenceViewProps {
  onSuggestionClick?: (suggestion: string) => void;
}

export const InsufficientEvidenceView: React.FC<InsufficientEvidenceViewProps> = ({
  onSuggestionClick,
}) => {
  return (
    <div
      id="insufficient-evidence-card"
      className="flex items-start gap-4 max-w-[720px] mx-auto py-4 px-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-950 animate-in fade-in duration-200"
    >
      <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300/80 flex items-center justify-center text-amber-800 shrink-0 mt-0.5 shadow-2xs">
        <HelpCircle className="w-4 h-4" />
      </div>

      <div className="flex-1 space-y-2.5">
        <div>
          <h3 className="text-sm font-bold text-amber-900 tracking-tight">
            Chưa đủ bằng chứng trong kho tài liệu
          </h3>
          <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed mt-1">
            Tôi chưa tìm thấy đủ thông tin trong các tài liệu hiện có để đưa ra câu trả lời đáng tin cậy cho câu hỏi này.
          </p>
        </div>

        <div className="pt-1.5 space-y-1.5 border-t border-amber-200/60">
          <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
            Gợi ý tra cứu:
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-amber-200/90 text-amber-900 text-xs font-medium shadow-2xs">
              <Sparkles className="w-3 h-3 text-amber-600" />
              Thử diễn đạt câu hỏi cụ thể hơn theo danh pháp y khoa
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-amber-200/90 text-amber-900 text-xs font-medium shadow-2xs">
              <BookOpen className="w-3 h-3 text-amber-600" />
              Kiểm tra lại phạm vi tài liệu hiện có (Bộ Y tế / Hiệp hội)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
