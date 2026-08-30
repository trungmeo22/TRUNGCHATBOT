import { useState, useRef, useCallback } from 'react';
import type { ChatMessage, Citation, Conversation, SourcePolicy } from '../types/chat';
import { sendChatQueryStream, ChatApiError } from '../services/chatApi';
import { DEFAULT_SOURCE_POLICY } from '../utils/sourcePolicy';
import { normalizeCitations } from '../utils/citations';
import type { SplitViewDisplayMode } from '../components/citations/SplitDocumentViewer';

export interface UseChatProps {
  activeConversationId: string | null;
  activeConversation: Conversation | null;
  currentSourcePolicy?: SourcePolicy;
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

export function useChat({
  activeConversationId,
  activeConversation,
  currentSourcePolicy,
  createNewConversation,
  addMessageToConversation,
  updateMessageInConversation,
  updateLastMessageInConversation,
}: UseChatProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Đang đối chiếu tài liệu và phác đồ...');
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [activeCitationsList, setActiveCitationsList] = useState<Citation[]>([]);
  const [isSourceDrawerOpen, setIsSourceDrawerOpen] = useState(false);
  const [splitViewMode, setSplitViewMode] = useState<SplitViewDisplayMode>('split');
  const [splitWidthPercent, setSplitWidthPercent] = useState<number>(50);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const openCitationDrawer = useCallback(
    (citation: Citation, messageCitations?: Citation[]) => {
      setSelectedCitation(citation);
      if (messageCitations && messageCitations.length > 0) {
        setActiveCitationsList(messageCitations);
      } else if (activeConversation) {
        // Find message that contains this citation
        const msg = activeConversation.messages.find(
          (m) =>
            m.citations &&
            m.citations.some(
              (c) => c.evidence_id.toUpperCase() === citation.evidence_id.toUpperCase()
            )
        );
        if (msg && msg.citations) {
          setActiveCitationsList(msg.citations);
        } else {
          setActiveCitationsList([citation]);
        }
      } else {
        setActiveCitationsList([citation]);
      }
      setIsSourceDrawerOpen(true);
    },
    [activeConversation]
  );

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

      const policyForNewChat = currentSourcePolicy || (activeConversation?.sourcePolicy) || DEFAULT_SOURCE_POLICY;

      let convId = retryConversationId || activeConversationId;
      if (!convId) {
        convId = createNewConversation(policyForNewChat);
      }

      // Read current conversation's source policy to avoid leakage across conversations
      const currentPolicy =
        (activeConversation && activeConversation.id === convId && activeConversation.sourcePolicy) ||
        policyForNewChat;

      // Add user message if not retrying an existing query turn
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

      // Create assistant streaming placeholder message
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

        const normalizedCitations = normalizeCitations(finalResponse);

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
          // User cancelled stream manually: mark existing content as finished
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
      // Remove or reset last error message before retrying
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
    activeCitationsList,
    isSourceDrawerOpen,
    splitViewMode,
    setSplitViewMode,
    splitWidthPercent,
    setSplitWidthPercent,
    lastFailedQuery,
    openCitationDrawer,
    closeCitationDrawer,
    sendMessage,
    stopGeneration,
    retryLastMessage,
  };
}
