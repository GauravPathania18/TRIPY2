/**
 * Notification routes: per-user bulletin list + mark-as-read.
 */
import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../lib/auth.js';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  res.json(db.getNotificationsByUser(req.user!.id));
});

router.post('/:id/read', requireAuth, (req, res) => {
  db.markNotificationRead(req.params.id);
  res.json({ success: true });
});

export default router;
