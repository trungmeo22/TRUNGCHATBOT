import React, { useState } from 'react';
import type { Citation } from '../../types/chat';
import { SourceCard } from './SourceCard';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

interface SourcesListProps {
  citations: Citation[];
  onSelectCitation: (citation: Citation) => void;
}

export const SourcesList: React.FC<SourcesListProps> = ({
  citations,
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
          <BookOpen className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Nguồn · {citations.length}
          </span>
        </div>

        {showToggle && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 font-medium py-1 px-1.5 rounded transition-colors"
          >
            {isExpanded ? (
              <>
                <span>Thu gọn</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Xem tất cả ({citations.length})</span>
                <ChevronDown className="w-3.5 h-3.5" />
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
            onClick={onSelectCitation}
          />
        ))}
      </div>
    </div>
  );
};
