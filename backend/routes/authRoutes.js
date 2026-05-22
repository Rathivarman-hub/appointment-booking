import express from 'express';
import { body } from 'express-validator';
import * as ctrl from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';

const router = express.Router();

router.post('/register',
  [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    validate,
  ],
  ctrl.register
);

router.post('/verify-otp',
  [
    body('userId').notEmpty(), body('otp').notEmpty(),
    validate,
  ],
  ctrl.verifyOTP
);

router.post('/login',
  [
    body('email').isEmail(), body('password').notEmpty(),
    validate,
  ],
  ctrl.login
);

router.post('/forgot-password',
  [body('email').isEmail(), validate],
  ctrl.forgotPassword
);

router.post('/reset-password/:token',
  [body('password').isLength({ min: 6 }), validate],
  ctrl.resetPassword
);

router.get('/me', protect, ctrl.getMe);

export default router;
