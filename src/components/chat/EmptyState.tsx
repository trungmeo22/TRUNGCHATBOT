import React from 'react';
import { ShieldCheck, Stethoscope, Activity, FileText, ArrowUpRight } from 'lucide-react';

interface EmptyStateProps {
  onSelectSuggestion: (query: string) => void;
}

const SUGGESTIONS = [
  {
    icon: Stethoscope,
    query: 'Khi nào hạ bậc điều trị hen phế quản?',
    category: 'Hô hấp & Dị ứng',
  },
  {
    icon: Activity,
    query: 'Chỉ định điều trị kháng đông trong rung nhĩ?',
    category: 'Tim mạch',
  },
  {
    icon: FileText,
    query: 'Tiêu chuẩn chẩn đoán hội chứng thận hư?',
    category: 'Thận - Tiết niệu',
  },
  {
    icon: ShieldCheck,
    query: 'Khi nào cần chỉ định HFNC?',
    category: 'Hồi sức cấp cứu',
  },
];

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectSuggestion }) => {
  return (
    <div
      id="chat-empty-state"
      className="flex flex-col items-center justify-center min-h-[50vh] max-w-xl mx-auto px-4 py-8 text-center animate-in fade-in duration-300"
    >
      {/* Blue medical badge */}
      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs mb-4">
        <ShieldCheck className="w-6 h-6 stroke-[2]" />
      </div>

      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-2">
        Hỏi từ kho kiến thức y khoa
      </h1>

      <p className="text-sm text-gray-500 max-w-md mb-8 leading-relaxed">
        Câu trả lời được tổng hợp từ các tài liệu đã được lập chỉ mục và kèm nguồn để kiểm chứng.
      </p>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
        {SUGGESTIONS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              type="button"
              id={`suggestion-card-${idx}`}
              onClick={() => onSelectSuggestion(item.query)}
              className="group flex flex-col justify-between p-3.5 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-xs transition-all duration-150 text-left cursor-pointer"
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  {item.category}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-600 transition-colors" />
              </div>
              <p className="text-xs font-semibold text-gray-800 leading-snug group-hover:text-blue-900 transition-colors">
                "{item.query}"
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-8 text-[11px] text-gray-400">
        Tra cứu theo phác đồ Bộ Y tế & Hướng dẫn hiệp hội chuyên khoa
      </div>
    </div>
  );
};
