/**
 * Review routes: public reads (optionally filtered), authenticated writes.
 */
import { Router } from 'express';
import { db } from '../db';
import { requireAuth } from '../lib/auth';

const router = Router();

router.get('/', (req, res) => {
  const { destination_id, package_id } = req.query;
  let reviews = db.getReviews();
  if (destination_id) {
    reviews = reviews.filter((r) => r.destination_id === destination_id);
  }
  if (package_id) {
    reviews = reviews.filter((r) => r.package_id === package_id);
  }
  res.json(reviews);
});

router.post('/', requireAuth, (req, res) => {
  const user = req.user!;
  const { rating, comment, destination_id, package_id } = req.body;
  if (!rating || !comment) {
    return res.status(400).json({ error: 'Rating and comment are required' });
  }
  try {
    const review = db.createReview(
      user.id,
      user.name,
      Number(rating),
      comment,
      destination_id,
      package_id,
      user.profile_image
    );
    res.json(review);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create review' });
  }
});

export default router;
