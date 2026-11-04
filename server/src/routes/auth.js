import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, me } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const noAngle = (v) => String(v).replace(/[<>]/g, '');

router.post(
  '/register',
  body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 characters').customSanitizer(noAngle),
  body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail({ gmail_remove_dots: false }),
  body('password')
    .isLength({ min: 8, max: 72 }).withMessage('Password must be 8-72 characters')
    .matches(/[A-Za-z]/).withMessage('Password needs a letter')
    .matches(/\d/).withMessage('Password needs a number'),
  validate,
  register
);

router.post(
  '/login',
  body('email').trim().isEmail().withMessage('Enter a valid email').normalizeEmail({ gmail_remove_dots: false }),
  body('password').isString().notEmpty().withMessage('Password is required'),
  validate,
  login
);

router.get('/me', protect, me);

export default router;
