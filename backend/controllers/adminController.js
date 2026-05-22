import User from '../models/User.js';
import Booking from '../models/Booking.js';
import AppointmentType from '../models/AppointmentType.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

// @route   GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await User.countDocuments(filter);
    return successResponse(res, { users, total, page: Number(page) });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// @route   PATCH /api/admin/users/:id/toggle-status
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return errorResponse(res, 'User not found', 404);
    user.isActive = !user.isActive;
    await user.save();
    return successResponse(res, { isActive: user.isActive }, `User ${user.isActive ? 'activated' : 'deactivated'}`);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// @route   PATCH /api/admin/users/:id/role
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['customer', 'organiser', 'admin'].includes(role))
      return errorResponse(res, 'Invalid role', 400);
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return errorResponse(res, 'User not found', 404);
    return successResponse(res, { user }, 'Role updated');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// @route   GET /api/admin/dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalBookings, confirmedBookings, pendingBookings, cancelledBookings, totalAppointments] =
      await Promise.all([
        User.countDocuments(),
        Booking.countDocuments(),
        Booking.countDocuments({ status: 'confirmed' }),
        Booking.countDocuments({ status: 'pending' }),
        Booking.countDocuments({ status: 'cancelled' }),
        AppointmentType.countDocuments(),
      ]);

    // Recent 7 days bookings trend
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end   = new Date(d.setHours(23, 59, 59, 999));
      const count = await Booking.countDocuments({ createdAt: { $gte: start, $lte: end } });
      last7Days.push({ date: start.toISOString().split('T')[0], count });
    }

    return successResponse(res, {
      totalUsers, totalBookings, confirmedBookings, pendingBookings,
      cancelledBookings, totalAppointments, last7Days,
    });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// @route   GET /api/admin/reports
export const getReports = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = {};
    if (from && to) filter.createdAt = { $gte: new Date(from), $lte: new Date(to) };

    const bookings = await Booking.find(filter)
      .populate('userId', 'fullName email')
      .populate('appointmentTypeId', 'title')
      .sort({ createdAt: -1 });

    return successResponse(res, { bookings, total: bookings.length });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
