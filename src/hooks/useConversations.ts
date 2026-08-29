import { useState, useEffect, useCallback } from 'react';
import type { Conversation, ChatMessage, SourcePolicy } from '../types/chat';
import { loadConversations, saveConversations, generateId } from '../utils/storage';
import { DEFAULT_SOURCE_POLICY } from '../utils/sourcePolicy';
import { deleteBackendConversation } from '../services/chatApi';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const loaded = loadConversations();
    // Ensure all loaded conversations have a valid sourcePolicy
    return loaded.map((c) => ({
      ...c,
      sourcePolicy: c.sourcePolicy || DEFAULT_SOURCE_POLICY,
    }));
  });
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Sync to storage on change
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  const createNewConversation = useCallback((customPolicy?: SourcePolicy): string => {
    const newId = generateId();
    const newConv: Conversation = {
      id: newId,
      title: 'Cuộc trò chuyện mới',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      sourcePolicy: customPolicy || DEFAULT_SOURCE_POLICY,
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    return newId;
  }, []);

  const selectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
  }, []);

  const clearActiveConversation = useCallback(() => {
    setActiveConversationId(null);
  }, []);

  const renameConversation = useCallback((id: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              title: trimmed,
              updatedAt: Date.now(),
            }
          : c
      )
    );
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      // 1. Remove from frontend state and localStorage
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
      // 2. Call backend DELETE endpoint asynchronously
      deleteBackendConversation(id).catch((err) => {
        console.warn(`[useConversations] Backend deletion failed for ${id}:`, err);
      });
    },
    [activeConversationId]
  );

  const updateConversationSourcePolicy = useCallback(
    (conversationId: string, policy: SourcePolicy) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                sourcePolicy: policy,
                updatedAt: Date.now(),
              }
            : c
        )
      );
    },
    []
  );

  const addMessageToConversation = useCallback(
    (conversationId: string, message: ChatMessage) => {
      setConversations((prev) => {
        return prev.map((conv) => {
          if (conv.id !== conversationId) return conv;

          const updatedMessages = [...conv.messages, message];
          // If this is the first user message, set the title from query
          let title = conv.title;
          if (
            (conv.title === 'Cuộc trò chuyện mới' || conv.messages.length === 0) &&
            message.role === 'user'
          ) {
            title =
              message.content.length > 42
                ? message.content.substring(0, 42).trim() + '...'
                : message.content.trim();
          }

          return {
            ...conv,
            title,
            updatedAt: Date.now(),
            messages: updatedMessages,
          };
        });
      });
    },
    []
  );

  const updateMessageInConversation = useCallback(
    (
      conversationId: string,
      messageId: string,
      updater: (msg: ChatMessage) => ChatMessage
    ) => {
      setConversations((prev) => {
        return prev.map((conv) => {
          if (conv.id !== conversationId) return conv;

          const updatedMessages = conv.messages.map((m) =>
            m.id === messageId ? updater(m) : m
          );

          return {
            ...conv,
            updatedAt: Date.now(),
            messages: updatedMessages,
          };
        });
      });
    },
    []
  );

  const updateLastMessageInConversation = useCallback(
    (conversationId: string, updater: (lastMessage: ChatMessage) => ChatMessage) => {
      setConversations((prev) => {
        return prev.map((conv) => {
          if (conv.id !== conversationId || conv.messages.length === 0) return conv;

          const lastIdx = conv.messages.length - 1;
          const updatedMessages = [...conv.messages];
          updatedMessages[lastIdx] = updater(updatedMessages[lastIdx]);

          return {
            ...conv,
            updatedAt: Date.now(),
            messages: updatedMessages,
          };
        });
      });
    },
    []
  );

  return {
    conversations,
    activeConversationId,
    activeConversation,
    createNewConversation,
    selectConversation,
    clearActiveConversation,
    renameConversation,
    deleteConversation,
    addMessageToConversation,
    updateMessageInConversation,
    updateLastMessageInConversation,
    updateConversationSourcePolicy,
    setActiveConversationId,
  };
}
