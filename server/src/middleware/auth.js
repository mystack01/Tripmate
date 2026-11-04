import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw httpError(401, 'Not authenticated');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw httpError(401, 'Invalid or expired token');
  }

  const user = await User.findById(payload.id).select('role');
  if (!user) throw httpError(401, 'User no longer exists');
  req.user = { id: user.id, role: user.role };
  next();
});

export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : next(httpError(403, 'Forbidden'));
