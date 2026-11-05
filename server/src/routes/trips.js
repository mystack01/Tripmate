import { Router } from 'express';
import { body } from 'express-validator';
import {
  listTrips, createTrip, getTrip, updateTrip, deleteTrip, getInsights,
  addItineraryItem, deleteItineraryItem,
  addExpense, deleteExpense,
  addPackingItem, togglePackingItem, deletePackingItem,
} from '../controllers/tripController.js';
import { EXPENSE_CATEGORIES } from '../models/Trip.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = Router();
router.use(protect);

const noAngle = (v) => String(v).replace(/[<>]/g, '');

const tripRules = [
  body('destination').trim().isLength({ min: 2, max: 80 }).withMessage('Destination must be 2-80 characters').customSanitizer(noAngle),
  body('startDate').isISO8601().withMessage('Start date is invalid'),
  body('endDate').isISO8601().withMessage('End date is invalid')
    .custom((end, { req }) => new Date(end) >= new Date(req.body.startDate))
    .withMessage('End date must be on or after the start date'),
  body('budget').isFloat({ min: 0, max: 100000000 }).withMessage('Budget must be a positive number').toFloat(),
  body('baseCurrency').trim().isAlpha().isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code').toUpperCase(),
  body('notes').optional({ values: 'falsy' }).trim().isLength({ max: 1000 }).withMessage('Notes are too long').customSanitizer(noAngle),
];

const itineraryRules = [
  body('title').trim().isLength({ min: 2, max: 100 }).withMessage('Title must be 2-100 characters').customSanitizer(noAngle),
  body('date').isISO8601().withMessage('Date is invalid'),
  body('note').optional({ values: 'falsy' }).trim().isLength({ max: 300 }).withMessage('Note is too long').customSanitizer(noAngle),
];

const expenseRules = [
  body('title').trim().isLength({ min: 2, max: 80 }).withMessage('Expense name must be 2-80 characters').customSanitizer(noAngle),
  body('amount').isFloat({ min: 0.01, max: 100000000 }).withMessage('Amount must be greater than 0').toFloat(),
  body('category').isIn(EXPENSE_CATEGORIES).withMessage('Choose a valid category'),
];

const packingRules = [
  body('label').trim().isLength({ min: 1, max: 60 }).withMessage('Item must be 1-60 characters').customSanitizer(noAngle),
];

router.route('/').get(listTrips).post(tripRules, validate, createTrip);
router.route('/:id').get(getTrip).put(tripRules, validate, updateTrip).delete(deleteTrip);
router.get('/:id/insights', getInsights);

router.post('/:id/itinerary', itineraryRules, validate, addItineraryItem);
router.delete('/:id/itinerary/:itemId', deleteItineraryItem);

router.post('/:id/expenses', expenseRules, validate, addExpense);
router.delete('/:id/expenses/:itemId', deleteExpense);

router.post('/:id/packing', packingRules, validate, addPackingItem);
router.patch('/:id/packing/:itemId', body('packed').isBoolean().withMessage('packed must be true or false').toBoolean(), validate, togglePackingItem);
router.delete('/:id/packing/:itemId', deletePackingItem);

export default router;
