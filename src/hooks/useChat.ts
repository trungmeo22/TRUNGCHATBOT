import { useState, useRef, useCallback } from 'react';
import type { ChatMessage, Citation, Conversation, SourcePolicy, ChatResponse } from '../types/chat';
import { sendChatQueryStream, ChatApiError } from '../services/chatApi';
import { DEFAULT_SOURCE_POLICY } from '../utils/sourcePolicy';

export interface UseChatProps {
  activeConversationId: string | null;
  activeConversation: Conversation | null;
  createNewConversation: (customPolicy?: SourcePolicy) => string;
  addMessageToConversation: (conversationId: string, message: ChatMessage) => void;
  updateMessageInConversation: (
    conversationId: string,
    messageId: string,
    updater: (msg: ChatMessage) => ChatMessage
  ) => void;
  updateLastMessageInConversation: (
    conversationId: string,
    updater: (lastMessage: ChatMessage) => ChatMessage
  ) => void;
}

function normalizeResponseCitations(response: ChatResponse): Citation[] {
  const rawCitations = Array.isArray(response.citations)
    ? response.citations
    : Array.isArray(response.CITATIONS)
      ? response.CITATIONS
      : [];

  return rawCitations
    .filter((item): item is Citation => Boolean(item && typeof item === 'object'))
    .map((citation, index) => {
      const anyCitation = citation as Citation & Record<string, unknown>;
      const evidenceId =
        typeof anyCitation.evidence_id === 'string' && anyCitation.evidence_id.trim()
          ? anyCitation.evidence_id.trim().toUpperCase()
          : `E${index + 1}`;

      const documentTitle =
        typeof anyCitation.document_title === 'string' && anyCitation.document_title.trim()
          ? anyCitation.document_title.trim()
          : typeof anyCitation.title === 'string' && anyCitation.title.trim()
            ? anyCitation.title.trim()
            : typeof anyCitation.file_name === 'string' && anyCitation.file_name.trim()
              ? anyCitation.file_name.trim()
              : typeof anyCitation.document_id === 'string' && anyCitation.document_id.trim()
                ? anyCitation.document_id.trim()
                : `Nguồn ${evidenceId}`;

      const quote =
        typeof anyCitation.quote === 'string' && anyCitation.quote.trim()
          ? anyCitation.quote.trim()
          : typeof anyCitation.quote_preview === 'string' && anyCitation.quote_preview.trim()
            ? anyCitation.quote_preview.trim()
            : typeof anyCitation.source_text === 'string' && anyCitation.source_text.trim()
              ? anyCitation.source_text.trim()
              : typeof anyCitation.evidence_text === 'string' && anyCitation.evidence_text.trim()
                ? anyCitation.evidence_text.trim()
                : undefined;

      return {
        ...citation,
        evidence_id: evidenceId,
        document_title: documentTitle,
        quote,
      };
    });
}

export function useChat({
  activeConversationId,
  activeConversation,
  createNewConversation,
  addMessageToConversation,
  updateMessageInConversation,
  updateLastMessageInConversation,
}: UseChatProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Đang đối chiếu tài liệu và phác đồ...');
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

      const currentPolicy =
        (activeConversation && activeConversation.id === convId && activeConversation.sourcePolicy) ||
        DEFAULT_SOURCE_POLICY;

      if (!retryConversationId) {
        const userMsg: ChatMessage = {
          id: 'msg_u_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
          role: 'user',
          content: trimmedQuery,
          createdAt: Date.now(),
          status: 'ok',
        };
        addMessageToConversation(convId, userMsg);
      }

      const assistantMsgId = 'msg_a_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
      const initialAssistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: '',
        createdAt: Date.now(),
        status: 'ok',
        isStreaming: true,
        citations: [],
        sourcePolicyUsed: currentPolicy,
      };
      addMessageToConversation(convId, initialAssistantMsg);

      setIsLoading(true);
      setLoadingText('Đang đối chiếu tài liệu và phác đồ...');
      setLastFailedQuery(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      let accumulatedContent = '';

      try {
        const finalResponse = await sendChatQueryStream(
          {
            query: trimmedQuery,
            conversation_id: convId,
            source_policy: currentPolicy,
            top_k: 6,
            context_radius: 1,
            max_context_chars: 16000,
          },
          {
            onStatusChange: (statusText) => {
              setLoadingText(statusText);
            },
            onAnswerStart: () => {
              setLoadingText('');
            },
            onAnswerDelta: (delta) => {
              accumulatedContent += delta;
              updateMessageInConversation(convId, assistantMsgId, (prev) => ({
                ...prev,
                content: accumulatedContent,
                isStreaming: true,
              }));
            },
          },
          controller.signal
        );

        const finalStatus = finalResponse.status === 'insufficient_evidence' || finalResponse.answer === 'INSUFFICIENT_EVIDENCE'
          ? 'insufficient_evidence'
          : 'ok';

        const normalizedCitations = normalizeResponseCitations(finalResponse);

        updateMessageInConversation(convId, assistantMsgId, (prev) => ({
          ...prev,
          content: finalStatus === 'insufficient_evidence' ? 'INSUFFICIENT_EVIDENCE' : finalResponse.answer || accumulatedContent,
          status: finalStatus,
          isStreaming: false,
          citations: normalizedCitations,
          sourcePolicyUsed: (finalResponse.source_policy as SourcePolicy) || currentPolicy,
        }));
      } catch (err: unknown) {
        if (err instanceof ChatApiError && err.isCancelled) {
          updateMessageInConversation(convId, assistantMsgId, (prev) => ({
            ...prev,
            isStreaming: false,
            content: accumulatedContent || '(Đã dừng tra cứu)',
          }));
          return;
        }

        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Không thể kết nối tới máy chủ.';

        setLastFailedQuery(trimmedQuery);

        updateMessageInConversation(convId, assistantMsgId, (prev) => ({
          ...prev,
          content: '',
          status: 'error',
          isStreaming: false,
          errorDetails: {
            code: err instanceof ChatApiError ? err.statusCode : undefined,
            message: errorMessage,
          },
        }));
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [
      activeConversationId,
      activeConversation,
      createNewConversation,
      addMessageToConversation,
      updateMessageInConversation,
      isLoading,
    ]
  );

  const retryLastMessage = useCallback(
    (query: string) => {
      if (!activeConversationId) return;
      updateLastMessageInConversation(activeConversationId, (lastMsg) => {
        if (lastMsg.status === 'error') {
          return {
            ...lastMsg,
            status: 'ok',
            content: 'Đang thử lại...',
            isStreaming: true,
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
