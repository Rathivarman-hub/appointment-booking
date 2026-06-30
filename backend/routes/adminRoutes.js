import express from 'express';
import * as ctrl from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/users', ctrl.getAllUsers);
router.patch('/users/:id/toggle-status', ctrl.toggleUserStatus);
router.patch('/users/:id/role', ctrl.updateUserRole);
router.get('/dashboard', ctrl.getDashboardStats);
router.get('/reports', ctrl.getReports);

export default router;
