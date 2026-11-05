import mongoose from 'mongoose';
import Trip from '../models/Trip.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';
import { convertAmount } from '../utils/currency.js';
import { geocodeCity, getWeather, getCountry, getRates } from '../services/externalApi.js';

async function getOwnedTrip(req) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) throw httpError(400, 'Invalid trip id');
  const trip = await Trip.findById(id);
  if (!trip) throw httpError(404, 'Trip not found');
  if (trip.user.toString() !== req.user.id) throw httpError(403, 'Not allowed');
  return trip;
}

async function resolveDestination(destination) {
  let place;
  try {
    place = await geocodeCity(destination);
  } catch {
    throw httpError(502, 'Could not reach the location service. Please try again.');
  }
  if (!place) throw httpError(400, `Destination "${destination}" was not found`);
  return place;
}

export const listTrips = asyncHandler(async (req, res) => {
  const trips = await Trip.find({ user: req.user.id }).sort({ startDate: 1 });
  res.json({ trips });
});

export const createTrip = asyncHandler(async (req, res) => {
  const { destination, startDate, endDate, budget, baseCurrency, notes } = req.body;
  const place = await resolveDestination(destination);
  const trip = await Trip.create({
    user: req.user.id,
    destination: place.name,
    country: place.country,
    countryCode: place.countryCode,
    latitude: place.latitude,
    longitude: place.longitude,
    startDate,
    endDate,
    budget,
    baseCurrency,
    notes,
  });
  res.status(201).json({ trip });
});

export const getTrip = asyncHandler(async (req, res) => {
  res.json({ trip: await getOwnedTrip(req) });
});

export const updateTrip = asyncHandler(async (req, res) => {
  const trip = await getOwnedTrip(req);
  const { destination, startDate, endDate, budget, baseCurrency, notes } = req.body;

  if (destination.toLowerCase() !== trip.destination.toLowerCase()) {
    const place = await resolveDestination(destination);
    trip.destination = place.name;
    trip.country = place.country;
    trip.countryCode = place.countryCode;
    trip.latitude = place.latitude;
    trip.longitude = place.longitude;
  }
  Object.assign(trip, { startDate, endDate, budget, baseCurrency, notes });
  await trip.save();
  res.json({ trip });
});

export const deleteTrip = asyncHandler(async (req, res) => {
  const trip = await getOwnedTrip(req);
  await trip.deleteOne();
  res.json({ message: 'Trip deleted' });
});

// Combines three external APIs. A failure in one does not break the others.
export const getInsights = asyncHandler(async (req, res) => {
  const trip = await getOwnedTrip(req);
  const [weather, country, rates] = await Promise.allSettled([
    getWeather(trip.latitude, trip.longitude),
    trip.countryCode ? getCountry(trip.countryCode) : Promise.reject(new Error('No country')),
    getRates(trip.baseCurrency),
  ]);

  [['weather', weather], ['country', country], ['rates', rates]].forEach(([name, r]) => {
    if (r.status === 'rejected') console.error(`Insights ${name} failed:`, r.reason?.message);
  });

  const countryData = country.status === 'fulfilled' ? country.value : null;
  let exchange = null;
  if (rates.status === 'fulfilled' && countryData?.currencyCode) {
    const result = convertAmount(trip.budget, rates.value, countryData.currencyCode);
    if (result) {
      exchange = {
        from: trip.baseCurrency,
        to: countryData.currencyCode,
        budget: trip.budget,
        ...result,
      };
    }
  }

  res.json({
    weather: weather.status === 'fulfilled' ? weather.value : null,
    country: countryData,
    exchange,
  });
});

/* ---------- Itinerary ---------- */
export const addItineraryItem = asyncHandler(async (req, res) => {
  const trip = await getOwnedTrip(req);
  trip.itinerary.push({ title: req.body.title, date: req.body.date, note: req.body.note });
  await trip.save();
  res.status(201).json({ trip });
});

export const deleteItineraryItem = asyncHandler(async (req, res) => {
  const trip = await getOwnedTrip(req);
  const item = trip.itinerary.id(req.params.itemId);
  if (!item) throw httpError(404, 'Itinerary item not found');
  item.deleteOne();
  await trip.save();
  res.json({ trip });
});

/* ---------- Expenses ---------- */
export const addExpense = asyncHandler(async (req, res) => {
  const trip = await getOwnedTrip(req);
  const { title, amount, category } = req.body;
  trip.expenses.push({ title, amount, category });
  await trip.save();
  res.status(201).json({ trip });
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const trip = await getOwnedTrip(req);
  const item = trip.expenses.id(req.params.itemId);
  if (!item) throw httpError(404, 'Expense not found');
  item.deleteOne();
  await trip.save();
  res.json({ trip });
});

/* ---------- Packing list ---------- */
export const addPackingItem = asyncHandler(async (req, res) => {
  const trip = await getOwnedTrip(req);
  trip.packing.push({ label: req.body.label });
  await trip.save();
  res.status(201).json({ trip });
});

export const togglePackingItem = asyncHandler(async (req, res) => {
  const trip = await getOwnedTrip(req);
  const item = trip.packing.id(req.params.itemId);
  if (!item) throw httpError(404, 'Packing item not found');
  item.packed = req.body.packed;
  await trip.save();
  res.json({ trip });
});

export const deletePackingItem = asyncHandler(async (req, res) => {
  const trip = await getOwnedTrip(req);
  const item = trip.packing.id(req.params.itemId);
  if (!item) throw httpError(404, 'Packing item not found');
  item.deleteOne();
  await trip.save();
  res.json({ trip });
});
