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
  Hash,
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
  const evidenceText = citation.quote || citation.quote_preview || citation.source_text || citation.evidence_text;

  const groupName =
    citation.source_group ||
    citation.source_category_name ||
    (typeof citation.source_category === 'string' ? citation.source_category : undefined);

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

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div
          ref={drawerRef}
          className="w-screen max-w-full sm:max-w-md bg-white border-l border-gray-200 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 h-full"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">
                [{evidenceNum}]
              </div>
              <div>
                <h3 id="source-drawer-title" className="font-bold text-sm text-gray-900 leading-tight">
                  Chi tiết trích dẫn y khoa
                </h3>
                <div className="text-[11px] text-gray-400 font-medium">
                  ID: {citation.evidence_id}
                </div>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              id="source-drawer-close-btn"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg transition-colors cursor-pointer"
              aria-label="Đóng bảng nguồn tài liệu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content - Pure Provenance Metadata without Fake Placeholders */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-gray-800">
            {/* 1. Tên tài liệu */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Tên tài liệu
              </label>
              <h4 className="text-[15.5px] font-bold text-gray-950 leading-snug">
                {citation.document_title || 'Tài liệu nguồn tra cứu'}
              </h4>
            </div>

            {/* Grid 2-5: Metadata Fields */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {/* 2. Tổ chức ban hành */}
              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  <span>Tổ chức</span>
                </div>
                <div className="text-sm font-semibold text-gray-900 mt-1 truncate" title={citation.organization}>
                  {citation.organization || <span className="text-gray-400 font-normal">Không có dữ liệu</span>}
                </div>
              </div>

              {/* 3. Năm ban hành */}
              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>Năm</span>
                </div>
                <div className="text-sm font-semibold text-gray-900 mt-1">
                  {citation.publication_year || <span className="text-gray-400 font-normal">Không có dữ liệu</span>}
                </div>
              </div>

              {/* 4. Loại tài liệu */}
              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase">
                  <Tag className="w-3.5 h-3.5 text-gray-400" />
                  <span>Loại tài liệu</span>
                </div>
                <div className="text-sm font-semibold text-gray-900 mt-1 truncate" title={citation.document_type}>
                  {citation.document_type || <span className="text-gray-400 font-normal">Không có dữ liệu</span>}
                </div>
              </div>

              {/* 5. Nhóm nguồn / Category */}
              <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase">
                  <Layers className="w-3.5 h-3.5 text-gray-400" />
                  <span>Nhóm nguồn</span>
                </div>
                <div className="text-sm font-semibold text-gray-900 mt-1 truncate" title={groupName}>
                  {groupName || <span className="text-gray-400 font-normal">Không có dữ liệu</span>}
                </div>
              </div>
            </div>

            {/* 6. Phân đoạn / Breadcrumb */}
            {(citation.breadcrumb || citation.section_id) && (
              <div className="space-y-1 pt-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                  Phân đoạn / Chương mục
                </label>
                <div className="text-sm text-gray-800 font-medium bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  {citation.breadcrumb || citation.section_id}
                </div>
              </div>
            )}

            {/* 7 & 8. Trang & Semantic / Source Unit ID */}
            <div className="flex items-center justify-between text-sm text-gray-600 pt-2 pb-2 px-1 border-y border-gray-100">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-gray-400" />
                <span>
                  Trang:{' '}
                  {citation.page_number ? (
                    <strong className="text-gray-950 font-bold">{citation.page_number}</strong>
                  ) : (
                    <span className="text-gray-400">Không có dữ liệu</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-1 font-mono text-xs text-gray-500">
                <FileCode className="w-3.5 h-3.5 text-gray-400" />
                <span>Unit: {citation.source_unit_id || citation.document_id || citation.evidence_id}</span>
              </div>
            </div>

            {/* Unit type & rank if present */}
            {(citation.source_unit_type || citation.matched_unit_type || citation.retrieval_rank !== undefined) && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {citation.source_unit_type && (
                  <span className="bg-gray-100 px-2 py-0.5 rounded-md">
                    Kiểu unit: {citation.source_unit_type}
                  </span>
                )}
                {citation.retrieval_rank !== undefined && (
                  <span className="bg-gray-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Hash className="w-3 h-3 text-gray-400" />
                    Rank #{citation.retrieval_rank}
                  </span>
                )}
              </div>
            )}

            {/* 9. Đoạn tài liệu được sử dụng */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Đoạn trích dẫn đối chiếu
              </label>
              {evidenceText ? (
                <div className="p-4 bg-blue-50/60 border-l-4 border-blue-600 rounded-r-xl text-sm sm:text-[15px] text-gray-850 leading-relaxed italic">
                  "{evidenceText}"
                </div>
              ) : (
                <div className="p-3.5 bg-gray-50 rounded-xl text-sm text-gray-400 italic border border-gray-100">
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
                  className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
                >
                  <FileText className="w-4 h-4" />
                  <span>Xem tài liệu gốc (PDF)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>
            )}
          </div>

          {/* Footer Verified Source Banner */}
          <div className="p-4 bg-blue-50 border-t border-blue-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white border border-blue-100 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
                <ShieldCheck className="w-4.5 h-4.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-blue-950 leading-tight">
                  Medical Knowledge Provenance
                </div>
                <div className="text-xs text-blue-750 leading-tight mt-0.5">
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

