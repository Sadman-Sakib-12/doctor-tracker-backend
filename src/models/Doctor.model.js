const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    hospital: {
      type: String,
      required: [true, 'Hospital is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
      match: [/^[+\d\s\-()]{7,20}$/, 'Please provide a valid phone number'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: patients belonging to this doctor
doctorSchema.virtual('patients', {
  ref: 'Patient',
  localField: '_id',
  foreignField: 'doctor',
});

// Indexes for fast search & filter
doctorSchema.index({ name: 'text', specialization: 'text', hospital: 'text' });
doctorSchema.index({ createdAt: -1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ hospital: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
