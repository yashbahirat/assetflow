import { Router } from 'express';
import { createBooking, getAssetBookings, getAllBookings, cancelBooking, rescheduleBooking } from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All authenticated users can view and create bookings (including Dept Head on behalf of dept)
router.get('/', authenticate, getAllBookings);
router.post('/', authenticate, createBooking);
router.get('/assets/:id', authenticate, getAssetBookings);

// Cancel/reschedule: ownership enforced in controller
router.put('/:id/cancel', authenticate, cancelBooking);
router.put('/:id/reschedule', authenticate, rescheduleBooking);

export default router;
