import express from 'express';
import * as ctrl from '../controllers/bookingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my', protect, ctrl.getMyBookings);
router.get('/all', protect, authorize('admin', 'organiser'), ctrl.getAllBookings);
router.get('/slots/:appointmentTypeId', protect, ctrl.getAvailableSlots);
router.post('/', protect, ctrl.createBooking);
router.put('/:id/confirm', protect, authorize('organiser', 'admin'), ctrl.confirmBooking);
router.put('/:id/cancel', protect, ctrl.cancelBooking);
router.put('/:id/reschedule', protect, ctrl.rescheduleBooking);

export default router;
