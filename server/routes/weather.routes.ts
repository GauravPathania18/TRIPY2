/**
 * Weather route — thin wrapper around the weather service chain.
 */
import { Router } from 'express';
import { getWeather } from '../services/weather.service';

const router = Router();

router.get('/', async (req, res) => {
  const city = req.query.city as string | undefined;
  const latStr = req.query.lat as string | undefined;
  const lonStr = req.query.lon as string | undefined;

  if (!city && (!latStr || !lonStr)) {
    return res.status(400).json({ error: 'City name or coordinates (lat/lon) are required' });
  }

  const lat = latStr !== undefined ? parseFloat(latStr) : undefined;
  const lon = lonStr !== undefined ? parseFloat(lonStr) : undefined;

  const result = await getWeather({ city, lat, lon });
  res.json(result);
});

export default router;
