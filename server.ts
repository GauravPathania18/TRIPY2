/**
 * Trippy server entrypoint.
 *
 * Kept intentionally thin: environment loads first (before any module
 * reads process.env), then the Express app is assembled by
 * server/app.ts and started.
 *
 * Build scripts (dev: tsx server.ts / build: esbuild server.ts) rely on
 * this file staying at the project root.
 */
import './server/config/env';
import { createApp } from './server/app';
import { env } from './server/config/env';

async function startServer() {
  const app = await createApp();
  app.listen(env.port, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${env.port}`);
  });
}

startServer();
