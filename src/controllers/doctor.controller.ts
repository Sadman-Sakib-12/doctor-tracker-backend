import { Response, NextFunction } from 'express';
import Doctor, { IDoctor } from '../models/Doctor.model';
import Patient from '../models/Patient.model';
import APIFeatures from '../utils/apiFeatures';
import { AuthRequest } from '../types';

// POST /api/doctors
export const createDoctor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const doctor = await Doctor.create({ ...req.body, createdBy: req.user?._id });
    res.status(201).json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

// GET /api/doctors
export const getDoctors = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const features = new APIFeatures<IDoctor>(
      Doctor.find(),
      req.query as Record<string, string>
    )
      .search(['name', 'specialization', 'hospital', 'email'])
      .filter()
      .sort()
      .paginate();

    const [doctors, total] = await Promise.all([
      features.query.select('-__v').lean(),
      buildCountQuery(req.query as Record<string, string>),
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

// GET /api/doctors/:id
export const getDoctor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const doctor = await Doctor.findById(req.params.id).select('-__v').lean();
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }
    res.json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

// PUT /api/doctors/:id
export const updateDoctor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-__v');

    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }
    res.json({ success: true, data: doctor });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/doctors/:id
export const deleteDoctor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }
    // Cascade-delete all patients of this doctor
    await Patient.deleteMany({ doctor: req.params.id });
    res.json({ success: true, message: 'Doctor and their patients deleted' });
  } catch (error) {
    next(error);
  }
};

// GET /api/doctors/:id/patients
export const getDoctorPatients = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const features = new APIFeatures(
      Patient.find({ doctor: req.params.id }),
      req.query as Record<string, string>
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

// ── helper ────────────────────────────────────────────────────────────────────
async function buildCountQuery(qs: Record<string, string>): Promise<number> {
  const filter: Record<string, unknown> = {};
  const excluded = ['page', 'limit', 'sort', 'search', 'startDate', 'endDate'];
  Object.keys(qs).forEach((k) => {
    if (!excluded.includes(k)) filter[k] = qs[k];
  });

  if (qs.startDate || qs.endDate) {
    const dateFilter: Record<string, Date> = {};
    if (qs.startDate) dateFilter.$gte = new Date(qs.startDate);
    if (qs.endDate) {
      const end = new Date(qs.endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }
    filter.createdAt = dateFilter;
  }

  if (qs.search) {
    const regex = { $regex: qs.search, $options: 'i' };
    return Doctor.countDocuments({
      ...filter,
      $or: [
        { name: regex },
        { specialization: regex },
        { hospital: regex },
        { email: regex },
      ],
    });
  }

  return Doctor.countDocuments(filter);
}
