import { Response, NextFunction } from 'express';
import Patient from '../models/Patient.model';
import Doctor from '../models/Doctor.model';
import APIFeatures from '../utils/apiFeatures';
import { AuthRequest } from '../types';
import { IPatient } from '../models/Patient.model';

// POST /api/patients  (also used by POST /api/doctors/:id/patients)
export const createPatient = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const doctor = await Doctor.findById(req.body.doctor);
    if (!doctor) {
      res.status(404).json({ success: false, message: 'Doctor not found' });
      return;
    }
    const patient = await Patient.create(req.body);
    res.status(201).json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

// GET /api/patients
export const getPatients = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const features = new APIFeatures<IPatient>(
      Patient.find().populate('doctor', 'name specialization hospital'),
      req.query as Record<string, string>
    )
      .search(['name', 'condition', 'address'])
      .filter()
      .sort()
      .paginate();

    const [patients, total] = await Promise.all([
      features.query.select('-__v').lean(),
      buildCountQuery(req.query as Record<string, string>),
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

// GET /api/patients/:id
export const getPatient = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('doctor', 'name specialization hospital email phone')
      .select('-__v')
      .lean();

    if (!patient) {
      res.status(404).json({ success: false, message: 'Patient not found' });
      return;
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

// PUT /api/patients/:id
export const updatePatient = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updates = { ...req.body } as Partial<IPatient>;

    if (updates.doctor) {
      const doctor = await Doctor.findById(updates.doctor);
      if (!doctor) {
        res.status(404).json({ success: false, message: 'Doctor not found' });
        return;
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
      res.status(404).json({ success: false, message: 'Patient not found' });
      return;
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/patients/:id
export const deletePatient = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) {
      res.status(404).json({ success: false, message: 'Patient not found' });
      return;
    }
    res.json({ success: true, message: 'Patient deleted successfully' });
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
    return Patient.countDocuments({
      ...filter,
      $or: [{ name: regex }, { condition: regex }, { address: regex }],
    });
  }

  return Patient.countDocuments(filter);
}
