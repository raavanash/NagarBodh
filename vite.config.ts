import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import type { Plugin } from 'vite';
import { handleApiRequest } from './server/apiProxy.js';

function apiProxyPlugin(): Plugin {
  return {
    name: 'api-proxy-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/')) {
          const handled = await handleApiRequest(req, res);
          if (handled) return;
        }
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/')) {
          const handled = await handleApiRequest(req, res);
          if (handled) return;
        }
        next();
      });
    }
  };
}

// Config reloaded: 2026-09-08-gemini
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  for (const [key, val] of Object.entries(env)) {
    if (key && val) {
      process.env[key] = val;
    }
  }
  return {
    plugins: [react(), apiProxyPlugin()],
  };
});

