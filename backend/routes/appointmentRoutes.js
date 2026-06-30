import express from 'express';
import * as ctrl from '../controllers/appointmentController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, ctrl.getAllAppointmentTypes);
router.get('/:id', protect, ctrl.getAppointmentTypeById);
router.post('/', protect, authorize('organiser', 'admin'), ctrl.createAppointmentType);
router.put('/:id', protect, authorize('organiser', 'admin'), ctrl.updateAppointmentType);
router.delete('/:id', protect, authorize('organiser', 'admin'), ctrl.deleteAppointmentType);
router.patch('/:id/publish', protect, authorize('organiser', 'admin'), ctrl.togglePublish);

export default router;
