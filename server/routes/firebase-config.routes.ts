/**
 * Firebase client-config route.
 *
 * The static firebase-applet-config.json ships without the web API key;
 * the real key is injected here from the environment so it never lands
 * in the client bundle.
 */
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';

const router = Router();

router.get('/', (req, res) => {
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    // Inject the API key from environment variable (undefined key is dropped
    // from the JSON payload, matching the original behavior).
    res.json({
      ...configData,
      apiKey: env.firebaseApiKey,
    });
  } catch (err: any) {
    console.error('Failed to retrieve Firebase configuration:', err);
    res.status(500).json({ error: 'Failed to retrieve firebase client configuration' });
  }
});

export default router;
