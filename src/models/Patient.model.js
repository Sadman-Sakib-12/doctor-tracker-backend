const mongoose = require('mongoose');

const CONDITION_ENUM = [
  'stable',
  'critical',
  'recovering',
  'chronic',
  'discharged',
  'under observation',
];

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: [0, 'Age cannot be negative'],
      max: [150, 'Age seems invalid'],
    },
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: ['male', 'female', 'other'],
    },
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      enum: CONDITION_ENUM,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[+\d\s\-()]{7,20}$/, 'Please provide a valid phone number'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    address: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters'],
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor reference is required'],
    },
    admittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Indexes for search, filter & pagination
patientSchema.index({ name: 'text', condition: 'text', address: 'text' });
patientSchema.index({ doctor: 1 });
patientSchema.index({ condition: 1 });
patientSchema.index({ createdAt: -1 });
patientSchema.index({ admittedAt: -1 });

module.exports = mongoose.model('Patient', patientSchema);
