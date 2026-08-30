import React from 'react';
import type { Citation } from '../../types/chat';
import { getEvidenceNumber } from '../../utils/citations';
import { Building2, Calendar, FileText, Layers } from 'lucide-react';

interface SourceCardProps {
  citation: Citation;
  onClick: (citation: Citation) => void;
}

export const SourceCard: React.FC<SourceCardProps> = ({ citation, onClick }) => {
  const evidenceNum = getEvidenceNumber(citation.evidence_id);
  const sourceGroup =
    citation.source_group ||
    citation.source_category_name ||
    citation.source_category;
  const preview =
    citation.quote ||
    citation.quote_preview ||
    citation.source_text ||
    citation.evidence_text ||
    citation.breadcrumb;

  return (
    <div
      id={`source-card-${citation.evidence_id}`}
      onClick={() => onClick(citation)}
      className="group relative flex flex-col p-3 rounded-lg border border-gray-200 bg-white shadow-xs hover:border-blue-300 hover:bg-blue-50/20 transition-all duration-150 cursor-pointer text-left"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(citation);
        }
      }}
      aria-label={`Chi tiết nguồn [${evidenceNum}]: ${citation.document_title || citation.document_id || 'Nguồn y khoa'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-blue-700 leading-snug line-clamp-2 group-hover:text-blue-800">
            [{evidenceNum}] {citation.document_title || citation.document_id || 'Nguồn y khoa'}
          </div>
        </div>

        {citation.page_number && (
          <span className="text-[10px] text-gray-500 shrink-0 font-semibold bg-gray-50 border border-gray-100 rounded px-1.5 py-0.5">
            Trang {citation.page_number}
          </span>
        )}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-500">
        {citation.organization && (
          <span className="inline-flex items-center gap-1 min-w-0">
            <Building2 className="w-3 h-3 shrink-0 text-gray-400" />
            <span className="truncate max-w-[170px]">{citation.organization}</span>
          </span>
        )}

        {citation.publication_year && (
          <span className="inline-flex items-center gap-1">
            <Calendar className="w-3 h-3 shrink-0 text-gray-400" />
            {citation.publication_year}
          </span>
        )}

        {sourceGroup && (
          <span className="inline-flex items-center gap-1 min-w-0">
            <Layers className="w-3 h-3 shrink-0 text-gray-400" />
            <span className="truncate max-w-[150px]">{sourceGroup}</span>
          </span>
        )}
      </div>

      {preview && (
        <div className="mt-2 pt-2 border-t border-gray-100 text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
          <FileText className="w-3 h-3 inline-block mr-1 -mt-0.5 text-gray-400" />
          {preview}
        </div>
      )}
    </div>
  );
};
