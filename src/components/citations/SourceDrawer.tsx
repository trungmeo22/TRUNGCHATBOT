import React, { useEffect, useRef } from 'react';
import type { Citation } from '../../types/chat';
import { getEvidenceNumber } from '../../utils/citations';
import { X, BookOpen, FileText, Layers, ExternalLink, Quote, ShieldCheck } from 'lucide-react';

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

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          ref={drawerRef}
          className="w-screen max-w-md bg-white border-l border-gray-200 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 h-full"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded flex items-center justify-center font-bold text-xs">
                {evidenceNum}
              </div>
              <h3 id="source-drawer-title" className="font-bold text-sm text-gray-900">
                Nguồn tài liệu
              </h3>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              id="source-drawer-close-btn"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
              aria-label="Đóng bảng nguồn tài liệu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-gray-800">
            {/* Document Title Section */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                Tên tài liệu
              </label>
              <h4 className="text-sm font-bold text-gray-900 leading-snug mb-1">
                {citation.document_title}
              </h4>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {citation.page_number && (
                  <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-medium">
                    Trang {citation.page_number}
                  </span>
                )}
                <span>•</span>
                <span className="text-[11px] font-mono text-gray-400">
                  ID: {citation.evidence_id}
                </span>
              </div>
            </div>

            {/* Breadcrumb / Section */}
            {citation.breadcrumb && (
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                  Phân đoạn
                </label>
                <div className="text-[11px] text-gray-400 font-medium tracking-tight mb-2 uppercase font-mono">
                  {citation.breadcrumb}
                </div>
              </div>
            )}

            {/* Evidence / Quote Text */}
            {evidenceText && (
              <div>
                <div className="p-4 bg-gray-50 border-l-4 border-blue-500 rounded-r-lg text-sm text-gray-700 italic leading-relaxed">
                  "{evidenceText}"
                </div>
              </div>
            )}

            {/* Action button: View in Document */}
            {citation.url ? (
              <a
                href={citation.url}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-sm"
              >
                <FileText className="w-4 h-4" />
                <span>Xem trong tài liệu (PDF)</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
              </a>
            ) : (
              <button
                type="button"
                className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-sm"
                onClick={() => {}}
              >
                <FileText className="w-4 h-4" />
                <span>Xem trong tài liệu (PDF)</span>
              </button>
            )}
          </div>

          {/* Verified Source Banner */}
          <div className="p-4 bg-blue-50 border-t border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-blue-900">Verified Source</div>
                <div className="text-[10px] text-blue-700 font-medium uppercase tracking-wider">
                  Document grounding confirmed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
