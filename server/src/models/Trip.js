import mongoose from 'mongoose';

const itinerarySchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 100 },
  date: { type: Date, required: true },
  note: { type: String, trim: true, maxlength: 300, default: '' },
});

export const EXPENSE_CATEGORIES = ['Food', 'Transport', 'Stay', 'Activities', 'Shopping', 'Other'];

const expenseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 80 },
  amount: { type: Number, required: true, min: 0.01 },
  category: { type: String, enum: EXPENSE_CATEGORIES, default: 'Other' },
  date: { type: Date, default: Date.now },
});

const packingSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true, maxlength: 60 },
  packed: { type: Boolean, default: false },
});

const tripSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    destination: { type: String, required: true, trim: true, maxlength: 80 },
    country: { type: String, default: '' },
    countryCode: { type: String, default: '' },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    budget: { type: Number, required: true, min: 0 },
    baseCurrency: { type: String, required: true, uppercase: true, minlength: 3, maxlength: 3 },
    notes: { type: String, trim: true, maxlength: 1000, default: '' },
    itinerary: [itinerarySchema],
    expenses: [expenseSchema],
    packing: [packingSchema],
  },
  { timestamps: true }
);

export default mongoose.model('Trip', tripSchema);
