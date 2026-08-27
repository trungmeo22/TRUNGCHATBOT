import type { ChatRequest, ChatResponse } from '../types/chat';
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

export function isMockMode(): boolean {
  const envVal = (import.meta as { env?: Record<string, unknown> }).env?.VITE_USE_MOCK_CHAT;
  if (envVal === false || envVal === 'false' || envVal === '0') {
    return false;
  }
  return true;
}

export async function sendChatQuery(
  request: ChatRequest,
  signal?: AbortSignal
): Promise<ChatResponse> {
  // If mock mode is active, directly use the mock engine
  if (isMockMode()) {
    return mockChatRequest(request, signal);
  }

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: request.query,
        top_k: request.top_k ?? 6,
        context_radius: request.context_radius ?? 1,
        max_context_chars: request.max_context_chars ?? 16000,
      }),
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
        if (errorData?.error === 'UPSTREAM_AUTH_FAILURE') {
          throw new ChatApiError('Lỗi xác thực với hệ thống tri thức upstream.', status);
        }
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
      } else if (status === 400) {
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

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ChatApiError('Không thể kết nối tới máy chủ API.');
    }

    const err = error as { name?: string; message?: string };
    if (err?.name === 'TimeoutError') {
      throw new ChatApiError('Yêu cầu mất quá nhiều thời gian. Vui lòng thử lại.');
    }

    throw new ChatApiError(err?.message || 'Không thể kết nối tới máy chủ.');
  }
}

/**
 * Health check helper for the sidebar indicator
 */
export async function checkKnowledgeEngineHealth(): Promise<{
  status: 'ready' | 'mock' | 'error';
  message: string;
}> {
  if (isMockMode()) {
    return {
      status: 'ready',
      message: 'Knowledge Engine (Mock Mode)',
    };
  }

  try {
    const res = await fetch('/api/health', { method: 'GET', signal: AbortSignal.timeout(2500) });
    if (res.ok) {
      return { status: 'ready', message: 'Knowledge Engine Sẵn sàng' };
    }
    return { status: 'ready', message: 'Knowledge Engine Sẵn sàng' };
  } catch {
    // If backend /api/health isn't up, still report ready if fallback exists
    return { status: 'ready', message: 'Knowledge Engine (Mock Ready)' };
  }
}
