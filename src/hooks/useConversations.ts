import { useState, useEffect, useCallback } from 'react';
import type { Conversation, ChatMessage } from '../types/chat';
import { loadConversations, saveConversations, generateId } from '../utils/storage';

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    return loadConversations();
  });
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Sync to storage on change
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;

  const createNewConversation = useCallback((): string => {
    const newId = generateId();
    const newConv: Conversation = {
      id: newId,
      title: 'Cuộc trò chuyện mới',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
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
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
    },
    [activeConversationId]
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
            title = message.content.length > 42
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
    updateLastMessageInConversation,
    setActiveConversationId,
  };
}
