import React from 'react';
import type { Citation } from '../../types/chat';
import { getEvidenceNumber } from '../../utils/citations';
import { ChevronRight } from 'lucide-react';

interface SourceCardProps {
  citation: Citation;
  onClick: (citation: Citation) => void;
}

export const SourceCard: React.FC<SourceCardProps> = ({ citation, onClick }) => {
  const evidenceNum = getEvidenceNumber(citation.evidence_id);
  const docTitle = citation.document_title || `Tài liệu nguồn [${evidenceNum}]`;

  // Build metadata subtitle: Tổ chức · Năm · Nhóm nguồn · Trang
  const metadataParts: string[] = [];
  if (citation.organization) metadataParts.push(citation.organization);
  if (citation.publication_year) metadataParts.push(String(citation.publication_year));
  if (citation.source_group || citation.source_category_name || citation.source_category) {
    metadataParts.push(
      citation.source_group || citation.source_category_name || (citation.source_category as string)
    );
  }
  if (citation.page_number) metadataParts.push(`Trang ${citation.page_number}`);

  const snippet = citation.quote || citation.quote_preview || citation.source_text || citation.evidence_text;

  return (
    <div
      id={`source-card-${citation.evidence_id}`}
      onClick={() => onClick(citation)}
      className="group relative flex flex-col p-3.5 rounded-xl border border-gray-200 bg-white shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all duration-150 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-blue-500/30"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(citation);
        }
      }}
      aria-label={`Chi tiết nguồn [${evidenceNum}]: ${docTitle}`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="text-[14px] font-bold text-blue-700 leading-snug group-hover:text-blue-800 line-clamp-2">
          <span className="text-blue-900 font-extrabold mr-1">[{evidenceNum}]</span>
          {docTitle}
        </div>
        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 shrink-0 mt-0.5 transition-colors" />
      </div>

      {metadataParts.length > 0 && (
        <div className="text-xs text-gray-500 font-medium mb-1.5 line-clamp-1">
          {metadataParts.join(' · ')}
        </div>
      )}

      {snippet && (
        <div className="text-xs text-gray-600 line-clamp-2 leading-relaxed bg-gray-50/70 p-2 rounded-lg border border-gray-100/80 italic mt-auto">
          "{snippet}"
        </div>
      )}
    </div>
  );
};

