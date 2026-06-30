import AppointmentType from '../models/AppointmentType.js';
import { successResponse, errorResponse } from '../utils/responseHelper.js';

// @route   POST /api/appointments
export const createAppointmentType = async (req, res) => {
  try {
    const appointment = await AppointmentType.create({ ...req.body, createdBy: req.user._id });
    return successResponse(res, { appointment }, 'Appointment type created', 201);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// @route   GET /api/appointments
export const getAllAppointmentTypes = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { isPublished: true };
    const appointments = await AppointmentType.find(filter).populate('createdBy', 'fullName email');
    return successResponse(res, { appointments });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// @route   GET /api/appointments/:id
export const getAppointmentTypeById = async (req, res) => {
  try {
    const appointment = await AppointmentType.findById(req.params.id).populate('resources', 'fullName email');
    if (!appointment) return errorResponse(res, 'Not found', 404);
    return successResponse(res, { appointment });
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// @route   PUT /api/appointments/:id
export const updateAppointmentType = async (req, res) => {
  try {
    const appointment = await AppointmentType.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!appointment) return errorResponse(res, 'Not found', 404);
    return successResponse(res, { appointment }, 'Updated successfully');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// @route   DELETE /api/appointments/:id
export const deleteAppointmentType = async (req, res) => {
  try {
    await AppointmentType.findByIdAndDelete(req.params.id);
    return successResponse(res, {}, 'Deleted successfully');
  } catch (err) {
    return errorResponse(res, err.message);
  }
};

// @route   PATCH /api/appointments/:id/publish
export const togglePublish = async (req, res) => {
  try {
    const appt = await AppointmentType.findById(req.params.id);
    if (!appt) return errorResponse(res, 'Not found', 404);
    appt.isPublished = !appt.isPublished;
    await appt.save();
    return successResponse(res, { isPublished: appt.isPublished }, `Appointment ${appt.isPublished ? 'published' : 'unpublished'}`);
  } catch (err) {
    return errorResponse(res, err.message);
  }
};
