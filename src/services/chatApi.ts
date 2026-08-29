import type { ChatRequest, ChatResponse, Citation, SourcePolicy } from '../types/chat';
import { mockChatRequest } from './mockChatApi';

export class ChatApiError extends Error {
  statusCode?: number;
  isCancelled?: boolean;

  constructor(message: string, statusCode?: number, isCancelled: boolean = false) {
    super(message);
    this.name = 'ChatApiError';
    this.statusCode = statusCode;
    this.isCancelled = isCancelled;
  }
}

/**
 * Mock mode is strictly opt-in and NEVER default in production.
 * Only enabled when VITE_USE_MOCK_CHAT is explicitly 'true' | true | '1' | 1.
 */
export function isMockMode(): boolean {
  const envVal = (import.meta as { env?: Record<string, unknown> }).env?.VITE_USE_MOCK_CHAT;
  return envVal === true || envVal === 'true' || envVal === 1 || envVal === '1';
}

export interface StreamEventCallbacks {
  onStatusChange?: (statusText: string) => void;
  onAnswerDelta?: (delta: string) => void;
  onAnswerStart?: () => void;
  onDone?: (finalResponse: ChatResponse) => void;
}

/**
 * SSE Stream Client for V2-G endpoint: POST /api/chat-v2/stream
 */
export async function sendChatQueryStream(
  request: ChatRequest,
  callbacks: StreamEventCallbacks,
  signal?: AbortSignal
): Promise<ChatResponse> {
  if (isMockMode()) {
    const mockRes = await mockChatRequest(request, signal);
    if (callbacks.onAnswerDelta) {
      callbacks.onAnswerDelta(mockRes.answer);
    }
    if (callbacks.onDone) {
      callbacks.onDone(mockRes);
    }
    return mockRes;
  }

  const payload: Record<string, unknown> = {
    query: request.query.trim(),
    ...(request.conversation_id ? { conversation_id: request.conversation_id.trim() } : {}),
    ...(request.source_policy ? { source_policy: request.source_policy } : {}),
    top_k: request.top_k ?? 6,
    context_radius: request.context_radius ?? 1,
    max_context_chars: request.max_context_chars ?? 16000,
  };

  let response: Response;
  try {
    response = await fetch('/api/chat-v2/stream', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal,
    });
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ChatApiError('Yêu cầu đã được hủy.', undefined, true);
    }
    const err = error as { message?: string };
    throw new ChatApiError(err?.message || 'Không thể kết nối tới máy chủ tra cứu.');
  }

  if (!response.ok) {
    const status = response.status;
    let errorData: { error?: string; message?: string } | null = null;
    try {
      errorData = await response.json();
    } catch {
      // Non-JSON error
    }

    if (status === 401 || status === 403) {
      throw new ChatApiError(errorData?.message || 'Lỗi xác thực với hệ thống tri thức upstream.', status);
    } else if (status === 502) {
      throw new ChatApiError(
        errorData?.message || 'Không thể kết nối hoặc xác thực với nguồn tri thức y khoa. Vui lòng thử lại.',
        status
      );
    } else if (status === 503) {
      throw new ChatApiError(
        errorData?.message || 'Dịch vụ tra cứu y khoa đang tạm thời chưa sẵn sàng. Vui lòng thử lại sau.',
        status
      );
    } else if (status === 504) {
      throw new ChatApiError(
        errorData?.message || 'Quá trình đối chiếu tài liệu mất quá nhiều thời gian (Timeout). Vui lòng thử lại.',
        status
      );
    } else if (status === 400 || status === 422) {
      throw new ChatApiError(errorData?.message || 'Câu hỏi tra cứu không hợp lệ (từ 2 đến 2000 ký tự).', status);
    } else {
      throw new ChatApiError(errorData?.message || `Lỗi dịch vụ (${status}). Vui lòng thử lại sau.`, status);
    }
  }

  if (!response.body) {
    throw new ChatApiError('Không nhận được luồng dữ liệu từ máy chủ.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');

  let buffer = '';
  let accumulatedAnswer = '';
  let finalResponse: ChatResponse | null = null;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // SSE frames are separated by double newline \n\n or \r\n\r\n
      const parts = buffer.split(/\r?\n\r?\n/);
      // The last element is the remaining partial frame
      buffer = parts.pop() || '';

      for (const part of parts) {
        const trimmedPart = part.trim();
        if (!trimmedPart) continue;

        let eventType = 'message';
        let dataStr = '';

        const lines = trimmedPart.split(/\r?\n/);
        for (const line of lines) {
          if (line.startsWith('event:')) {
            eventType = line.substring(6).trim();
          } else if (line.startsWith('data:')) {
            const dataContent = line.substring(5).trim();
            dataStr = dataStr ? `${dataStr}\n${dataContent}` : dataContent;
          }
        }

        if (!dataStr) continue;

        let parsedData: any = null;
        try {
          parsedData = JSON.parse(dataStr);
        } catch {
          // If not JSON, handle as raw string if applicable
          parsedData = dataStr;
        }

        // Process SSE events
        if (eventType === 'started') {
          if (callbacks.onStatusChange) {
            callbacks.onStatusChange('Đang khởi động truy vấn y khoa...');
          }
        } else if (eventType === 'retrieval_complete') {
          if (callbacks.onStatusChange) {
            const count = parsedData?.retrieval_count || parsedData?.evidence_count;
            callbacks.onStatusChange(
              count ? `Đã tìm thấy ${count} đoạn tài liệu đối chiếu. Đang tổng hợp...` : 'Đang đối chiếu tài liệu và phác đồ...'
            );
          }
        } else if (eventType === 'answer_start') {
          if (callbacks.onAnswerStart) {
            callbacks.onAnswerStart();
          }
        } else if (eventType === 'answer_delta') {
          const delta = typeof parsedData === 'string' ? parsedData : parsedData?.delta || parsedData?.text || '';
          if (delta) {
            accumulatedAnswer += delta;
            if (callbacks.onAnswerDelta) {
              callbacks.onAnswerDelta(delta);
            }
          }
        } else if (eventType === 'done') {
          if (typeof parsedData === 'object' && parsedData !== null) {
            finalResponse = parsedData as ChatResponse;
          }
        } else if (eventType === 'error') {
          const errMsg = typeof parsedData === 'object' && parsedData?.message ? parsedData.message : 'Lỗi trong quá trình xử lý tri thức.';
          throw new ChatApiError(errMsg);
        } else if (eventType === 'heartbeat') {
          // Ignore heartbeat safely
        } else {
          // Unknown event safely ignored
        }
      }
    }
  } catch (readErr: unknown) {
    if (readErr instanceof ChatApiError) {
      throw readErr;
    }
    if (readErr instanceof DOMException && readErr.name === 'AbortError') {
      throw new ChatApiError('Yêu cầu đã được hủy.', undefined, true);
    }
    const err = readErr as { message?: string };
    throw new ChatApiError(err?.message || 'Lỗi khi đọc luồng phản hồi từ máy chủ.');
  }

  // Fallback authoritative payload if done event wasn't sent or partial
  if (!finalResponse) {
    finalResponse = {
      status: 'ok',
      answer: accumulatedAnswer,
      citations: [],
    };
  }

  if (callbacks.onDone) {
    callbacks.onDone(finalResponse);
  }

  return finalResponse;
}

