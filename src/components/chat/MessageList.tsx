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
  onHeaderVisibilityChange?: (isVisible: boolean) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  loadingText,
  onSelectCitation,
  onCopyText,
  onRetryLast,
  onHeaderVisibilityChange,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef<number>(0);
  const touchStartYRef = useRef<number | null>(null);

  // Auto-scroll on new messages if near bottom
  useEffect(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 250;

    if (isNearBottom || isLoading) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Handle scroll events to show/hide header dynamically
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!onHeaderVisibilityChange) return;
    const currentScrollTop = e.currentTarget.scrollTop;
    const scrollDelta = currentScrollTop - lastScrollTopRef.current;

    if (currentScrollTop <= 15) {
      // Always show at top of conversation
      onHeaderVisibilityChange(true);
    } else if (scrollDelta > 8) {
      // Scrolling DOWN -> hide header to maximize reading area
      onHeaderVisibilityChange(false);
    } else if (scrollDelta < -6) {
      // Scrolling UP ("vuốt ngược đoạn chat lên") -> reveal header immediately
      onHeaderVisibilityChange(true);
    }

    lastScrollTopRef.current = currentScrollTop;
  };

  // Touch handlers for mobile swipe sensitivity
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartYRef.current === null || !onHeaderVisibilityChange) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartYRef.current; // > 0 means dragging finger down / scrolling upwards

    if (deltaY > 12) {
      // Dragging downward = viewing earlier messages -> reveal header
      onHeaderVisibilityChange(true);
    } else if (deltaY < -18 && (containerRef.current?.scrollTop || 0) > 30) {
      // Dragging upward = scrolling downward -> hide header
      onHeaderVisibilityChange(false);
    }
  };

  return (
    <div
      ref={containerRef}
      id="chat-message-list"
      onScroll={handleScroll}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      className="flex-1 overflow-y-auto px-2 sm:px-4 pt-16 md:pt-6 pb-6 space-y-4"
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
