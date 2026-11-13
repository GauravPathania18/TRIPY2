/**
 * Express application factory.
 *
 * Creates the app with CORS/JSON middleware, mounts the /api router and
 * wires up asset serving:
 *   - development : Vite dev middleware (HMR, SPA fallback)
 *   - production  : static dist/ build with SPA catch-all
 */
import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { env } from './config/env';
import apiRoutes from './routes/index';

export async function createApp(): Promise<express.Express> {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Feature routers
  app.use('/api', apiRoutes);

  // Frontend assets
  if (!env.isProduction) {
    // Dynamic import: Vite is a dev-only dependency. Loading it lazily keeps
    // the production/serverless bundle from ever requiring it at runtime.
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      // On Vercel the CDN serves static assets; dist/ may not exist inside
      // the function bundle, so only fall back to index.html when present.
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).json({ error: 'Not found' });
      }
    });
  }

  return app;
}
