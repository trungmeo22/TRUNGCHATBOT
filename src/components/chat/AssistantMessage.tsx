import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage, Citation } from '../../types/chat';
import { tokenizeCitations, formatAnswerForCopy } from '../../utils/citations';
import { CitationBadge } from '../citations/CitationBadge';
import { SourcesList } from '../citations/SourcesList';
import { InsufficientEvidenceView } from './InsufficientEvidenceView';
import { ErrorMessage } from './ErrorMessage';
import { ShieldCheck, Copy, Check, BookOpen } from 'lucide-react';

interface AssistantMessageProps {
  message: ChatMessage;
  onSelectCitation: (citation: Citation) => void;
  onCopyText?: (text: string) => void;
  onRetry?: () => void;
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({
  message,
  onSelectCitation,
  onCopyText,
  onRetry,
}) => {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = useCallback(() => {
    const formatted = formatAnswerForCopy(message.content);
    navigator.clipboard.writeText(formatted);
    setHasCopied(true);
    if (onCopyText) {
      onCopyText(formatted);
    }
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  }, [message.content, onCopyText]);

  // If this message represents an error
  if (message.status === 'error') {
    return <ErrorMessage message={message.errorDetails?.message} onRetry={onRetry} />;
  }

  // If this message represents insufficient evidence
  if (
    message.status === 'insufficient_evidence' ||
    message.content === 'INSUFFICIENT_EVIDENCE'
  ) {
    return <InsufficientEvidenceView />;
  }

  const citations = message.citations || [];

  // Recursive citation replacer for Markdown elements
  const renderWithCitations = (node: React.ReactNode): React.ReactNode => {
    if (typeof node === 'string') {
      const tokens = tokenizeCitations(node, citations);
      return tokens.map((token, i) => {
        if (token.type === 'citation' && token.evidenceId) {
          return (
            <CitationBadge
              key={`${token.evidenceId}-${i}`}
              evidenceId={token.evidenceId}
              citation={token.citation}
              onClick={onSelectCitation}
            />
          );
        }
        return token.value;
      });
    }

    if (Array.isArray(node)) {
      return React.Children.map(node, (child) => renderWithCitations(child));
    }

    if (React.isValidElement(node)) {
      const elementChildren = (node.props as { children?: React.ReactNode }).children;
      if (elementChildren) {
        return React.cloneElement(
          node,
          undefined,
          renderWithCitations(elementChildren)
        );
      }
    }

    return node;
  };

  return (
    <div
      id={`assistant-message-${message.id}`}
      className="flex items-start gap-4 max-w-[720px] mx-auto py-4 px-3 sm:px-4 rounded-xl transition-colors group"
    >
      {/* Blue circular medical emblem */}
      <div className="w-8 h-8 rounded-full bg-blue-600 shrink-0 flex items-center justify-center text-white shadow-2xs mt-0.5">
        <ShieldCheck className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        {/* Formatted Markdown Content */}
        <div className="text-[14.5px] leading-relaxed text-gray-800 space-y-3.5 font-normal">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => (
                <p className="mb-3 leading-relaxed text-gray-800 last:mb-0">
                  {renderWithCitations(children)}
                </p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-gray-900">
                  {renderWithCitations(children)}
                </strong>
              ),
              em: ({ children }) => (
                <em className="italic text-gray-800">
                  {renderWithCitations(children)}
                </em>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-outside ml-4 space-y-1.5 my-2 text-gray-800">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-outside ml-4 space-y-1.5 my-2 text-gray-800">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed">
                  {renderWithCitations(children)}
                </li>
              ),
              h1: ({ children }) => (
                <h1 className="text-base font-bold text-gray-900 mt-3 mb-1.5">
                  {renderWithCitations(children)}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-sm font-bold text-gray-900 mt-2.5 mb-1">
                  {renderWithCitations(children)}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xs font-bold text-gray-900 mt-2 mb-1 uppercase tracking-wider">
                  {renderWithCitations(children)}
                </h3>
              ),
              code: ({ children }) => (
                <code className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-xs text-gray-800 border border-gray-200">
                  {children}
                </code>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-3 border border-gray-200 rounded-lg shadow-2xs">
                  <table className="min-w-full divide-y divide-gray-200 text-xs">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-gray-50 text-gray-800">{children}</thead>
              ),
              th: ({ children }) => (
                <th className="px-3 py-2 text-left font-semibold text-gray-700">
                  {renderWithCitations(children)}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-3 py-2 text-gray-700 border-t border-gray-100">
                  {renderWithCitations(children)}
                </td>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Source Cards Section */}
        {citations.length > 0 && (
          <SourcesList
            citations={citations}
            onSelectCitation={onSelectCitation}
          />
        )}

        {/* Bottom Actions Bar (Clean Minimalism) */}
        <div className="flex items-center gap-4 mt-5 opacity-60 hover:opacity-100 transition-opacity">
          <button
            type="button"
            id={`copy-answer-btn-${message.id}`}
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer py-1"
            title="Sao chép nội dung"
            aria-label="Sao chép câu trả lời"
          >
            {hasCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-medium">Đã sao chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
