/**
 * API router — mounts every feature router under /api.
 */
import { Router } from 'express';

import authRoutes from './auth.routes.js';
import blogsRoutes from './blogs.routes.js';
import bookingsRoutes from './bookings.routes.js';
import contactRoutes from './contact.routes.js';
import destinationsRoutes from './destinations.routes.js';
import favoritesRoutes from './favorites.routes.js';
import firebaseConfigRoutes from './firebase-config.routes.js';
import geminiRoutes from './gemini.routes.js';
import notificationsRoutes from './notifications.routes.js';
import packagesRoutes from './packages.routes.js';
import proxyRoutes from './proxy.routes.js';
import reviewsRoutes from './reviews.routes.js';
import tripsRoutes from './trips.routes.js';
import weatherRoutes from './weather.routes.js';

const router = Router();

router.use('/firebase-config', firebaseConfigRoutes);
router.use('/auth', authRoutes);
router.use('/destinations', destinationsRoutes);
router.use('/packages', packagesRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/reviews', reviewsRoutes);
router.use('/blogs', blogsRoutes);
router.use('/trips', tripsRoutes);
router.use('/favorites', favoritesRoutes);
router.use('/contact', contactRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/proxy', proxyRoutes);
router.use('/weather', weatherRoutes);
router.use('/gemini', geminiRoutes);

export default router;
