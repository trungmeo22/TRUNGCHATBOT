import React, { useEffect, useRef } from 'react';
import type { ChatMessage, Citation } from '../../types/chat';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';
import { LoadingMessage } from './LoadingMessage';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  loadingText: string;
  onSelectCitation: (citation: Citation) => void;
  onCopyText: (text: string) => void;
  onRetryLast: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  loadingText,
  onSelectCitation,
  onCopyText,
  onRetryLast,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages if near bottom
  useEffect(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 250;

    if (isNearBottom || isLoading) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  return (
    <div
      ref={containerRef}
      id="chat-message-list"
      className="flex-1 overflow-y-auto px-2 sm:px-4 py-6 space-y-4"
    >
      {messages.map((message) => {
        if (message.role === 'user') {
          return <UserMessage key={message.id} message={message} />;
        }
        return (
          <AssistantMessage
            key={message.id}
            message={message}
            onSelectCitation={onSelectCitation}
            onCopyText={onCopyText}
            onRetry={onRetryLast}
          />
        );
      })}

      {isLoading && <LoadingMessage text={loadingText} />}

      <div ref={bottomRef} className="h-2" />
    </div>
  );
};
