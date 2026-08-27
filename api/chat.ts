import type { IncomingMessage, ServerResponse } from 'http';

interface ChatRequestBody {
  query?: unknown;
  top_k?: unknown;
  context_radius?: unknown;
  max_context_chars?: unknown;
}

interface SanitizedChatPayload {
  query: string;
  top_k: number;
  context_radius: number;
  max_context_chars: number;
}

/**
 * Helper to read and parse JSON body from incoming Node.js request stream if not already parsed
 */
async function parseJsonBody(req: IncomingMessage & { body?: unknown }): Promise<ChatRequestBody | null> {
  if (req.body && typeof req.body === 'object') {
    return req.body as ChatRequestBody;
  }

  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as ChatRequestBody;
    } catch {
      return null;
    }
  }

  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      // Guard against huge payload (>1MB)
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
        resolve(JSON.parse(raw) as ChatRequestBody);
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
 * POST /api/chat
 */
export default async function handler(
  req: IncomingMessage & { body?: unknown; method?: string; headers: Record<string, string | string[] | undefined> },
  res: ServerResponse & { status?: (code: number) => any; json?: (data: any) => any }
) {
  const startTime = Date.now();
  
  // 1. Generate or forward Request ID
  const incomingRequestId = Array.isArray(req.headers['x-request-id'])
    ? req.headers['x-request-id'][0]
    : req.headers['x-request-id'];
  const requestId = incomingRequestId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `req-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

  res.setHeader('X-Request-ID', requestId);

  // 2. Validate HTTP Method (Only POST allowed)
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    sendJsonResponse(res, 405, {
      error: 'METHOD_NOT_ALLOWED',
      message: 'Method not allowed. Only POST is accepted.',
    });
    return;
  }

  // 3. Verify Server-Side Environment Variables
  const knowledgeApiUrl = process.env.KNOWLEDGE_API_URL?.trim();
  const knowledgeApiKey = process.env.KNOWLEDGE_API_KEY?.trim();

  if (!knowledgeApiUrl || !knowledgeApiKey) {
    console.error(`[${requestId}] Knowledge API configuration missing (KNOWLEDGE_API_URL or KNOWLEDGE_API_KEY).`);
    sendJsonResponse(res, 503, {
      error: 'SERVICE_UNAVAILABLE',
      message: 'Knowledge service configuration is missing on the server.',
    });
    return;
  }

  // 4. Parse and Validate Request Payload
  const rawBody = await parseJsonBody(req);
  if (!rawBody || typeof rawBody !== 'object') {
    sendJsonResponse(res, 400, {
      error: 'INVALID_REQUEST',
      message: 'Invalid JSON request body.',
    });
    return;
  }

  const { query, top_k, context_radius, max_context_chars } = rawBody;

  // Validate query: required, string, trim, length 2..2000
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

  // Validate top_k: integer 1..8, default 6
  let validatedTopK = 6;
  if (top_k !== undefined && top_k !== null) {
    if (typeof top_k !== 'number' || !Number.isInteger(top_k) || top_k < 1 || top_k > 8) {
      sendJsonResponse(res, 400, {
        error: 'INVALID_TOP_K',
        message: 'Field "top_k" must be an integer between 1 and 8.',
      });
      return;
    }
    validatedTopK = top_k;
  }

  // Validate context_radius: integer 0..2, default 1
  let validatedContextRadius = 1;
  if (context_radius !== undefined && context_radius !== null) {
    if (
      typeof context_radius !== 'number' ||
      !Number.isInteger(context_radius) ||
      context_radius < 0 ||
      context_radius > 2
    ) {
      sendJsonResponse(res, 400, {
        error: 'INVALID_CONTEXT_RADIUS',
        message: 'Field "context_radius" must be an integer between 0 and 2.',
      });
      return;
    }
    validatedContextRadius = context_radius;
  }

  // Validate max_context_chars: integer 2000..30000, default 16000
  let validatedMaxContextChars = 16000;
  if (max_context_chars !== undefined && max_context_chars !== null) {
    if (
      typeof max_context_chars !== 'number' ||
      !Number.isInteger(max_context_chars) ||
      max_context_chars < 2000 ||
      max_context_chars > 30000
    ) {
      sendJsonResponse(res, 400, {
        error: 'INVALID_MAX_CONTEXT_CHARS',
        message: 'Field "max_context_chars" must be an integer between 2000 and 30000.',
      });
      return;
    }
    validatedMaxContextChars = max_context_chars;
  }

  // Sanitized payload - strictly omit unexpected or foreign fields
  const upstreamPayload: SanitizedChatPayload = {
    query: trimmedQuery,
    top_k: validatedTopK,
    context_radius: validatedContextRadius,
    max_context_chars: validatedMaxContextChars,
  };

  // 5. Upstream Call
  const upstreamEndpoint = `${knowledgeApiUrl.replace(/\/+$/, '')}/chat`;
  const controller = new AbortController();
  const timeoutMs = 180000; // 180 seconds timeout
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const upstreamResponse = await fetch(upstreamEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': knowledgeApiKey,
        'X-Request-ID': requestId,
      },
      body: JSON.stringify(upstreamPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const elapsedMs = Date.now() - startTime;

    // Handle authentication / permission failure from upstream
    if (upstreamResponse.status === 401 || upstreamResponse.status === 403) {
      console.error(`[${requestId}] Upstream authentication failed (status ${upstreamResponse.status}) in ${elapsedMs}ms.`);
      sendJsonResponse(res, 502, {
        error: 'UPSTREAM_AUTH_FAILURE',
        message: 'Authentication failed with upstream knowledge provider.',
      });
      return;
    }

    // Handle upstream gateway / service errors
    if (upstreamResponse.status === 502) {
      console.error(`[${requestId}] Upstream returned 502 in ${elapsedMs}ms.`);
      sendJsonResponse(res, 502, {
        error: 'UPSTREAM_UNAVAILABLE',
        message: 'Upstream knowledge service returned bad gateway.',
      });
      return;
    }

    if (upstreamResponse.status === 503) {
      console.error(`[${requestId}] Upstream returned 503 in ${elapsedMs}ms.`);
      sendJsonResponse(res, 503, {
        error: 'UPSTREAM_UNAVAILABLE',
        message: 'Upstream knowledge service is currently unavailable.',
      });
      return;
    }

    // Parse Upstream Response JSON
    let responseData: any;
    try {
      responseData = await upstreamResponse.json();
    } catch {
      console.error(`[${requestId}] Failed to parse JSON from upstream (status ${upstreamResponse.status}).`);
      sendJsonResponse(res, 502, {
        error: 'UPSTREAM_INVALID_RESPONSE',
        message: 'Invalid response format received from upstream service.',
      });
      return;
    }

    if (!upstreamResponse.ok) {
      const statusCode = upstreamResponse.status >= 400 && upstreamResponse.status < 500 ? upstreamResponse.status : 502;
      console.warn(`[${requestId}] Upstream returned non-ok status ${upstreamResponse.status} in ${elapsedMs}ms.`);
      sendJsonResponse(res, statusCode, {
        error: responseData?.error || 'UPSTREAM_ERROR',
        message: responseData?.message || 'Upstream request failed.',
      });
      return;
    }

    // Success: Return full JSON contract (status, answer, citations, evidence, grounding_validation, etc.)
    sendJsonResponse(res, 200, responseData);
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    const elapsedMs = Date.now() - startTime;

    const err = error as { name?: string; message?: string };
    if (err?.name === 'AbortError' || controller.signal.aborted) {
      console.error(`[${requestId}] Upstream request timed out after ${elapsedMs}ms.`);
      sendJsonResponse(res, 504, {
        error: 'UPSTREAM_TIMEOUT',
        message: 'Request to upstream service timed out.',
      });
      return;
    }

    console.error(`[${requestId}] Upstream network failure in ${elapsedMs}ms.`);
    sendJsonResponse(res, 502, {
      error: 'UPSTREAM_NETWORK_ERROR',
      message: 'Failed to communicate with knowledge service.',
    });
  }
}
