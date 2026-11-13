/**
 * Auth routes: register, login, Google sign-in, session probe, profile.
 * All responses preserve the original API contract.
 */
import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../lib/auth.js';

const router = Router();

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }
  try {
    const user = db.createUser(name, email, password);
    // Simple token: "userId:role"
    const token = `${user.id}:${user.role}`;
    res.json({ user, token });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  const user = db.getUserByEmail(email);
  if (!user || !db.verifyPassword(user.id, password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = `${user.id}:${user.role}`;
  res.json({ user, token });
});

router.post('/google', (req, res) => {
  const { name, email, photoURL } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  try {
    const user = db.findOrCreateGoogleUser(name, email, photoURL);
    const token = `${user.id}:${user.role}`;
    res.json({ user, token });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Google authentication failed' });
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

router.put('/profile', requireAuth, (req, res) => {
  const { name, email, phone, profile_image } = req.body;
  try {
    const updated = db.updateProfile(req.user!.id, { name, email, phone, profile_image });
    res.json({ user: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Update failed' });
  }
});

export default router;
