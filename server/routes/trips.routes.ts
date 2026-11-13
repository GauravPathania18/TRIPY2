/**
 * Saved-trip routes: authenticated CRUD for AI-generated itineraries.
 */
import { Router } from 'express';
import { db } from '../db';
import { requireAuth } from '../lib/auth';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  res.json(db.getSavedTripsByUser(req.user!.id));
});

router.post('/', requireAuth, (req, res) => {
  const { name, itinerary, budget, destination_id, start_date, end_date } = req.body;
  if (!name || !itinerary) {
    return res.status(400).json({ error: 'Trip name and itinerary are required' });
  }
  try {
    const trip = db.createSavedTrip(
      req.user!.id,
      name,
      itinerary,
      Number(budget) || 0,
      destination_id,
      start_date,
      end_date
    );
    res.json(trip);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to save trip' });
  }
});

router.delete('/:id', requireAuth, (req, res) => {
  const success = db.deleteSavedTrip(req.params.id, req.user!.id);
  if (!success) {
    return res.status(404).json({ error: 'Trip not found' });
  }
  res.json({ success: true });
});

export default router;
