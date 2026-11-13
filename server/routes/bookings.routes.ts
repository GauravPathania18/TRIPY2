/**
 * Booking routes: users create/list their bookings; admins see all.
 *
 * Status updates are allowed for admins (any status) and for the booking
 * owner (cancel only) — the owner path powers the Dashboard cancel button,
 * which previously called a non-existent endpoint.
 */
import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../lib/auth.js';
import { BookingStatus, UserRole } from '../../src/types.js';

const router = Router();

router.get('/', requireAuth, (req, res) => {
  const user = req.user!;
  if (user.role === UserRole.ADMIN) {
    res.json(db.getBookings());
  } else {
    res.json(db.getBookingsByUser(user.id));
  }
});

router.post('/', requireAuth, (req, res) => {
  const user = req.user!;
  const { packageId, travelers, totalCost, startDate, endDate } = req.body;
  if (!packageId || !travelers || !totalCost) {
    return res.status(400).json({ error: 'Package ID, travelers, and total cost are required' });
  }
  try {
    const booking = db.createBooking(
      user.id,
      packageId,
      travelers,
      totalCost,
      startDate || '',
      endDate || ''
    );
    db.createNotification(
      user.id,
      'Booking Confirmed 🎉',
      `Your tour package has been booked successfully for ${startDate || 'the requested dates'}.`
    );
    res.json(booking);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Booking failed' });
  }
});

router.put('/:id/status', requireAuth, (req, res) => {
  const user = req.user!;
  const booking = db.getBooking(req.params.id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }

  const isAdmin = user.role === UserRole.ADMIN;
  const isOwner = booking.user_id === user.id;
  if (!isAdmin && !isOwner) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { status } = req.body;
  if (!status || !Object.values(BookingStatus).includes(status)) {
    return res.status(400).json({ error: 'A valid booking status is required' });
  }
  // Non-admins (owners) may only cancel their own booking.
  if (!isAdmin && status !== BookingStatus.CANCELLED) {
    return res.status(403).json({ error: 'Only admins can change booking status' });
  }

  try {
    const updated = db.updateBookingStatus(req.params.id, status);
    db.createNotification(
      updated.user_id,
      'Booking Status Updated',
      `Your booking status has been updated to ${status}.`
    );
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update status' });
  }
});

export default router;