/**
 * Non-streaming fallback / debug client: POST /api/chat-v2
 */
export async function sendChatQuery(
  request: ChatRequest,
  signal?: AbortSignal
): Promise<ChatResponse> {
  if (isMockMode()) {
    return mockChatRequest(request, signal);
  }

  const payload: Record<string, unknown> = {
    query: request.query.trim(),
    ...(request.conversation_id ? { conversation_id: request.conversation_id.trim() } : {}),
    ...(request.source_policy ? { source_policy: request.source_policy } : {}),
    top_k: request.top_k ?? 6,
    context_radius: request.context_radius ?? 1,
    max_context_chars: request.max_context_chars ?? 16000,
  };

  try {
    const response = await fetch('/api/chat-v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      const status = response.status;
      let errorData: { error?: string; message?: string } | null = null;
      try {
        errorData = await response.json();
      } catch {
        // Non-JSON response
      }

      if (status === 401 || status === 403) {
        throw new ChatApiError(errorData?.message || 'Không thể xác thực với dịch vụ.', status);
      } else if (status === 502) {
        throw new ChatApiError(
          errorData?.message || 'Không thể kết nối hoặc xác thực với nguồn tri thức y khoa. Vui lòng thử lại.',
          status
        );
      } else if (status === 503) {
        throw new ChatApiError(
          errorData?.message || 'Dịch vụ tra cứu y khoa đang tạm thời chưa sẵn sàng. Vui lòng thử lại sau.',
          status
        );
      } else if (status === 504) {
        throw new ChatApiError(
          errorData?.message || 'Quá trình đối chiếu tài liệu mất quá nhiều thời gian (Timeout). Vui lòng thử lại.',
          status
        );
      } else if (status === 400 || status === 422) {
        throw new ChatApiError(errorData?.message || 'Câu hỏi tra cứu không hợp lệ (từ 2 đến 2000 ký tự).', status);
      } else {
        throw new ChatApiError(errorData?.message || `Lỗi dịch vụ (${status}). Vui lòng thử lại sau.`, status);
      }
    }

    const data = await response.json();
    return data as ChatResponse;
  } catch (error: unknown) {
    if (error instanceof ChatApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ChatApiError('Yêu cầu tra cứu đã được hủy.', undefined, true);
    }

    const err = error as { name?: string; message?: string };
    throw new ChatApiError(err?.message || 'Không thể kết nối tới máy chủ.');
  }
}

/**
 * Delete conversation on backend: DELETE /api/conversations/[conversationId]
 */
export async function deleteBackendConversation(conversationId: string): Promise<boolean> {
  if (isMockMode()) return true;
  try {
    const res = await fetch(`/api/conversations/${encodeURIComponent(conversationId)}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn(`[chatApi] Failed to delete backend conversation ${conversationId}:`, err);
    return false;
  }
}

/**
 * Health check helper for the sidebar indicator (Strict production health, no fake ready)
 */
export async function checkKnowledgeEngineHealth(): Promise<{
  status: 'ready' | 'mock' | 'error';
  message: string;
}> {
  if (isMockMode()) {
    return {
      status: 'mock',
      message: 'Chế độ Mock dữ liệu',
    };
  }

  try {
    const res = await fetch('/api/health', { method: 'GET', signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data.status === 'ready' || data.status === 'ok') {
        return { status: 'ready', message: 'Knowledge Engine sẵn sàng' };
      }
      return { status: 'ready', message: 'Knowledge Engine sẵn sàng' };
    }
    return { status: 'error', message: 'Không kết nối được Knowledge Engine' };
  } catch {
    return { status: 'error', message: 'Không kết nối được Knowledge Engine' };
  }
}
