import React from 'react';
import type { ChatMessage, Citation, SourcePolicy } from '../../types/chat';
import { MessageList } from './MessageList';
import { EmptyState } from './EmptyState';
import { ChatComposer } from './ChatComposer';

interface ChatViewProps {
  messages: ChatMessage[];
  isLoading: boolean;
  loadingText: string;
  sourcePolicy?: SourcePolicy;
  onPolicyChange?: (newPolicy: SourcePolicy) => void;
  onSendMessage: (query: string) => void;
  onStop: () => void;
  onSelectCitation: (citation: Citation) => void;
  onCopyText: (text: string) => void;
  onRetryLast: () => void;
  onHeaderVisibilityChange?: (isVisible: boolean) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  isLoading,
  loadingText,
  sourcePolicy,
  onPolicyChange,
  onSendMessage,
  onStop,
  onSelectCitation,
  onCopyText,
  onRetryLast,
  onHeaderVisibilityChange,
}) => {
  const hasMessages = messages.length > 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#F9FAFB]">
      {hasMessages ? (
        <MessageList
          messages={messages}
          isLoading={isLoading}
          loadingText={loadingText}
          onSelectCitation={onSelectCitation}
          onCopyText={onCopyText}
          onRetryLast={onRetryLast}
          onHeaderVisibilityChange={onHeaderVisibilityChange}
        />
      ) : (
        <div className="flex-1 overflow-y-auto flex items-center justify-center pt-12 md:pt-0">
          <EmptyState />
        </div>
      )}

      {/* Bottom Input Composer with subtle gradient backdrop */}
      <div className="shrink-0 bg-gradient-to-t from-[#F9FAFB] via-[#F9FAFB] to-transparent pt-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <ChatComposer
          isLoading={isLoading}
          onSendMessage={onSendMessage}
          onStop={onStop}
          sourcePolicy={sourcePolicy}
          onPolicyChange={onPolicyChange}
        />
      </div>
    </div>
  );
};
