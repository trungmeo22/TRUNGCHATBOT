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
 * GET /api/health
 * Proxies to upstream ${KNOWLEDGE_API_URL}/v2/health with server-side API Key
 */
export default async function handler(
  req: IncomingMessage & { method?: string; headers: Record<string, string | string[] | undefined> },
  res: ServerResponse & { status?: (code: number) => any; json?: (data: any) => any }
) {
  const incomingRequestId = Array.isArray(req.headers['x-request-id'])
    ? req.headers['x-request-id'][0]
    : req.headers['x-request-id'];
  const requestId = incomingRequestId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `req-health-${Date.now()}`);

  res.setHeader('X-Request-ID', requestId);

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    sendJsonResponse(res, 405, {
      error: 'METHOD_NOT_ALLOWED',
      message: 'Method not allowed. Only GET is accepted.',
    });
    return;
  }

  const knowledgeApiUrl = process.env.KNOWLEDGE_API_URL?.trim();
  const knowledgeApiKey = process.env.KNOWLEDGE_API_KEY?.trim();

  if (!knowledgeApiUrl || !knowledgeApiKey) {
    sendJsonResponse(res, 503, {
      status: 'error',
      error: 'CONFIG_MISSING',
      message: 'Knowledge service configuration is missing on the server.',
    });
    return;
  }

  const upstreamHealthUrl = `${knowledgeApiUrl.replace(/\/+$/, '')}/v2/health`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    const upstreamRes = await fetch(upstreamHealthUrl, {
      method: 'GET',
      headers: {
        'X-API-Key': knowledgeApiKey,
        'X-Request-ID': requestId,
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (upstreamRes.ok) {
      let upstreamData: any = {};
      try {
        upstreamData = await upstreamRes.json();
      } catch {
        upstreamData = { status: 'ready' };
      }
      sendJsonResponse(res, 200, {
        status: 'ready',
        ...upstreamData,
      });
    } else {
      sendJsonResponse(res, upstreamRes.status === 401 || upstreamRes.status === 403 ? 502 : 503, {
        status: 'error',
        statusCode: upstreamRes.status,
        message: 'Upstream health check failed',
      });
    }
  } catch (err) {
    clearTimeout(timeoutId);
    sendJsonResponse(res, 503, {
      status: 'error',
      message: 'Cannot connect to upstream Knowledge Engine',
    });
  }
}
