import { Router } from 'express';
import { createBooking, getAssetBookings } from '../controllers/bookingController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createBooking);
router.get('/assets/:id', authenticate, getAssetBookings);

export default router;
