/**
 * Vercel serverless entry point.
 *
 * Wraps the shared Express app (created once per warm lambda) and hands
 * every /api/* request to it. Static frontend assets are served by
 * Vercel's CDN from dist/ (see vercel.json), so express.static inside
 * the app becomes a harmless no-op in this environment.
 *
 * Local development is unaffected — it still runs `server.ts` directly.
 */
import type express from 'express';
import { createApp } from '../server/app';

// Cache the app across invocations (warm lambdas reuse it).
let appPromise: Promise<express.Express> | null = null;

function getApp(): Promise<express.Express> {
  if (!appPromise) {
    appPromise = createApp();
  }
  return appPromise;
}

export default async function handler(req: any, res: any) {
  const app = await getApp();
  app(req, res);
}
