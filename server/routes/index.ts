/**
 * API router — mounts every feature router under /api.
 */
import { Router } from 'express';

import authRoutes from './auth.routes';
import blogsRoutes from './blogs.routes';
import bookingsRoutes from './bookings.routes';
import contactRoutes from './contact.routes';
import destinationsRoutes from './destinations.routes';
import favoritesRoutes from './favorites.routes';
import firebaseConfigRoutes from './firebase-config.routes';
import geminiRoutes from './gemini.routes';
import notificationsRoutes from './notifications.routes';
import packagesRoutes from './packages.routes';
import proxyRoutes from './proxy.routes';
import reviewsRoutes from './reviews.routes';
import tripsRoutes from './trips.routes';
import weatherRoutes from './weather.routes';

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
