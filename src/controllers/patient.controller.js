const Patient = require('../models/Patient.model');
const Doctor = require('../models/Doctor.model');
const APIFeatures = require('../utils/apiFeatures');

/**
 * @route  POST /api/patients
 * @desc   Create a new patient under a doctor
 * @access Private
 */
const createPatient = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.body.doctor);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const patient = await Patient.create(req.body);
    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  GET /api/patients
 * @desc   List all patients with search, filter, pagination
 * @access Private
 * Query params: search, condition, gender, doctor, startDate, endDate, page, limit, sort
 */
const getPatients = async (req, res, next) => {
  try {
    const features = new APIFeatures(
      Patient.find().populate('doctor', 'name specialization hospital'),
      req.query
    )
      .search(['name', 'condition', 'address'])
      .filter()
      .sort()
      .paginate();

    const [patients, total] = await Promise.all([
      features.query.select('-__v').lean(),
      buildCountQuery(req.query),
    ]);

    res.json({
      success: true,
      total,
      page: features._page,
      limit: features._limit,
      totalPages: Math.ceil(total / features._limit),
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  GET /api/patients/:id
 * @desc   Get a single patient
 * @access Private
 */
const getPatient = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('doctor', 'name specialization hospital email phone')
      .select('-__v')
      .lean();

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  PUT /api/patients/:id
 * @desc   Update a patient
 * @access Private
 */
const updatePatient = async (req, res, next) => {
  try {
    // Prevent changing the doctor field directly without validation
    const updates = { ...req.body };
    if (updates.doctor) {
      const doctor = await Doctor.findById(updates.doctor);
      if (!doctor) {
        return res.status(404).json({ success: false, message: 'Doctor not found' });
      }
    }

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('doctor', 'name specialization hospital')
      .select('-__v');

    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  DELETE /api/patients/:id
 * @desc   Delete a patient
 * @access Private
 */
const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }
    res.json({ success: true, message: 'Patient deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ── helpers ───────────────────────────────────────────────────────────────────
async function buildCountQuery(qs) {
  const filter = {};
  const excluded = ['page', 'limit', 'sort', 'search', 'startDate', 'endDate'];
  Object.keys(qs).forEach((k) => {
    if (!excluded.includes(k)) filter[k] = qs[k];
  });

  if (qs.startDate || qs.endDate) {
    filter.createdAt = {};
    if (qs.startDate) filter.createdAt.$gte = new Date(qs.startDate);
    if (qs.endDate) {
      const end = new Date(qs.endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  if (qs.search) {
    const regex = { $regex: qs.search, $options: 'i' };
    const searchFilter = {
      $or: [{ name: regex }, { condition: regex }, { address: regex }],
    };
    return Patient.countDocuments({ ...filter, ...searchFilter });
  }

  return Patient.countDocuments(filter);
}

module.exports = { createPatient, getPatients, getPatient, updatePatient, deletePatient };
