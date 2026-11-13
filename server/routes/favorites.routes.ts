/**
 * Favorite routes: per-user destination bookmarks with toggle semantics.
 */
import { Router } from 'express';
import { db } from '../db';
import { requireAuth } from '../lib/auth';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  res.json(db.getFavoritesByUser(req.user!.id));
});

router.post('/toggle', requireAuth, (req, res) => {
  const { destinationId } = req.body;
  if (!destinationId) {
    return res.status(400).json({ error: 'Destination ID is required' });
  }
  const isFavorited = db.toggleFavorite(req.user!.id, destinationId);
  res.json({ favorited: isFavorited });
});

export default router;
