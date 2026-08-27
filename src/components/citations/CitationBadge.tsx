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
    // If not found in citations list, render as normal unclickable badge
    return (
      <span className="inline-flex items-center justify-center min-w-[1rem] h-4 px-1 text-[10px] bg-gray-100 text-gray-400 font-bold rounded align-super select-none">
        {evidenceNum}
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
        className="inline-flex items-center justify-center min-w-[1.15rem] h-4 px-1 rounded text-[10px] font-bold tracking-tight transition-colors duration-150 cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        aria-label={`Trích dẫn nguồn [${evidenceNum}]: ${citation.document_title}${citation.page_number ? `, trang ${citation.page_number}` : ''}`}
      >
        {evidenceNum}
      </button>

      {/* Tooltip on hover */}
      {isHovered && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-gray-900 text-white rounded-lg shadow-xl text-xs z-30 pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center gap-1.5 text-blue-300 font-semibold mb-1">
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>Nguồn [{evidenceNum}]</span>
          </div>

          <div className="font-medium text-gray-200 line-clamp-2 leading-snug">
            {citation.document_title}
          </div>

          <div className="mt-1.5 flex items-center justify-between text-[11px] text-gray-400 border-t border-gray-800 pt-1">
            {citation.page_number && (
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3 text-gray-400" />
                Trang {citation.page_number}
              </span>
            )}
            <span className="text-[10px] text-blue-400">Click để xem</span>
          </div>

          {citation.breadcrumb && (
            <div className="mt-1 text-[10px] text-gray-400 line-clamp-1 italic">
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
