import type { Conversation } from '../types/chat';

const STORAGE_KEY = 'med_chat_conversations_v1';
const MAX_CONVERSATIONS = 50;

export function generateId(): string {
  return 'conv_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to load conversations from localStorage:', err);
    return [];
  }
}

export function saveConversations(conversations: Conversation[]): void {
  try {
    // Keep most recent 50
    const trimmed = conversations.slice(0, MAX_CONVERSATIONS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error('Failed to save conversations to localStorage:', err);
  }
}
