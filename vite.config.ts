import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import chatHandler from './api/chat';
import chatV2Handler from './api/chat-v2';
import chatV2StreamHandler from './api/chat-v2/stream';
import healthHandler from './api/health';
import conversationHandler from './api/conversations/[conversationId]';

function apiDevMiddleware(): Plugin {
  return {
    name: 'api-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';

        if (url === '/api/chat-v2/stream') {
          try {
            await chatV2StreamHandler(req as any, res as any);
          } catch (err) {
            console.error('API /api/chat-v2/stream error:', err);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'INTERNAL_SERVER_ERROR' }));
            }
          }
          return;
        }

        if (url === '/api/chat-v2') {
          try {
            await chatV2Handler(req as any, res as any);
          } catch (err) {
            console.error('API /api/chat-v2 error:', err);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'INTERNAL_SERVER_ERROR' }));
            }
          }
          return;
        }

        if (url === '/api/chat') {
          try {
            await chatHandler(req as any, res as any);
          } catch (err) {
            console.error('API /api/chat error:', err);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'INTERNAL_SERVER_ERROR' }));
            }
          }
          return;
        }

        if (url === '/api/health') {
          try {
            await healthHandler(req as any, res as any);
          } catch (err) {
            console.error('API /api/health error:', err);
            if (!res.headersSent) {
              res.statusCode = 503;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ status: 'error', message: 'Health check failed' }));
            }
          }
          return;
        }

        if (url.startsWith('/api/conversations/')) {
          try {
            const match = url.match(/\/api\/conversations\/([^/]+)/);
            const convId = match ? match[1] : undefined;
            await conversationHandler(req as any, res as any, convId);
          } catch (err) {
            console.error('API /api/conversations error:', err);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'INTERNAL_SERVER_ERROR' }));
            }
          }
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiDevMiddleware()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
