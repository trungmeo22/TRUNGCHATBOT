import React, { useState } from 'react';
import type { Citation } from '../../types/chat';
import { getEvidenceNumber } from '../../utils/citations';
import { BookOpen, FileText } from 'lucide-react';

interface CitationBadgeProps {
  evidenceId: string;
  citation?: Citation;
  onClick: (citation: Citation) => void;
}

export const CitationBadge: React.FC<CitationBadgeProps> = ({
  evidenceId,
  citation,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const evidenceNum = getEvidenceNumber(evidenceId);

  if (!citation) {
    // If not found in citations list, render as unclickable safe badge
    return (
      <span
        className="inline-flex items-center justify-center min-w-[1.2rem] h-4.5 px-1 text-[11px] bg-gray-100 text-gray-400 font-bold rounded align-super select-none mx-0.5"
        title={`Nguồn [${evidenceNum}] không có chi tiết đối chiếu`}
      >
        [{evidenceNum}]
      </span>
    );
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(citation);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(citation);
    }
  };

  const docTitle = citation.document_title || 'Tài liệu y khoa đối chiếu';

  return (
    <span
      className="relative inline-block align-super -top-0.5 mx-0.5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        id={`citation-badge-${evidenceId}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className="inline-flex items-center justify-center min-w-[1.4rem] h-5 px-1.5 rounded-md text-[11.5px] font-bold tracking-tight transition-colors duration-150 cursor-pointer bg-blue-100/90 hover:bg-blue-200 text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        aria-label={`Trích dẫn nguồn [${evidenceNum}]: ${docTitle}${citation.page_number ? `, trang ${citation.page_number}` : ''}`}
      >
        [{evidenceNum}]
      </button>

      {/* Tooltip on hover */}
      {isHovered && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 bg-gray-900 text-white rounded-xl shadow-xl text-xs z-30 pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center gap-1.5 text-blue-300 font-semibold mb-1 text-xs">
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>Nguồn [{evidenceNum}]</span>
          </div>

          <div className="font-medium text-gray-100 line-clamp-2 leading-snug text-xs sm:text-sm">
            {docTitle}
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-gray-400 border-t border-gray-800 pt-1.5">
            {citation.page_number ? (
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-gray-400" />
                Trang {citation.page_number}
              </span>
            ) : (
              <span className="text-gray-500 italic">Chi tiết nguồn</span>
            )}
            <span className="text-xs text-blue-400 font-medium">Click xem chi tiết</span>
          </div>

          {citation.breadcrumb && (
            <div className="mt-1 text-[11px] text-gray-400 line-clamp-1 italic">
              {citation.breadcrumb}
            </div>
          )}

          {/* Small Arrow indicator */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </span>
  );
};

