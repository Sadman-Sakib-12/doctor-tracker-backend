const Doctor = require('../models/Doctor.model');
const Patient = require('../models/Patient.model');
const APIFeatures = require('../utils/apiFeatures');

/**
 * @route  POST /api/doctors
 * @desc   Create a new doctor
 * @access Private
 */
const createDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  GET /api/doctors
 * @desc   List doctors with search, filter, sort, pagination
 * @access Private
 * Query params: search, specialization, hospital, startDate, endDate, page, limit, sort
 */
const getDoctors = async (req, res, next) => {
  try {
    const features = new APIFeatures(Doctor.find(), req.query)
      .search(['name', 'specialization', 'hospital', 'email'])
      .filter()
      .sort()
      .paginate();

    const [doctors, total] = await Promise.all([
      features.query.select('-__v').lean(),
      buildCountQuery(req.query),
    ]);

    res.json({
      success: true,
      total,
      page: features._page,
      limit: features._limit,
      totalPages: Math.ceil(total / features._limit),
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  GET /api/doctors/:id
 * @desc   Get single doctor
 * @access Private
 */
const getDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-__v').lean();
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  PUT /api/doctors/:id
 * @desc   Update a doctor
 * @access Private
 */
const updateDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    res.json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  DELETE /api/doctors/:id
 * @desc   Delete a doctor and their patients
 * @access Private
 */
const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }
    // Cascade-delete all patients of this doctor
    await Patient.deleteMany({ doctor: req.params.id });
    res.json({ success: true, message: 'Doctor and their patients deleted' });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  GET /api/doctors/:id/patients
 * @desc   Get patients of a specific doctor (paginated)
 * @access Private
 */
const getDoctorPatients = async (req, res, next) => {
  try {
    const features = new APIFeatures(
      Patient.find({ doctor: req.params.id }),
      req.query
    )
      .search(['name', 'condition'])
      .filter()
      .sort()
      .paginate();

    const [patients, total] = await Promise.all([
      features.query.select('-__v').lean(),
      Patient.countDocuments({ doctor: req.params.id }),
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

// ── helpers ───────────────────────────────────────────────────────────────────

/**
 * Rebuild a count query matching the same filters as getDoctors
 * (without search, sort, pagination).
 */
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
      $or: [
        { name: regex },
        { specialization: regex },
        { hospital: regex },
        { email: regex },
      ],
    };
    return Doctor.countDocuments({ ...filter, ...searchFilter });
  }

  return Doctor.countDocuments(filter);
}

module.exports = {
  createDoctor,
  getDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorPatients,
};
