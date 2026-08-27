import type { ChatMessage, HistoryMessage } from '../types/chat';

/**
 * Builds recent conversation history suitable for ChatRequest.
 * - Extracts up to `maxItems` (default 10) messages before current query.
 * - Only includes { role, content } with valid text.
 * - Enforces total character limit (default 20,000 chars), dropping oldest items first.
 */
export function buildRecentHistory(
  messages: ChatMessage[],
  maxItems = 10,
  maxTotalChars = 20000
): HistoryMessage[] {
  if (!messages || messages.length === 0) {
    return [];
  }

  // Filter valid user / assistant messages with non-empty content
  const validMessages = messages.filter(
    (m) =>
      (m.role === 'user' || m.role === 'assistant') &&
      typeof m.content === 'string' &&
      m.content.trim().length > 0 &&
      m.status !== 'error'
  );

  // Take the most recent `maxItems` messages
  const recentSlice = validMessages.slice(-maxItems);

  // Map to clean { role, content } objects, stripping all extra fields
  const history: HistoryMessage[] = recentSlice.map((m) => ({
    role: m.role,
    content: m.content.trim(),
  }));

  // Enforce max total characters: drop oldest messages until within budget
  let totalChars = history.reduce((sum, item) => sum + item.content.length, 0);
  while (history.length > 0 && totalChars > maxTotalChars) {
    const dropped = history.shift();
    if (dropped) {
      totalChars -= dropped.content.length;
    }
  }

  return history;
}
