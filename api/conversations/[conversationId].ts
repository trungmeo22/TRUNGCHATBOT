import type { IncomingMessage, ServerResponse } from 'http';

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
 * GET /api/conversations/[conversationId]
 * DELETE /api/conversations/[conversationId]
 */
export default async function handler(
  req: IncomingMessage & { method?: string; query?: Record<string, string | string[]>; headers: Record<string, string | string[] | undefined> },
  res: ServerResponse & { status?: (code: number) => any; json?: (data: any) => any },
  explicitConvId?: string
) {
  const incomingRequestId = Array.isArray(req.headers['x-request-id'])
    ? req.headers['x-request-id'][0]
    : req.headers['x-request-id'];
  const requestId = incomingRequestId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `req-conv-${Date.now()}`);

  res.setHeader('X-Request-ID', requestId);

  // Extract conversationId from explicit argument, query object, or URL path
  let conversationId = explicitConvId;
  if (!conversationId && req.query?.conversationId) {
    conversationId = Array.isArray(req.query.conversationId)
      ? req.query.conversationId[0]
      : req.query.conversationId;
  }
  if (!conversationId && req.url) {
    const cleanUrl = req.url.split('?')[0];
    const match = cleanUrl.match(/\/api\/conversations\/([^/]+)/);
    if (match) {
      conversationId = match[1];
    }
  }

  if (!conversationId || conversationId.trim().length === 0) {
    sendJsonResponse(res, 400, {
      error: 'INVALID_CONVERSATION_ID',
      message: 'Conversation ID is required in the path.',
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

  const method = req.method?.toUpperCase();
  if (method !== 'GET' && method !== 'DELETE') {
    res.setHeader('Allow', 'GET, DELETE');
    sendJsonResponse(res, 405, {
      error: 'METHOD_NOT_ALLOWED',
      message: 'Method not allowed. Only GET and DELETE are accepted.',
    });
    return;
  }

  const upstreamEndpoint = `${knowledgeApiUrl.replace(/\/+$/, '')}/v2/conversations/${encodeURIComponent(conversationId.trim())}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const upstreamResponse = await fetch(upstreamEndpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': knowledgeApiKey,
        'X-Request-ID': requestId,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (upstreamResponse.status === 401 || upstreamResponse.status === 403) {
      sendJsonResponse(res, 502, {
        error: 'UPSTREAM_AUTH_FAILURE',
        message: 'Authentication failed with upstream knowledge provider.',
      });
      return;
    }

    if (upstreamResponse.status === 404) {
      sendJsonResponse(res, 404, {
        error: 'CONVERSATION_NOT_FOUND',
        message: 'Conversation not found on backend.',
      });
      return;
    }

    let responseData: any = {};
    try {
      responseData = await upstreamResponse.json();
    } catch {
      responseData = { status: upstreamResponse.ok ? 'ok' : 'error' };
    }

    if (!upstreamResponse.ok) {
      const statusCode = upstreamResponse.status >= 400 && upstreamResponse.status < 500 ? upstreamResponse.status : 502;
      sendJsonResponse(res, statusCode, {
        error: responseData?.error || 'UPSTREAM_ERROR',
        message: responseData?.message || `Upstream request failed with status ${upstreamResponse.status}`,
      });
      return;
    }

    sendJsonResponse(res, 200, responseData);
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    const err = error as { name?: string; message?: string };
    if (err?.name === 'AbortError' || controller.signal.aborted) {
      sendJsonResponse(res, 504, {
        error: 'UPSTREAM_TIMEOUT',
        message: 'Request to upstream conversation endpoint timed out.',
      });
      return;
    }

    sendJsonResponse(res, 502, {
      error: 'UPSTREAM_NETWORK_ERROR',
      message: 'Failed to communicate with knowledge conversation service.',
    });
  }
}
