import React, { useEffect, useRef } from 'react';
import type { Citation } from '../../types/chat';
import { getEvidenceNumber } from '../../utils/citations';
import {
  X,
  Building2,
  Calendar,
  Layers,
  FileCode,
  Tag,
  ShieldCheck,
  FileText,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

interface SourceDrawerProps {
  isOpen: boolean;
  citation: Citation | null;
  onClose: () => void;
}

export const SourceDrawer: React.FC<SourceDrawerProps> = ({
  isOpen,
  citation,
  onClose,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap / auto-focus close button when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen || !citation) return null;

  const evidenceNum = getEvidenceNumber(citation.evidence_id);
  const evidenceText = citation.quote || citation.source_text || citation.evidence_text;

  return (
    <div
      id="source-drawer-container"
      className="fixed inset-0 z-50 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="source-drawer-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div
          ref={drawerRef}
          className="w-screen max-w-md bg-white border-l border-gray-200 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 h-full"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded flex items-center justify-center font-bold text-xs">
                [{evidenceNum}]
              </div>
              <h3 id="source-drawer-title" className="font-bold text-sm text-gray-900">
                Chi tiết trích dẫn y khoa
              </h3>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              id="source-drawer-close-btn"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg transition-colors cursor-pointer"
              aria-label="Đóng bảng nguồn tài liệu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content - Ordered by V2-G Specification */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-gray-800">
            {/* 1. Tên tài liệu */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Tên tài liệu
              </label>
              <h4 className="text-sm font-bold text-gray-900 leading-snug">
                {citation.document_title || 'Tài liệu hướng dẫn y khoa'}
              </h4>
            </div>

            {/* Grid 2-5: Metadata Fields */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* 2. Tổ chức ban hành */}
              <div className="bg-gray-50/80 p-2.5 rounded-lg border border-gray-100">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase">
                  <Building2 className="w-3 h-3 text-gray-400" />
                  <span>Tổ chức</span>
                </div>
                <div className="text-xs font-semibold text-gray-800 mt-1 truncate">
                  {citation.organization || 'Bộ Y tế / Hiệp hội'}
                </div>
              </div>

              {/* 3. Năm ban hành */}
              <div className="bg-gray-50/80 p-2.5 rounded-lg border border-gray-100">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span>Năm</span>
                </div>
                <div className="text-xs font-semibold text-gray-800 mt-1">
                  {citation.publication_year || '—'}
                </div>
              </div>

              {/* 4. Loại tài liệu */}
              <div className="bg-gray-50/80 p-2.5 rounded-lg border border-gray-100">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase">
                  <Tag className="w-3 h-3 text-gray-400" />
                  <span>Loại</span>
                </div>
                <div className="text-xs font-semibold text-gray-800 mt-1 truncate">
                  {citation.document_type || 'Hướng dẫn / Khuyến cáo'}
                </div>
              </div>

              {/* 5. Nhóm nguồn / Category */}
              <div className="bg-gray-50/80 p-2.5 rounded-lg border border-gray-100">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 uppercase">
                  <Layers className="w-3 h-3 text-gray-400" />
                  <span>Nhóm nguồn</span>
                </div>
                <div className="text-xs font-semibold text-gray-800 mt-1 truncate">
                  {citation.source_group || citation.source_category_name || citation.source_category || 'Database thẩm định'}
                </div>
              </div>
            </div>

            {/* 6. Phân đoạn / Breadcrumb */}
            {(citation.breadcrumb || citation.section_id) && (
              <div className="space-y-1 pt-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Phân đoạn / Chương mục
                </label>
                <div className="text-xs text-gray-700 font-medium bg-gray-50 p-2 rounded-lg border border-gray-100">
                  {citation.breadcrumb || citation.section_id}
                </div>
              </div>
            )}

            {/* 7 & 8. Trang & Semantic / Source Unit ID */}
            <div className="flex items-center justify-between text-xs text-gray-500 pt-1 pb-1 px-1 border-y border-gray-100">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  Trang: <strong className="text-gray-900">{citation.page_number || '—'}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1 font-mono text-[11px] text-gray-400">
                <FileCode className="w-3 h-3 text-gray-400" />
                <span>Unit: {citation.source_unit_id || citation.document_id || citation.evidence_id}</span>
              </div>
            </div>

            {/* 9. Đoạn tài liệu được sử dụng */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Đoạn trích dẫn đối chiếu
              </label>
              {evidenceText ? (
                <div className="p-3.5 bg-blue-50/50 border-l-3 border-blue-500 rounded-r-lg text-xs sm:text-sm text-gray-800 leading-relaxed italic">
                  "{evidenceText}"
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-500 italic border border-gray-100">
                  Backend chưa cung cấp đoạn trích chi tiết cho citation này.
                </div>
              )}
            </div>

            {/* Optional URL view in PDF */}
            {citation.url && (
              <div className="pt-2">
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Xem tài liệu gốc (PDF)</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              </div>
            )}
          </div>

          {/* Footer Verified Source Banner */}
          <div className="p-3.5 bg-blue-50 border-t border-blue-100 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-blue-900 leading-tight">
                  Medical Knowledge Provenance
                </div>
                <div className="text-[10px] text-blue-700 leading-tight">
                  Trích xuất và đối chiếu trực tiếp từ cơ sở dữ liệu y khoa
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
