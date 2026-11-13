/**
 * Destination routes: public catalogue + admin creation.
 */
import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../lib/auth.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(db.getDestinations());
});

router.get('/:id', (req, res) => {
  const destination = db.getDestination(req.params.id);
  if (!destination) {
    return res.status(404).json({ error: 'Destination not found' });
  }
  res.json(destination);
});

router.post('/', requireAdmin, (req, res) => {
  try {
    const newDest = db.createDestination(req.body);
    res.json(newDest);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create destination' });
  }
});

export default router;
