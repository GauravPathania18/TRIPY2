/**
 * Vercel serverless entry point — diagnostic build.
 *
 * Loads the Express app through createRequire inside a try/catch so that
 * ANY failure (missing file, module-load throw, wrong Node semantics)
 * comes back as a readable JSON body instead of FUNCTION_INVOCATION_FAILED.
 * require() literals are still static-analysis-visible to Vercel's tracer,
 * so the app files are included in the lambda.
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// What actually exists inside the lambda?
const probes: Record<string, string> = {};
for (const p of [
  '../server/app.js',
  '../server/app.ts',
  '../server/routes/index.js',
  '../server/db.js',
  '../firebase-applet-config.json',
  'express',
]) {
  try {
    probes[p] = require.resolve(p);
  } catch {
    probes[p] = 'MISSING';
  }
}

let createApp: any = null;
let loadError: string | null = null;
try {
  const mod = require('../server/app.js');
  createApp = mod.createApp || (mod.default && mod.default.createApp);
  if (typeof createApp !== 'function') {
    loadError = 'module loaded but createApp is ' + typeof createApp;
  }
} catch (err: any) {
  loadError = String((err && err.stack) || err);
}

export default async function handler(req: any, res: any) {
  if (!createApp) {
    res.status(500).json({ stage: 'module-load', probes, error: loadError });
    return;
  }
  try {
    const app = await createApp();
    app(req, res);
  } catch (err: any) {
    res.status(500).json({
      stage: 'createApp',
      probes,
      error: String((err && err.stack) || err),
    });
  }
}
