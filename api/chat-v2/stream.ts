import type { IncomingMessage, ServerResponse } from 'http';

interface ChatRequestBodyV2 {
  query?: unknown;
  conversation_id?: unknown;
  source_policy?: unknown;
  top_k?: unknown;
  context_radius?: unknown;
  max_context_chars?: unknown;
  [key: string]: unknown;
}

async function parseJsonBody(req: IncomingMessage & { body?: unknown }): Promise<ChatRequestBodyV2 | null> {
  if (req.body && typeof req.body === 'object') {
    return req.body as ChatRequestBodyV2;
  }

  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as ChatRequestBodyV2;
    } catch {
      return null;
    }
  }

  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        req.destroy();
        resolve(null);
      }
    });
    req.on('end', () => {
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw) as ChatRequestBodyV2);
      } catch {
        resolve(null);
      }
    });
    req.on('error', () => {
      resolve(null);
    });
  });
}

function sendJsonResponse(
  res: ServerResponse & { status?: (code: number) => any; json?: (data: any) => any },
  statusCode: number,
  data: Record<string, unknown>,
  headers?: Record<string, string>
) {
  if (headers) {
    for (const [key, value] of Object.entries(headers)) {
      res.setHeader(key, value);
    }
  }

  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(statusCode).json(data);
    return;
  }

  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
}

/**
 * Vercel Serverless Function & Vite Dev Middleware entrypoint
 * POST /api/chat-v2/stream (SSE streaming proxy to upstream ${KNOWLEDGE_API_URL}/chat-v2/stream)
 */
export default async function handler(
  req: IncomingMessage & { body?: unknown; method?: string; headers: Record<string, string | string[] | undefined> },
  res: ServerResponse & { status?: (code: number) => any; json?: (data: any) => any; flushHeaders?: () => void }
) {
  const incomingRequestId = Array.isArray(req.headers['x-request-id'])
    ? req.headers['x-request-id'][0]
    : req.headers['x-request-id'];
  const requestId = incomingRequestId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `req-stream-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

  res.setHeader('X-Request-ID', requestId);

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJsonResponse(res, 405, {
      error: 'METHOD_NOT_ALLOWED',
      message: 'Method not allowed. Only POST is accepted.',
    });
    return;
  }

  const knowledgeApiUrl = process.env.KNOWLEDGE_API_URL?.trim();
  const knowledgeApiKey = process.env.KNOWLEDGE_API_KEY?.trim();

  if (!knowledgeApiUrl || !knowledgeApiKey) {
    sendJsonResponse(res, 503, {
      error: 'SERVICE_UNAVAILABLE',
      message: 'Knowledge service configuration is missing on the server.',
    });
    return;
  }

  const rawBody = await parseJsonBody(req);
  if (!rawBody || typeof rawBody !== 'object') {
    sendJsonResponse(res, 400, {
      error: 'INVALID_REQUEST',
      message: 'Invalid JSON request body.',
    });
    return;
  }

  const { query, conversation_id, source_policy, top_k, context_radius, max_context_chars } = rawBody;

  if (typeof query !== 'string') {
    sendJsonResponse(res, 400, {
      error: 'INVALID_QUERY',
      message: 'Field "query" is required and must be a string.',
    });
    return;
  }

  const trimmedQuery = query.trim();
  if (trimmedQuery.length < 2 || trimmedQuery.length > 2000) {
    sendJsonResponse(res, 400, {
      error: 'INVALID_QUERY_LENGTH',
      message: 'Query length must be between 2 and 2000 characters.',
    });
    return;
  }

  let validatedConversationId: string | undefined = undefined;
  if (conversation_id !== undefined && conversation_id !== null) {
    if (typeof conversation_id !== 'string' || conversation_id.trim().length === 0) {
      sendJsonResponse(res, 400, {
        error: 'INVALID_CONVERSATION_ID',
        message: 'Field "conversation_id" must be a non-empty string.',
      });
      return;
    }
    validatedConversationId = conversation_id.trim();
  }

  const upstreamPayload: Record<string, unknown> = {
    query: trimmedQuery,
    ...(validatedConversationId ? { conversation_id: validatedConversationId } : {}),
    ...(source_policy && typeof source_policy === 'object' ? { source_policy } : {}),
    top_k: typeof top_k === 'number' && Number.isInteger(top_k) && top_k >= 1 && top_k <= 8 ? top_k : 6,
    context_radius: typeof context_radius === 'number' && Number.isInteger(context_radius) && context_radius >= 0 && context_radius <= 2 ? context_radius : 1,
    max_context_chars: typeof max_context_chars === 'number' && Number.isInteger(max_context_chars) && max_context_chars >= 2000 && max_context_chars <= 30000 ? max_context_chars : 16000,
  };

  const upstreamEndpoint = `${knowledgeApiUrl.replace(/\/+$/, '')}/chat-v2/stream`;
  const controller = new AbortController();

  // If client disconnects / aborts, abort upstream request to stop LLM work
  req.on('close', () => {
    if (!res.writableEnded) {
      controller.abort();
    }
  });

  try {
    const upstreamResponse = await fetch(upstreamEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': knowledgeApiKey,
        'X-Request-ID': requestId,
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(upstreamPayload),
      signal: controller.signal,
    });

    if (!upstreamResponse.ok) {
      let errPayload: any = null;
      try {
        errPayload = await upstreamResponse.json();
      } catch {
        // Not JSON
      }

      if (upstreamResponse.status === 401 || upstreamResponse.status === 403) {
        sendJsonResponse(res, 502, {
          error: 'UPSTREAM_AUTH_FAILURE',
          message: 'Authentication failed with upstream knowledge provider.',
        });
        return;
      }

      const statusCode = upstreamResponse.status >= 400 && upstreamResponse.status < 500 ? upstreamResponse.status : 502;
      sendJsonResponse(res, statusCode, {
        error: errPayload?.error || 'UPSTREAM_STREAM_ERROR',
        message: errPayload?.message || `Upstream stream failed with status ${upstreamResponse.status}`,
      });
      return;
    }

    if (!upstreamResponse.body) {
      sendJsonResponse(res, 502, {
        error: 'UPSTREAM_NO_BODY',
        message: 'No response body stream received from upstream service.',
      });
      return;
    }

    // Set streaming headers
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    if (typeof res.flushHeaders === 'function') {
      res.flushHeaders();
    }

    const reader = upstreamResponse.body.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        if (value) {
          res.write(value);
          // Attempt to flush if supported
          if (typeof (res as any).flush === 'function') {
            (res as any).flush();
          }
        }
      }
    } catch (readErr: unknown) {
      const err = readErr as { name?: string };
      if (err?.name !== 'AbortError') {
        console.error(`[${requestId}] Stream chunk pipe error:`, readErr);
      }
    } finally {
      res.end();
    }
  } catch (error: unknown) {
    const err = error as { name?: string; message?: string };
    if (err?.name === 'AbortError' || controller.signal.aborted) {
      if (!res.headersSent) {
        sendJsonResponse(res, 504, {
          error: 'UPSTREAM_TIMEOUT',
          message: 'Request to upstream streaming service timed out.',
        });
      } else {
        res.end();
      }
      return;
    }

    if (!res.headersSent) {
      sendJsonResponse(res, 502, {
        error: 'UPSTREAM_NETWORK_ERROR',
        message: 'Failed to communicate with knowledge stream service.',
      });
    } else {
      res.end();
    }
  }
}
