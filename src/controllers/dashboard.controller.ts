import { Response, NextFunction } from 'express';
import Doctor from '../models/Doctor.model';
import Patient from '../models/Patient.model';
import { AuthRequest } from '../types';

// GET /api/dashboard/stats
export const getStats = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const [
      totalDoctors,
      totalPatients,
      patientsPerDoctor,
      conditionBreakdown,
      genderBreakdown,
      monthlyPatients,
      topSpecializations,
    ] = await Promise.all([
      Doctor.countDocuments(),
      Patient.countDocuments(),

      // Top 10 doctors by patient count
      Patient.aggregate([
        { $group: { _id: '$doctor', patientCount: { $sum: 1 } } },
        { $sort: { patientCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'doctors',
            localField: '_id',
            foreignField: '_id',
            as: 'doctorInfo',
          },
        },
        { $unwind: '$doctorInfo' },
        {
          $project: {
            _id: 0,
            doctorId: '$_id',
            doctorName: '$doctorInfo.name',
            specialization: '$doctorInfo.specialization',
            hospital: '$doctorInfo.hospital',
            patientCount: 1,
          },
        },
      ]),

      // Patient count by condition
      Patient.aggregate([
        { $group: { _id: '$condition', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, condition: '$_id', count: 1 } },
      ]),

      // Patient count by gender
      Patient.aggregate([
        { $group: { _id: '$gender', count: { $sum: 1 } } },
        { $project: { _id: 0, gender: '$_id', count: 1 } },
      ]),

      // Monthly new patients (last 12 months)
      Patient.aggregate([
        { $match: { createdAt: { $gte: oneYearAgo } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $project: { _id: 0, year: '$_id.year', month: '$_id.month', count: 1 } },
      ]),

      // Top specializations
      Doctor.aggregate([
        { $group: { _id: '$specialization', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
        { $project: { _id: 0, specialization: '$_id', count: 1 } },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totals: { doctors: totalDoctors, patients: totalPatients },
        patientsPerDoctor,
        conditionBreakdown,
        genderBreakdown,
        monthlyPatients,
        topSpecializations,
      },
    });
  } catch (error) {
    next(error);
  }
};
