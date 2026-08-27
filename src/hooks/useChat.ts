import { useState, useRef, useCallback } from 'react';
import type { ChatMessage, Citation, Conversation } from '../types/chat';
import { sendChatQuery, ChatApiError } from '../services/chatApi';
import { buildRecentHistory } from '../utils/history';

export interface UseChatProps {
  activeConversationId: string | null;
  activeConversation: Conversation | null;
  createNewConversation: () => string;
  addMessageToConversation: (conversationId: string, message: ChatMessage) => void;
  updateLastMessageInConversation: (
    conversationId: string,
    updater: (lastMessage: ChatMessage) => ChatMessage
  ) => void;
}

export function useChat({
  activeConversationId,
  activeConversation,
  createNewConversation,
  addMessageToConversation,
  updateLastMessageInConversation,
}: UseChatProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Đang tra cứu và tổng hợp từ tài liệu...');
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [isSourceDrawerOpen, setIsSourceDrawerOpen] = useState(false);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const openCitationDrawer = useCallback((citation: Citation) => {
    setSelectedCitation(citation);
    setIsSourceDrawerOpen(true);
  }, []);

  const closeCitationDrawer = useCallback(() => {
    setIsSourceDrawerOpen(false);
  }, []);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  const sendMessage = useCallback(
    async (queryText: string, retryConversationId?: string) => {
      const trimmedQuery = queryText.trim();
      if (!trimmedQuery || isLoading) return;

      let convId = retryConversationId || activeConversationId;
      if (!convId) {
        convId = createNewConversation();
      }

      // Calculate recent history from prior messages in active conversation
      const currentMessages =
        activeConversation && activeConversation.id === convId
          ? activeConversation.messages
          : [];

      // If retrying, slice before the failed turn; otherwise take all current messages
      const messagesForHistory = retryConversationId
        ? currentMessages.filter((m) => m.status !== 'error')
        : currentMessages;

      const history = buildRecentHistory(messagesForHistory, 10, 20000);

      // Add user message if not retrying an existing query directly
      if (!retryConversationId) {
        const userMsg: ChatMessage = {
          id: 'msg_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
          role: 'user',
          content: trimmedQuery,
          createdAt: Date.now(),
          status: 'ok',
        };
        addMessageToConversation(convId, userMsg);
      }

      setIsLoading(true);
      setLoadingText('Đang tra cứu và tổng hợp từ tài liệu...');
      setLastFailedQuery(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await sendChatQuery(
          {
            query: trimmedQuery,
            history: history.length > 0 ? history : undefined,
            top_k: 6,
            context_radius: 1,
            max_context_chars: 16000,
          },
          controller.signal
        );

        if (response.status === 'insufficient_evidence' || response.answer === 'INSUFFICIENT_EVIDENCE') {
          const assistantMsg: ChatMessage = {
            id: 'msg_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
            role: 'assistant',
            content: 'INSUFFICIENT_EVIDENCE',
            createdAt: Date.now(),
            status: 'insufficient_evidence',
            citations: [],
          };
          addMessageToConversation(convId, assistantMsg);
        } else {
          const assistantMsg: ChatMessage = {
            id: 'msg_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
            role: 'assistant',
            content: response.answer || '',
            createdAt: Date.now(),
            status: 'ok',
            citations: response.citations || [],
          };
          addMessageToConversation(convId, assistantMsg);
        }
      } catch (err: unknown) {
        if (err instanceof ChatApiError && err.isCancelled) {
          // User aborted manually, no error message needed
          return;
        }

        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Không thể kết nối tới máy chủ.';

        setLastFailedQuery(trimmedQuery);

        const errorMsg: ChatMessage = {
          id: 'msg_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
          role: 'assistant',
          content: '',
          createdAt: Date.now(),
          status: 'error',
          errorDetails: {
            code: err instanceof ChatApiError ? err.statusCode : undefined,
            message: errorMessage,
          },
        };
        addMessageToConversation(convId, errorMsg);
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [activeConversationId, activeConversation, createNewConversation, addMessageToConversation, isLoading]
  );

  const retryLastMessage = useCallback(
    (query: string) => {
      if (!activeConversationId) return;
      // Remove or overwrite the last error message
      updateLastMessageInConversation(activeConversationId, (lastMsg) => {
        if (lastMsg.status === 'error') {
          return {
            ...lastMsg,
            status: 'ok',
            content: 'Đang thử lại...',
          };
        }
        return lastMsg;
      });
      sendMessage(query, activeConversationId);
    },
    [activeConversationId, sendMessage, updateLastMessageInConversation]
  );

  return {
    isLoading,
    loadingText,
    selectedCitation,
    isSourceDrawerOpen,
    lastFailedQuery,
    openCitationDrawer,
    closeCitationDrawer,
    sendMessage,
    stopGeneration,
    retryLastMessage,
  };
}
