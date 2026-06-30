import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    appointmentTypeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AppointmentType',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    date: {
      type: Date,
      required: [true, 'Booking date is required'],
    },
    slotTime: {
      start: { type: String, required: true }, // "10:00"
      end:   { type: String, required: true }, // "10:30"
    },
    capacity: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'rescheduled'],
      default: 'pending',
    },
    answers: [
      {
        questionId: String,
        label:      String,
        answer:     mongoose.Schema.Types.Mixed,
      },
    ],
    paymentStatus: {
      type: String,
      enum: ['not_required', 'pending', 'paid', 'refunded'],
      default: 'not_required',
    },
    paymentAmount:  { type: Number, default: 0 },
    paymentId:      { type: String, default: null },
    notes:          { type: String, default: null },
    cancelReason:   { type: String, default: null },
    rescheduledFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
    confirmedAt:  { type: Date, default: null },
    cancelledAt:  { type: Date, default: null },
    completedAt:  { type: Date, default: null },
  },
  { timestamps: true }
);

// Index for slot conflict detection
bookingSchema.index({ appointmentTypeId: 1, resourceId: 1, date: 1, 'slotTime.start': 1 });

export default mongoose.model('Booking', bookingSchema);
