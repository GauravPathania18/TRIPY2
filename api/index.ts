/**
 * Vercel serverless entry point.
 *
 * The app is loaded with a dynamic import() inside the handler:
 *   - works on every Node version (require(ESM) needs Node >= 22.12)
 *   - any failure while loading/evaluating the app becomes a readable
 *     JSON response instead of a bare FUNCTION_INVOCATION_FAILED
 *
 * The require.resolve() literal below is never executed for its side
 * effect — it exists so Vercel's file tracer statically sees the app
 * and ships it inside the lambda (require.resolve is tracer-visible).
 *
 * Static assets are served by Vercel's CDN from dist/ (see vercel.json).
 * Local development is unaffected — it still runs `server.ts` directly.
 */
import { createRequire } from 'node:module';

// import.meta.url on Vercel (native ESM); falls back to a cwd-based path when
// this file is bundled to CJS for local testing (esbuild empties import.meta).
const require = createRequire(
  (import.meta as any)?.url ?? process.cwd() + '/api/index.js'
);

// Trace-only: ensure ../server/app.js is included in the lambda bundle.
try {
  require.resolve('../server/app.js');
} catch {
  // Not resolvable at build time — the handler below will report it.
}

let appPromise: Promise<any> | null = null;

function loadApp(): Promise<any> {
  if (!appPromise) {
    appPromise = import('../server/app.js')
      .then((m: any) => m.createApp())
      .catch((err) => {
        appPromise = null; // let the next request retry
        throw err;
      });
  }
  return appPromise;
}

export default async function handler(req: any, res: any) {
  try {
    const app = await loadApp();
    app(req, res);
  } catch (err: any) {
    console.error('[api] Failed to load or handle:', err);
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Application failed to start',
        detail: String((err && err.stack) || err),
      });
    }
  }
}
