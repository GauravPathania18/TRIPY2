/**
 * Tour-package routes: public catalogue + admin creation.
 */
import { Router } from 'express';
import { db } from '../db';
import { requireAdmin } from '../lib/auth';

const router = Router();

router.get('/', (req, res) => {
  res.json(db.getPackages());
});

router.get('/:id', (req, res) => {
  const pkg = db.getPackage(req.params.id);
  if (!pkg) {
    return res.status(404).json({ error: 'Package not found' });
  }
  res.json(pkg);
});

router.post('/', requireAdmin, (req, res) => {
  try {
    const newPkg = db.createPackage(req.body);
    res.json(newPkg);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create package' });
  }
});

export default router;
