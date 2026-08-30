import React, { useState, useEffect, useCallback } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Columns2,
  PanelRight,
  Maximize2,
  Minimize2,
  ListFilter,
  BookmarkCheck,
} from 'lucide-react';

export type SplitViewDisplayMode = 'split' | 'drawer' | 'full';

interface SplitDocumentViewerProps {
  citation: Citation | null;
  allCitations?: Citation[];
  isOpen: boolean;
  viewMode?: SplitViewDisplayMode;
  onViewModeChange?: (mode: SplitViewDisplayMode) => void;
  onSelectCitation: (citation: Citation) => void;
  onClose: () => void;
  splitWidthPercent?: number;
  onSplitWidthChange?: (width: number) => void;
}

export const SplitDocumentViewer: React.FC<SplitDocumentViewerProps> = ({
  citation,
  allCitations = [],
  isOpen,
  viewMode = 'split',
  onViewModeChange,
  onSelectCitation,
  onClose,
  splitWidthPercent = 50,
  onSplitWidthChange,
}) => {
  const [activeTab, setActiveTab] = useState<'evidence' | 'metadata' | 'all'>('evidence');
  const [hasCopiedQuote, setHasCopiedQuote] = useState(false);

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

  // Find index of current citation in allCitations list
  const currentIndex = citation
    ? allCitations.findIndex(
        (c) => c.evidence_id.toUpperCase() === citation.evidence_id.toUpperCase()
      )
    : -1;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allCitations.length - 1;

  const handlePrev = useCallback(() => {
    if (hasPrev && allCitations[currentIndex - 1]) {
      onSelectCitation(allCitations[currentIndex - 1]);
    }
  }, [hasPrev, currentIndex, allCitations, onSelectCitation]);

  const handleNext = useCallback(() => {
    if (hasNext && allCitations[currentIndex + 1]) {
      onSelectCitation(allCitations[currentIndex + 1]);
    }
  }, [hasNext, currentIndex, allCitations, onSelectCitation]);

  if (!isOpen || !citation) return null;

  const evidenceNum = getEvidenceNumber(citation.evidence_id);
  const evidenceText =
    citation.quote ||
    citation.quote_preview ||
    citation.source_text ||
    citation.evidence_text;

  const groupName =
    citation.source_group ||
    citation.source_category_name ||
    (typeof citation.source_category === 'string' ? citation.source_category : undefined);

  const docTitle = citation.document_title || 'Tài liệu nguồn y khoa';

  const handleCopyQuote = () => {
    if (!evidenceText) return;
    const textToCopy = `"${evidenceText}"\n— [${evidenceNum}] ${docTitle}${
      citation.page_number ? `, trang ${citation.page_number}` : ''
    }`;
    navigator.clipboard.writeText(textToCopy);
    setHasCopiedQuote(true);
    setTimeout(() => setHasCopiedQuote(false), 2000);
  };

  return (
    <div
      id="split-document-viewer"
      className="flex flex-col h-full bg-white border-l border-gray-200 shadow-sm select-text overflow-hidden transition-all duration-150"
    >
      {/* Top Header Bar */}
      <div className="px-4 py-3 border-b border-gray-100 bg-[#FAFBFD] flex items-center justify-between gap-2 shrink-0">
        {/* Left Badge & Document Info */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
            [{evidenceNum}]
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                Tài liệu gốc đối chiếu
              </span>
              {allCitations.length > 1 && currentIndex >= 0 && (
                <span className="text-[10.5px] text-gray-400 bg-gray-100 px-1.5 py-0.2 rounded font-mono">
                  {currentIndex + 1}/{allCitations.length}
                </span>
              )}
            </div>
            <h3
              className="text-xs sm:text-[13.5px] font-bold text-gray-900 truncate leading-snug"
              title={docTitle}
            >
              {docTitle}
            </h3>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Previous / Next Citation Nav */}
          {allCitations.length > 1 && (
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 shadow-2xs mr-1">
              <button
                type="button"
                onClick={handlePrev}
                disabled={!hasPrev}
                className="p-1 rounded text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                title="Trích dẫn trước [←]"
                aria-label="Trích dẫn trước"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!hasNext}
                className="p-1 rounded text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
                title="Trích dẫn tiếp theo [→]"
                aria-label="Trích dẫn tiếp theo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Width Preset Selector (Split view only) */}
          {viewMode === 'split' && onSplitWidthChange && (
            <div className="hidden lg:flex items-center bg-white border border-gray-200 rounded-lg p-0.5 shadow-2xs mr-1 text-[11px] font-medium text-gray-600">
              <button
                type="button"
                onClick={() => onSplitWidthChange(40)}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  splitWidthPercent === 40
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Độ rộng 40%"
              >
                40%
              </button>
              <button
                type="button"
                onClick={() => onSplitWidthChange(50)}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  splitWidthPercent === 50
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Độ rộng 50% (cân bằng)"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => onSplitWidthChange(60)}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  splitWidthPercent === 60
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Độ rộng 60%"
              >
                60%
              </button>
            </div>
          )}

          {/* View Mode Toggle: Split / Full / Drawer */}
          {onViewModeChange && (
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 shadow-2xs mr-1">
              <button
                type="button"
                onClick={() => onViewModeChange('split')}
                className={`p-1 rounded transition-colors ${
                  viewMode === 'split'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`}
                title="Chế độ xem song song (Split-View)"
                aria-label="Xem song song"
              >
                <Columns2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange(viewMode === 'full' ? 'split' : 'full')}
                className={`p-1 rounded transition-colors ${
                  viewMode === 'full'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
                }`}
                title={viewMode === 'full' ? 'Thu nhỏ lại split-view' : 'Toàn màn hình'}
                aria-label="Phóng to tài liệu"
              >
                {viewMode === 'full' ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}

          {/* Close button */}
          <button
            type="button"
            id="split-document-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            title="Đóng bảng tài liệu (Esc)"
            aria-label="Đóng bảng tài liệu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center border-b border-gray-100 px-4 bg-white shrink-0 text-xs font-semibold gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('evidence')}
          className={`py-2.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'evidence'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <BookmarkCheck className="w-3.5 h-3.5" />
          <span>Đoạn trích đối chiếu</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('metadata')}
          className={`py-2.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'metadata'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Thông tin tài liệu gốc</span>
        </button>

        {allCitations.length > 1 && (
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`py-2.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'all'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Tất cả nguồn ({allCitations.length})</span>
          </button>
        )}
      </div>

      {/* Main Body Content with scroll */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-gray-800">
        {activeTab === 'evidence' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Header Document & Breadcrumb badge */}
            <div className="p-3.5 bg-gray-50/90 rounded-xl border border-gray-100 space-y-2">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Vị trí trong tài liệu gốc
              </div>
              <h4 className="text-sm sm:text-base font-bold text-gray-950 leading-snug">
                {docTitle}
              </h4>

              {/* Breadcrumb if available */}
              {(citation.breadcrumb || citation.section_id) && (
                <div className="text-xs text-blue-800 bg-blue-50/70 px-2.5 py-1.5 rounded-lg font-medium border border-blue-100/60 leading-relaxed">
                  <span className="font-semibold text-blue-900 mr-1">Chương mục:</span>
                  {citation.breadcrumb || citation.section_id}
                </div>
              )}

              {/* Metadata tags row */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                {citation.page_number && (
                  <span className="inline-flex items-center gap-1 bg-white border border-gray-200 px-2 py-0.5 rounded-md font-medium text-gray-700 shadow-2xs">
                    <BookOpen className="w-3.5 h-3.5 text-gray-500" />
                    Trang {citation.page_number}
                  </span>
                )}
                {citation.organization && (
                  <span className="inline-flex items-center gap-1 bg-white border border-gray-200 px-2 py-0.5 rounded-md text-gray-700 shadow-2xs">
                    <Building2 className="w-3.5 h-3.5 text-gray-500" />
                    {citation.organization}
                  </span>
                )}
                {citation.publication_year && (
                  <span className="inline-flex items-center gap-1 bg-white border border-gray-200 px-2 py-0.5 rounded-md text-gray-700 shadow-2xs">
                    <Calendar className="w-3.5 h-3.5 text-gray-500" />
                    Năm {citation.publication_year}
                  </span>
                )}
                {citation.source_unit_type && (
                  <span className="inline-flex items-center gap-1 bg-white border border-gray-200 px-2 py-0.5 rounded-md text-gray-600 shadow-2xs font-mono text-[11px]">
                    <Tag className="w-3 h-3 text-gray-400" />
                    {citation.source_unit_type}
                  </span>
                )}
              </div>
            </div>

            {/* Primary Evidence Excerpt Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                  <BookmarkCheck className="w-4 h-4 text-blue-600" />
                  <span>Đoạn trích dẫn nguyên văn từ tài liệu</span>
                </label>

                {evidenceText && (
                  <button
                    type="button"
                    onClick={handleCopyQuote}
                    className="text-xs text-gray-500 hover:text-blue-700 inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                    title="Sao chép đoạn trích kèm thông tin nguồn"
                  >
                    {hasCopiedQuote ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-medium">Đã sao chép</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao chép trích dẫn</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {evidenceText ? (
                <div className="relative p-4 sm:p-5 bg-blue-50/60 border-l-4 border-blue-600 rounded-r-2xl text-[15px] sm:text-[16px] text-gray-900 leading-[1.8] font-normal shadow-2xs">
                  <div className="text-2xl text-blue-300 font-serif leading-none absolute top-2 left-2 select-none">
                    “
                  </div>
                  <div className="relative pl-2 italic">
                    {evidenceText}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-400 italic border border-gray-100">
                  Backend chưa trả về nội dung trích dẫn chi tiết cho nguồn này.
                </div>
              )}
            </div>

            {/* Verification Note */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Bằng chứng y khoa xác thực:</strong> Nội dung phản hồi của AI được đối chiếu và bám sát trực tiếp vào phân đoạn tài liệu trên.
              </div>
            </div>

            {/* PDF / URL Button if provided */}
            {citation.url && (
              <div className="pt-2">
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-2xs"
                >
                  <FileText className="w-4 h-4" />
                  <span>Mở tài liệu gốc (File PDF)</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
              </div>
            )}
          </div>
        )}

        {activeTab === 'metadata' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                Tên tài liệu
              </label>
              <h4 className="text-base font-bold text-gray-950 leading-snug">
                {docTitle}
              </h4>
            </div>

            {/* Grid of Key Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Organization */}
              <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  <span>Cơ quan / Tổ chức</span>
                </div>
                <div className="text-sm font-semibold text-gray-900 mt-1" title={citation.organization}>
                  {citation.organization || <span className="text-gray-400 font-normal">Không có dữ liệu</span>}
                </div>
              </div>

              {/* Publication Year */}
              <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>Năm ban hành</span>
                </div>
                <div className="text-sm font-semibold text-gray-900 mt-1">
                  {citation.publication_year || <span className="text-gray-400 font-normal">Không có dữ liệu</span>}
                </div>
              </div>

              {/* Document Type */}
              <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase">
                  <Tag className="w-3.5 h-3.5 text-gray-400" />
                  <span>Loại văn bản</span>
                </div>
                <div className="text-sm font-semibold text-gray-900 mt-1" title={citation.document_type}>
                  {citation.document_type || <span className="text-gray-400 font-normal">Không có dữ liệu</span>}
                </div>
              </div>

              {/* Source Group */}
              <div className="bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 uppercase">
                  <Layers className="w-3.5 h-3.5 text-gray-400" />
                  <span>Nhóm nguồn</span>
                </div>
                <div className="text-sm font-semibold text-gray-900 mt-1" title={groupName}>
                  {groupName || <span className="text-gray-400 font-normal">Không có dữ liệu</span>}
                </div>
              </div>
            </div>

            {/* Identification & Unit info */}
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-gray-600">
                <span>Mã tài liệu (Document ID):</span>
                <span className="font-mono font-medium text-gray-900">
                  {citation.document_id || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between text-gray-600 border-t border-gray-200/60 pt-1.5">
                <span>Mã đơn vị (Unit ID):</span>
                <span className="font-mono font-medium text-gray-900">
                  {citation.source_unit_id || citation.section_id || citation.evidence_id}
                </span>
              </div>
              {citation.retrieval_rank !== undefined && (
                <div className="flex items-center justify-between text-gray-600 border-t border-gray-200/60 pt-1.5">
                  <span>Thứ hạng truy xuất (Rank):</span>
                  <span className="font-mono font-bold text-blue-700">
                    #{citation.retrieval_rank}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'all' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <div className="text-xs font-semibold text-gray-500 mb-2">
              Nhấn vào một nguồn dưới đây để chuyển đổi xem nội dung song song:
            </div>

            {allCitations.map((c) => {
              const num = getEvidenceNumber(c.evidence_id);
              const isSelected = c.evidence_id.toUpperCase() === citation.evidence_id.toUpperCase();
              const snippet = c.quote || c.quote_preview || c.source_text || c.evidence_text;

              return (
                <div
                  key={c.evidence_id}
                  onClick={() => {
                    onSelectCitation(c);
                    setActiveTab('evidence');
                  }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white border-gray-200 hover:border-blue-200 hover:bg-gray-50/50'
                  }`}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="text-sm font-bold text-blue-700 leading-snug">
                      <span className="font-extrabold text-blue-900 mr-1.5">[{num}]</span>
                      {c.document_title || `Tài liệu nguồn [${num}]`}
                    </div>
                    {isSelected && (
                      <span className="text-[11px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                        Đang xem
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 mb-1.5">
                    {[c.organization, c.publication_year, c.page_number ? `Trang ${c.page_number}` : null]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>

                  {snippet && (
                    <div className="text-xs text-gray-600 line-clamp-2 italic bg-gray-50 p-2 rounded-lg border border-gray-100">
                      "{snippet}"
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Medical Quality Banner */}
      <div className="p-3.5 bg-blue-50/80 border-t border-blue-100 flex items-center gap-3 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-white border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-blue-950 leading-tight">
            Medical Evidence Provenance
          </div>
          <div className="text-[11px] text-blue-750 leading-tight">
            Tra cứu và đối chiếu phân đoạn văn bản gốc
          </div>
        </div>
      </div>
    </div>
  );
};
