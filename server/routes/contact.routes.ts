/**
 * Contact-inbox routes: public submission, admin-only listing.
 */
import { Router } from 'express';
import { db } from '../db';
import { requireAdmin } from '../lib/auth';

const router = Router();

router.get('/', requireAdmin, (req, res) => {
  res.json(db.getContactMessages());
});

router.post('/', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All contact fields are required' });
  }
  const msg = db.createContactMessage(name, email, subject, message);
  res.json(msg);
});

export default router;
