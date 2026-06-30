import Booking from '../models/Booking.js';
import AppointmentType from '../models/AppointmentType.js';
import { sendBookingConfirmationEmail } from '../utils/emailService.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

// Helper: generate time slots
const generateSlots = (start, end, duration, buffer = 0) => {
  const slots = [];
  let [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  const endMins = eh * 60 + em;

  while (sh * 60 + sm + duration <= endMins) {
    const startStr = `${String(sh).padStart(2,'0')}:${String(sm).padStart(2,'0')}`;
    let em2 = sm + duration;
    let eh2 = sh + Math.floor(em2 / 60);
    em2 = em2 % 60;
    const endStr = `${String(eh2).padStart(2,'0')}:${String(em2).padStart(2,'0')}`;
    slots.push({ start: startStr, end: endStr });
    sm += duration + buffer;
    sh += Math.floor(sm / 60);
    sm = sm % 60;
  }
  return slots;
};

// @route   GET /api/bookings/slots/:appointmentTypeId
export const getAvailableSlots = async (req, res) => {
  try {
    const { appointmentTypeId } = req.params;
    const { date, resourceId } = req.query;

    const appt = await AppointmentType.findById(appointmentTypeId);
    if (!appt) return errorResponse(res, 'Appointment type not found', 404);

    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' }); // "Mon"
    const wh = appt.workingHours.find((w) => w.day === dayName && w.enabled);
    if (!wh) return successResponse(res, { slots: [] }, 'No working hours for this day');

    const allSlots = generateSlots(wh.start, wh.end, appt.duration, appt.bufferTime);

    // Existing bookings for that day
    const existing = await Booking.find({
      appointmentTypeId,
      resourceId: resourceId || null,
      date: new Date(date),
      status: { $in: ['pending', 'confirmed'] },
    });

    const bookedStarts = existing.reduce((acc, b) => {
      acc[b.slotTime.start] = (acc[b.slotTime.start] || 0) + 1;
      return acc;
    }, {});

    const availableSlots = allSlots.map((slot) => ({
      ...slot,
      available: (bookedStarts[slot.start] || 0) < appt.maxPerSlot,
      booked: bookedStarts[slot.start] || 0,
      capacity: appt.maxPerSlot,
    }));

    return successResponse(res, { slots: availableSlots, date, appt: { title: appt.title, duration: appt.duration } });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// @route   POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    const { appointmentTypeId, resourceId, date, slotTime, answers } = req.body;

    const appt = await AppointmentType.findById(appointmentTypeId);
    if (!appt) return errorResponse(res, 'Appointment type not found', 404);
    if (!appt.isPublished) return errorResponse(res, 'This appointment type is not available', 400);

    // Double-booking check
    const existing = await Booking.countDocuments({
      appointmentTypeId,
      resourceId: resourceId || null,
      date: new Date(date),
      'slotTime.start': slotTime.start,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (existing >= appt.maxPerSlot) return errorResponse(res, 'This slot is fully booked', 409);

    const booking = await Booking.create({
      appointmentTypeId,
      userId: req.user._id,
      resourceId: resourceId || null,
      date: new Date(date),
      slotTime,
      answers,
      status: appt.manualConfirmation ? 'pending' : 'confirmed',
      paymentStatus: appt.advancePayment.required ? 'pending' : 'not_required',
      paymentAmount: appt.advancePayment.amount,
    });

    if (!appt.manualConfirmation) {
      await sendBookingConfirmationEmail(req.user.email, booking);
    }

    return successResponse(res, { booking }, `Booking ${booking.status}!`, 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// @route   PUT /api/bookings/:id/confirm
export const confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'confirmed', confirmedAt: new Date() },
      { new: true }
    ).populate('userId', 'email fullName');

    if (!booking) return errorResponse(res, 'Booking not found', 404);
    await sendBookingConfirmationEmail(booking.userId.email, booking);
    return successResponse(res, { booking }, 'Booking confirmed');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// @route   PUT /api/bookings/:id/cancel
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return errorResponse(res, 'Booking not found', 404);
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role === 'customer')
      return errorResponse(res, 'Not authorized', 403);

    booking.status = 'cancelled';
    booking.cancelReason = req.body.reason || null;
    booking.cancelledAt = new Date();
    await booking.save();
    return successResponse(res, { booking }, 'Booking cancelled');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// @route   PUT /api/bookings/:id/reschedule
export const rescheduleBooking = async (req, res) => {
  try {
    const { date, slotTime } = req.body;
    const old = await Booking.findById(req.params.id);
    if (!old) return errorResponse(res, 'Booking not found', 404);

    const newBooking = await Booking.create({
      ...old.toObject(),
      _id: undefined,
      date: new Date(date),
      slotTime,
      status: 'confirmed',
      rescheduledFrom: old._id,
    });

    old.status = 'rescheduled';
    await old.save();

    return successResponse(res, { booking: newBooking }, 'Booking rescheduled');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// @route   GET /api/bookings/my
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('appointmentTypeId', 'title duration color')
      .sort({ createdAt: -1 });
    return successResponse(res, { bookings });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// @route   GET /api/bookings/all
export const getAllBookings = async (req, res) => {
  try {
    let query = {};
    
    // If the user is an organiser, only fetch bookings for appointments they created
    if (req.user.role === 'organiser') {
      const myAppointments = await AppointmentType.find({ createdBy: req.user._id }).select('_id');
      const appointmentIds = myAppointments.map(a => a._id);
      query = { appointmentTypeId: { $in: appointmentIds } };
    }
    // If admin, query remains {} to fetch all

    const bookings = await Booking.find(query)
      .populate('appointmentTypeId', 'title duration color')
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 });

    return successResponse(res, { bookings });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
