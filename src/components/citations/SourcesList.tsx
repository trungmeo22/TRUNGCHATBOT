import React, { useState } from 'react';
import type { Citation } from '../../types/chat';
import { SourceCard } from './SourceCard';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface SourcesListProps {
  citations: Citation[];
  activeEvidenceId?: string;
  onSelectCitation: (citation: Citation) => void;
}

export const SourcesList: React.FC<SourcesListProps> = ({
  citations,
  activeEvidenceId,
  onSelectCitation,
}) => {
  if (!citations || citations.length === 0) return null;

  const [isExpanded, setIsExpanded] = useState(citations.length <= 4);
  const showToggle = citations.length > 4;
  const displayedCitations = isExpanded ? citations : citations.slice(0, 4);

  return (
    <div className="mt-6 pt-4 border-t border-gray-100" id="assistant-sources-section">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Nguồn · {citations.length}
          </span>
        </div>

        {showToggle && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium py-1 px-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            {isExpanded ? (
              <>
                <span>Thu gọn</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Xem tất cả ({citations.length})</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {displayedCitations.map((citation) => (
          <SourceCard
            key={citation.evidence_id}
            citation={citation}
            isActive={
              Boolean(activeEvidenceId) &&
              citation.evidence_id.toUpperCase() === activeEvidenceId?.toUpperCase()
            }
            onClick={onSelectCitation}
          />
        ))}
      </div>
    </div>
  );
};
