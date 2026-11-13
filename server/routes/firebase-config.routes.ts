/**
 * Firebase client-config route.
 *
 * The static firebase-applet-config.json ships without the web API key;
 * the real key is injected here from the environment so it never lands
 * in the client bundle.
 *
 * The config is imported statically (not read from disk at request time)
 * so it is baked into serverless bundles, where cwd files may not exist.
 */
import { Router } from 'express';
import { env } from '../config/env.js';
import firebaseAppConfig from '../../firebase-applet-config.json' with { type: 'json' };

const router = Router();

router.get('/', (req, res) => {
  try {
    // Inject the API key from environment variable (undefined key is dropped
    // from the JSON payload, matching the original behavior).
    res.json({
      ...firebaseAppConfig,
      apiKey: env.firebaseApiKey,
    });
  } catch (err: any) {
    console.error('Failed to retrieve Firebase configuration:', err);
    res.status(500).json({ error: 'Failed to retrieve firebase client configuration' });
  }
});

export default router;
