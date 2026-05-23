import User from '../models/User.js';
import { generateToken, generateOTP, generateResetToken } from '../utils/jwtHelper.js';
import { sendOTPEmail, sendPasswordResetEmail } from '../utils/emailService.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';
import crypto from 'crypto';

// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return errorResponse(res, 'Email already in use', 409);

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const user = await User.create({
      fullName, email, password,
      role: role === 'organiser' ? 'organiser' : 'customer',
      otp, otpExpiry,
    });

    // Send email without awaiting, to prevent the API from hanging if the SMTP server is slow/unreachable.
    sendOTPEmail(email, otp).catch(err => console.error('Background Email Error:', err));

    return successResponse(res, { userId: user._id }, 'Registered! Check your email for OTP.', 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// @route   POST /api/auth/verify-otp
export const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;
    const user = await User.findById(userId).select('+otp +otpExpiry');

    if (!user) return errorResponse(res, 'User not found', 404);
    if (user.isVerified) return errorResponse(res, 'Already verified', 400);
    if (user.otp !== otp) return errorResponse(res, 'Invalid OTP', 400);
    if (user.otpExpiry < new Date()) return errorResponse(res, 'OTP expired', 400);

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = generateToken(user._id, user.role);
    return successResponse(res, { token, user: { id: user._id, fullName: user.fullName, role: user.role } }, 'Account verified!');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password)))
      return errorResponse(res, 'Invalid credentials', 401);

    if (!user.isVerified) return errorResponse(res, 'Please verify your email first', 403);
    if (!user.isActive) return errorResponse(res, 'Account is deactivated', 403);

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);
    return successResponse(res, {
      token,
      user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role },
    }, 'Login successful');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return errorResponse(res, 'Email not found', 404);

    const resetToken = generateResetToken();
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(email, resetLink);

    return successResponse(res, {}, 'Password reset link sent to your email');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// @route   POST /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpiry');

    if (!user) return errorResponse(res, 'Invalid or expired reset token', 400);

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    return successResponse(res, {}, 'Password reset successful');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  return successResponse(res, { user: req.user }, 'Profile fetched');
};
