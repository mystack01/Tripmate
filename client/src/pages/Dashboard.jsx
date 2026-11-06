import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../AuthContext.jsx';
import { useUI } from '../UIContext.jsx';
import Flap from '../components/Flap.jsx';
import CountUp from '../components/CountUp.jsx';
import { cityCode, flagEmoji, fmtDate, money, tripDays, tripStatus } from '../utils.js';

const FILTERS = [
  ['all', 'All'],
  ['upcoming', 'Upcoming'],
  ['ongoing', 'Now'],
  ['past', 'Completed'],
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function PassCard({ trip, onDelete }) {
  const pct = trip.budget > 0 ? Math.min(100, (trip.spent / trip.budget) * 100) : 0;
  return (
    <article className="pass">
      <div className="pass-main">
        <div className="pass-head">
          <span className="pass-flag" aria-hidden="true">{flagEmoji(trip.countryCode)}</span>
          <div>
            <h2>{trip.destination}</h2>
            <p className="muted">{trip.country}</p>
          </div>
        </div>
        <dl className="pass-fields">
          <div><dt>Departs</dt><dd>{fmtDate(trip.startDate)}</dd></div>
          <div><dt>Returns</dt><dd>{fmtDate(trip.endDate)}</dd></div>
          <div><dt>Days</dt><dd>{tripDays(trip.startDate, trip.endDate)}</dd></div>
          <div><dt>Budget</dt><dd>{money(trip.budget, trip.baseCurrency)}</dd></div>
        </dl>
        <div className="pass-spend">
          <div className={`bar ${trip.spent > trip.budget ? 'over' : ''}`} aria-hidden="true"><span style={{ width: `${pct}%` }} /></div>
          <small className="muted">Spent {money(trip.spent, trip.baseCurrency)} of {money(trip.budget, trip.baseCurrency)}</small>
        </div>
        <div className="row">
          <Link to={`/trips/${trip._id}`} className="btn btn-sm">Open trip</Link>
          <Link to={`/trips/${trip._id}/edit`} className="btn btn-quiet btn-sm">Edit</Link>
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(trip)}>Delete</button>
        </div>
      </div>
      <div className="pass-stub">
        <Flap text={cityCode(trip.destination)} size="md" label={`Trip code ${cityCode(trip.destination)}`} />
        <span className={`badge badge-${trip.status.key}`}>{trip.status.label}</span>
      </div>
    </article>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { toast, confirm } = useUI();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('date');

  useEffect(() => {
    api('/trips')
      .then((d) => setTrips(d.trips))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const decorated = useMemo(
    () =>
      trips.map((t) => ({
        ...t,
        status: tripStatus(t.startDate, t.endDate),
        spent: (t.expenses || []).reduce((sum, e) => sum + e.amount, 0),
      })),
    [trips]
  );

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = decorated.filter(
      (t) =>
        (filter === 'all' || t.status.key === filter) &&
        `${t.destination} ${t.country}`.toLowerCase().includes(term)
    );
    list.sort((a, b) => {
      if (sort === 'budget') return b.budget - a.budget;
      if (sort === 'name') return a.destination.localeCompare(b.destination);
      return new Date(a.startDate) - new Date(b.startDate);
    });
    return list;
  }, [decorated, q, filter, sort]);

  const next = useMemo(() => {
    const live = decorated.find((t) => t.status.key === 'ongoing');
    if (live) return live;
    return decorated
      .filter((t) => t.status.key === 'upcoming')
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];
  }, [decorated]);

  const tally = {
    trips: trips.length,
    upcoming: decorated.filter((t) => t.status.key !== 'past').length,
    countries: new Set(trips.map((t) => t.countryCode).filter(Boolean)).size,
    activities: trips.reduce((s, t) => s + t.itinerary.length, 0),
  };

  async function remove(trip) {
    const ok = await confirm({
      title: `Delete your trip to ${trip.destination}?`,
      message: 'The itinerary, expenses and packing list for this trip will be removed too. This cannot be undone.',
      confirmText: 'Delete trip',
      danger: true,
    });
    if (!ok) return;
    try {
      await api(`/trips/${trip._id}`, { method: 'DELETE' });
      setTrips((list) => list.filter((x) => x._id !== trip._id));
      toast('Trip deleted.');
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  return (
    <div className="container page">
      <div className="page-head">
        <h1>{greeting()}, {user.name.split(' ')[0]}.</h1>
        <Link to="/trips/new" className="btn">Plan a trip</Link>
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      {next && (
        <section className="next-board" aria-label="Next departure">
          <div>
            <p className="on-board">{next.status.key === 'ongoing' ? 'You are travelling' : 'Next departure'}</p>
            <h2>{next.destination}, {next.country}</h2>
          </div>
          <div className="next-time">
            {next.status.key === 'upcoming' ? (
              <>
                <Flap text={String(next.status.days).padStart(2, '0')} size="lg" label={`${next.status.days} days`} />
                <span className="on-board">{next.status.days === 1 ? 'day to go' : 'days to go'}</span>
              </>
            ) : (
              <Flap text="NOW" size="lg" />
            )}
          </div>
          <Link to={`/trips/${next._id}`} className="btn btn-amber">Open trip</Link>
        </section>
      )}

      {!loading && trips.length > 0 && (
        <dl className="tally">
          <div><dd><CountUp value={tally.trips} /></dd><dt>Trips planned</dt></div>
          <div><dd><CountUp value={tally.upcoming} /></dd><dt>Still ahead</dt></div>
          <div><dd><CountUp value={tally.countries} /></dd><dt>Countries</dt></div>
          <div><dd><CountUp value={tally.activities} /></dd><dt>Activities lined up</dt></div>
        </dl>
      )}

      {trips.length > 0 && (
        <div className="toolbar">
          <div className="seg" role="group" aria-label="Filter trips">
            {FILTERS.map(([key, label]) => (
              <button key={key} className="seg-btn" aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}</button>
            ))}
          </div>
          <input type="search" placeholder="Search destinations" aria-label="Search destinations" value={q} onChange={(e) => setQ(e.target.value)} />
          <select aria-label="Sort trips" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="date">Soonest first</option>
            <option value="budget">Biggest budget</option>
            <option value="name">Name A to Z</option>
          </select>
        </div>
      )}

      {loading && (
        <div className="pass-grid">
          {[1, 2].map((n) => <div key={n} className="skeleton" style={{ height: 230 }} />)}
        </div>
      )}

      {!loading && trips.length === 0 && (
        <div className="empty">
          <Flap text="NO TRIPS" size="lg" />
          <p>Nothing on the board yet. Pick a destination and dates, and TripMate fills in the forecast, map and exchange rate.</p>
          <Link to="/trips/new" className="btn">Plan your first trip</Link>
        </div>
      )}

      {!loading && trips.length > 0 && visible.length === 0 && (
        <p className="muted">No trips match your search. Try a different filter.</p>
      )}

      <div className="pass-grid">
        {visible.map((t) => <PassCard key={t._id} trip={t} onDelete={remove} />)}
      </div>
    </div>
  );
}
