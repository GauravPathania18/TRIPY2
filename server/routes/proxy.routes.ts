/**
 * Outbound proxy routes — keeps third-party endpoints off the client.
 */
import { Router } from 'express';

const router = Router();

/** Country dataset used by the 3D globe (6s timeout, 502 on failure). */
router.get('/countries', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const response = await fetch('https://restcountries.com/v3.1/all', {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    res.json(data);
  } catch (err: any) {
    console.log('Geocoding server proxy fetch failed: ', err.message);
    res.status(502).json({ error: 'Failed to fetch countries from source API' });
  }
});

export default router;
