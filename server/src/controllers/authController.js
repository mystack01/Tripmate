import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';

const signToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });

const isAdminEmail = (email) => {
  const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  return Boolean(adminEmail) && email === adminEmail;
};

// If the account matches ADMIN_EMAIL but was created before that was set.
async function ensureAdmin(user) {
  if (isAdminEmail(user.email) && user.role !== 'admin') {
    await User.updateOne({ _id: user._id }, { role: 'admin' });
    user.role = 'admin';
  }
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) throw httpError(409, 'Email is already registered');

  const hashed = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    password: hashed,
    role: isAdminEmail(email) ? 'admin' : 'user',
  });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  const ok = user && (await bcrypt.compare(password, user.password));
  if (!ok) throw httpError(401, 'Invalid email or password');
  await ensureAdmin(user);
  res.json({ token: signToken(user), user: publicUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  await ensureAdmin(user);
  res.json({ user: publicUser(user) });
});
