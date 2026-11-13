/**
 * Blog routes: public reads, admin creation, authenticated comments.
 */
import { Router } from 'express';
import { db } from '../db.js';
import { requireAdmin, requireAuth } from '../lib/auth.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(db.getBlogs());
});

router.get('/:id', (req, res) => {
  const blog = db.getBlog(req.params.id);
  if (!blog) {
    return res.status(404).json({ error: 'Blog not found' });
  }
  res.json(blog);
});

router.post('/', requireAdmin, (req, res) => {
  const user = req.user!;
  try {
    const newBlog = db.createBlog({
      ...req.body,
      author_id: user.id,
      author_name: user.name,
    });
    res.json(newBlog);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to create blog' });
  }
});

router.get('/:id/comments', (req, res) => {
  res.json(db.getCommentsByBlog(req.params.id));
});

router.post('/:id/comments', requireAuth, (req, res) => {
  const user = req.user!;
  const { comment } = req.body;
  if (!comment) {
    return res.status(400).json({ error: 'Comment text is required' });
  }
  try {
    const newComment = db.createComment(req.params.id, user.id, user.name, comment);
    res.json(newComment);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to add comment' });
  }
});

export default router;
