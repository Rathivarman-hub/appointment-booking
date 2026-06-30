import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  label: { type: String, required: true },
  type: { type: String, enum: ['text', 'radio', 'checkbox', 'select'], default: 'text' },
  options: [String],
  required: { type: Boolean, default: false },
});

const workingHoursSchema = new mongoose.Schema({
  day: { type: String, enum: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'], required: true },
  start: { type: String, required: true }, // "09:00"
  end:   { type: String, required: true }, // "17:00"
  enabled: { type: Boolean, default: true },
});

const appointmentTypeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: { type: String, trim: true },
    duration: {
      type: Number, // minutes
      required: [true, 'Duration is required'],
    },
    slotType: {
      type: String,
      enum: ['fixed', 'rolling', 'range'],
      default: 'fixed',
    },
    workingHours: [workingHoursSchema],
    resources: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    maxPerSlot: {
      type: Number,
      default: 1,
    },
    advancePayment: {
      required: { type: Boolean, default: false },
      amount:   { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
    },
    manualConfirmation: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    questions: [questionSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    color: { type: String, default: '#4f46e5' },
    bufferTime: { type: Number, default: 0 }, // minutes between slots
  },
  { timestamps: true }
);

export default mongoose.model('AppointmentType', appointmentTypeSchema);
