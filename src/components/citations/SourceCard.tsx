import React from 'react';
import type { Citation } from '../../types/chat';
import { getEvidenceNumber } from '../../utils/citations';
import { FileText, ChevronRight } from 'lucide-react';

interface SourceCardProps {
  citation: Citation;
  onClick: (citation: Citation) => void;
}

export const SourceCard: React.FC<SourceCardProps> = ({ citation, onClick }) => {
  const evidenceNum = getEvidenceNumber(citation.evidence_id);

  return (
    <div
      id={`source-card-${citation.evidence_id}`}
      onClick={() => onClick(citation)}
      className="group relative flex flex-col p-3 rounded-lg border border-gray-200 bg-white shadow-xs hover:border-blue-300 transition-all duration-150 cursor-pointer text-left"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(citation);
        }
      }}
      aria-label={`Chi tiết nguồn [${evidenceNum}]: ${citation.document_title}`}
    >
      <div className="flex items-start justify-between gap-1 mb-1">
        <div className="text-xs font-bold text-blue-600 leading-snug truncate group-hover:text-blue-700">
          [{evidenceNum}] {citation.document_title}
        </div>
        {citation.page_number && (
          <span className="text-[10px] text-gray-400 shrink-0 font-medium">
            Trang {citation.page_number}
          </span>
        )}
      </div>

      <div className="text-[11px] text-gray-500 truncate leading-relaxed">
        {citation.quote || citation.source_text || citation.breadcrumb || citation.document_title}
      </div>
    </div>
  );
};
