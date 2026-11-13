/**
 * Vercel serverless entry point.
 *
 * Wraps the shared Express app (created once per warm lambda) and hands
 * every /api/* request to it. Static frontend assets are served by
 * Vercel's CDN from dist/ (see vercel.json), so express.static inside
 * the app becomes a harmless no-op in this environment.
 *
 * The app is imported lazily inside the handler so that any module-load
 * failure surfaces as a readable 500 instead of a bare
 * FUNCTION_INVOCATION_FAILED with no detail.
 *
 * Local development is unaffected — it still runs `server.ts` directly.
 */
import type express from 'express';

let appPromise: Promise<express.Express> | null = null;

function getApp(): Promise<express.Express> {
  if (!appPromise) {
    appPromise = import('../server/app')
      .then((m) => m.createApp())
      .catch((err) => {
        appPromise = null; // allow the next request to retry
        throw err;
      });
  }
  return appPromise;
}

export default async function handler(req: any, res: any) {
  try {
    const app = await getApp();
    app(req, res);
  } catch (err: any) {
    console.error('[api] Failed to start or handle request:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Application failed to start',
        detail: String(err?.message || err),
      });
    }
  }
}
