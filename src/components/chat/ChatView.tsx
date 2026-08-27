import React, { useState } from 'react';
import type { ChatMessage, Citation } from '../../types/chat';
import { MessageList } from './MessageList';
import { EmptyState } from './EmptyState';
import { ChatComposer } from './ChatComposer';

interface ChatViewProps {
  messages: ChatMessage[];
  isLoading: boolean;
  loadingText: string;
  onSendMessage: (query: string) => void;
  onStop: () => void;
  onSelectCitation: (citation: Citation) => void;
  onCopyText: (text: string) => void;
  onRetryLast: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  isLoading,
  loadingText,
  onSendMessage,
  onStop,
  onSelectCitation,
  onCopyText,
  onRetryLast,
}) => {
  const [composerValue, setComposerValue] = useState('');

  const handleSelectSuggestion = (query: string) => {
    setComposerValue(query);
    // User requested: "Click suggestion sẽ điền vào input, chưa tự gửi hoặc có thể gửi ngay nếu UX hợp lý."
    // Let's send immediately for instant clinical satisfaction and fluidity:
    onSendMessage(query);
  };

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
        />
      ) : (
        <div className="flex-1 overflow-y-auto flex items-center justify-center">
          <EmptyState onSelectSuggestion={handleSelectSuggestion} />
        </div>
      )}

      {/* Bottom Input Composer with subtle gradient backdrop */}
      <div className="bg-gradient-to-t from-[#F9FAFB] via-[#F9FAFB] to-transparent pt-3 pb-2">
        <ChatComposer
          isLoading={isLoading}
          onSendMessage={onSendMessage}
          onStop={onStop}
          initialValue={composerValue}
        />
      </div>
    </div>
  );
};
