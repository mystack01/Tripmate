import mongoose from 'mongoose';
import User from '../models/User.js';
import Trip from '../models/Trip.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';

export const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  const counts = await Trip.aggregate([{ $group: { _id: '$user', count: { $sum: 1 } } }]);
  const map = new Map(counts.map((c) => [c._id.toString(), c.count]));
  res.json({
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      tripCount: map.get(u.id) || 0,
    })),
  });
});

// Platform-wide numbers for the admin dashboard
export const getStats = asyncHandler(async (req, res) => {
  const [users, trips] = await Promise.all([User.countDocuments(), Trip.countDocuments()]);

  const totals = await Trip.aggregate([
    {
      $group: {
        _id: null,
        activities: { $sum: { $size: { $ifNull: ['$itinerary', []] } } },
        expenses: { $sum: { $size: { $ifNull: ['$expenses', []] } } },
        avgDays: {
          $avg: { $add: [{ $divide: [{ $subtract: ['$endDate', '$startDate'] }, 86400000] }, 1] },
        },
      },
    },
  ]);

  const topDestinations = await Trip.aggregate([
    {
      $group: {
        _id: '$destination',
        country: { $first: '$country' },
        countryCode: { $first: '$countryCode' },
        count: { $sum: 1 },
      },
    },
    { $sort: { count: -1, _id: 1 } },
    { $limit: 5 },
  ]);

  // Last 6 calendar months (UTC)
  const now = new Date();
  const since = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));
  const monthly = (Model) =>
    Model.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
    ]);
  const [userMonths, tripMonths] = await Promise.all([monthly(User), monthly(Trip)]);
  const toMap = (rows) => new Map(rows.map((r) => [r._id, r.count]));
  const um = toMap(userMonths);
  const tm = toMap(tripMonths);

  const months = [];
  for (let i = 0; i < 6; i += 1) {
    const d = new Date(Date.UTC(since.getUTCFullYear(), since.getUTCMonth() + i, 1));
    const key = d.toISOString().slice(0, 7);
    months.push({
      label: d.toLocaleString('en', { month: 'short', timeZone: 'UTC' }),
      users: um.get(key) || 0,
      trips: tm.get(key) || 0,
    });
  }

  res.json({
    users,
    trips,
    activities: totals[0]?.activities || 0,
    expenses: totals[0]?.expenses || 0,
    avgDays: Math.round((totals[0]?.avgDays || 0) * 10) / 10,
    topDestinations,
    months,
  });
});

export const updateRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw httpError(400, 'Invalid user id');
  if (id === req.user.id) throw httpError(400, 'You cannot change your own role');
  const user = await User.findById(id);
  if (!user) throw httpError(404, 'User not found');
  user.role = req.body.role;
  await user.save();
  res.json({ message: 'Role updated', role: user.role });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw httpError(400, 'Invalid user id');
  if (id === req.user.id) throw httpError(400, 'You cannot delete your own account');
  const user = await User.findById(id);
  if (!user) throw httpError(404, 'User not found');
  await Trip.deleteMany({ user: id });
  await user.deleteOne();
  res.json({ message: 'User and their trips deleted' });
});
