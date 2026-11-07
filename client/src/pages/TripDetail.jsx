import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useUI } from '../UIContext.jsx';
import Flap from '../components/Flap.jsx';
import { cityCode, describeWeather, flagEmoji, fmtDate, fmtShort, money, toInputDate, tripDays, tripStatus } from '../utils.js';

const CATEGORIES = {
  Food: '#E8A200',
  Transport: '#2F80ED',
  Stay: '#7B61FF',
  Activities: '#12A150',
  Shopping: '#E5484D',
  Other: '#8896A6',
};

const TABS = [
  ['overview', 'Overview'],
  ['itinerary', 'Itinerary'],
  ['budget', 'Budget'],
  ['packing', 'Packing'],
];

function packingSuggestions(weather) {
  const s = ['Passport', 'Phone charger', 'Travel adapter'];
  if (weather) {
    if (weather.some((d) => d.rain >= 1)) s.push('Umbrella', 'Rain jacket');
    if (weather.some((d) => d.min <= 10)) s.push('Warm jacket', 'Gloves');
    if (weather.some((d) => d.max >= 28)) s.push('Sunscreen', 'Sunglasses', 'Hat');
  } else {
    s.push('Sunscreen', 'Umbrella');
  }
  return s;
}

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast, confirm } = useUI();
  const [trip, setTrip] = useState(null);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('overview');

  const [item, setItem] = useState({ title: '', date: '', note: '' });
  const [expense, setExpense] = useState({ title: '', amount: '', category: 'Food' });
  const [packLabel, setPackLabel] = useState('');

  useEffect(() => {
    api(`/trips/${id}`)
      .then((d) => {
        setTrip(d.trip);
        setItem((i) => ({ ...i, date: toInputDate(d.trip.startDate) }));
      })
      .catch((e) => setError(e.message));
    api(`/trips/${id}/insights`)
      .then(setInsights)
      .catch(() => setInsights(null))
      .finally(() => setInsightsLoading(false));
  }, [id]);

  const status = trip ? tripStatus(trip.startDate, trip.endDate) : null;
  const spent = useMemo(() => (trip?.expenses || []).reduce((s, e) => s + e.amount, 0), [trip]);

  const byCategory = useMemo(() => {
    const totals = {};
    (trip?.expenses || []).forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [trip]);

  // Runs an API call, updates the trip from the response, and shows a toast
  async function run(fn, okMessage) {
    try {
      const d = await fn();
      if (d?.trip) setTrip(d.trip);
      if (okMessage) toast(okMessage);
      return true;
    } catch (e) {
      toast(e.message, 'error');
      return false;
    }
  }

  async function addItem(e) {
    e.preventDefault();
    const ok = await run(() => api(`/trips/${id}/itinerary`, { method: 'POST', body: item }), 'Activity added.');
    if (ok) setItem((i) => ({ ...i, title: '', note: '' }));
  }

  async function addExpense(e) {
    e.preventDefault();
    const body = { ...expense, amount: Number(expense.amount) };
    const ok = await run(() => api(`/trips/${id}/expenses`, { method: 'POST', body }), 'Expense added.');
    if (ok) setExpense((x) => ({ ...x, title: '', amount: '' }));
  }

  async function addPacking(label) {
    const text = (label ?? packLabel).trim();
    if (!text) return;
    const ok = await run(() => api(`/trips/${id}/packing`, { method: 'POST', body: { label: text } }));
    if (ok && label === undefined) setPackLabel('');
  }

  async function removeTrip() {
    const ok = await confirm({
      title: `Delete your trip to ${trip.destination}?`,
      message: 'The itinerary, expenses and packing list will be removed too. This cannot be undone.',
      confirmText: 'Delete trip',
      danger: true,
    });
    if (!ok) return;
    try {
      await api(`/trips/${id}`, { method: 'DELETE' });
      toast('Trip deleted.');
      navigate('/');
    } catch (e) {
      toast(e.message, 'error');
    }
  }

  function printPlan() {
    setTab('itinerary');
    setTimeout(() => window.print(), 150);
  }

  if (error) return <div className="container page"><p className="error" role="alert">{error}</p><Link to="/">Back to my trips</Link></div>;
  if (!trip) return <div className="container page"><div className="skeleton" style={{ height: 180 }} /></div>;

  const pct = trip.budget > 0 ? Math.min(100, (spent / trip.budget) * 100) : 0;
  const remaining = trip.budget - spent;
  const days = {};
  [...trip.itinerary]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((i) => {
      const key = toInputDate(i.date);
      if (!days[key]) days[key] = [];
      days[key].push(i);
    });

  const packed = trip.packing.filter((p) => p.packed).length;
  const existing = new Set(trip.packing.map((p) => p.label.toLowerCase()));
  const suggestions = packingSuggestions(insights?.weather).filter((s) => !existing.has(s.toLowerCase()));

  let acc = 0;
  const donut = byCategory.length
    ? byCategory.map(([cat, total]) => {
        const start = acc;
        acc += (total / spent) * 100;
        return `${CATEGORIES[cat]} ${start}% ${acc}%`;
      }).join(', ')
    : 'var(--line) 0 100%';

  const lat = trip.latitude;
  const lon = trip.longitude;
  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.09}%2C${lat - 0.055}%2C${lon + 0.09}%2C${lat + 0.055}&layer=mapnik&marker=${lat}%2C${lon}`;

  return (
    <div className="container page">
      <Link to="/" className="back no-print">Back to my trips</Link>

      <header className="trip-head">
        <div className="trip-code">
          <Flap text={cityCode(trip.destination)} size="lg" label={`Trip code ${cityCode(trip.destination)}`} />
        </div>
        <div className="trip-title">
          <h1>{trip.destination}</h1>
          <p className="on-board">{flagEmoji(trip.countryCode)} {trip.country}</p>
          <dl className="trip-facts">
            <div><dt>Departs</dt><dd>{fmtDate(trip.startDate)}</dd></div>
            <div><dt>Returns</dt><dd>{fmtDate(trip.endDate)}</dd></div>
            <div><dt>Days</dt><dd>{tripDays(trip.startDate, trip.endDate)}</dd></div>
            <div><dt>Budget</dt><dd>{money(trip.budget, trip.baseCurrency)}</dd></div>
          </dl>
        </div>
        <div className="trip-actions no-print">
          <span className={`badge badge-${status.key}`}>{status.label}</span>
          <Link to={`/trips/${id}/edit`} className="btn btn-sm btn-ghost-board">Edit</Link>
          <button className="btn btn-sm btn-ghost-board" onClick={printPlan}>Print plan</button>
          <button className="btn btn-sm btn-ghost-board" onClick={removeTrip}>Delete</button>
        </div>
      </header>

      <div className="tabs no-print" role="tablist" aria-label="Trip sections">
        {TABS.map(([key, label]) => (
          <button key={key} role="tab" id={`tab-${key}`} aria-selected={tab === key} aria-controls={`panel-${key}`} className="tab" onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {/* ---------------- Overview ---------------- */}
      {tab === 'overview' && (
        <section role="tabpanel" id="panel-overview" aria-labelledby="tab-overview" className="stack">
          {insightsLoading && <div className="skeleton" style={{ height: 160 }} />}
          {!insightsLoading && !insights && <p className="error">Live data is unavailable right now. Refresh to try again.</p>}

          {insights && (
            <div className="two-col">
              <div className="panel">
                <h2>About {insights.country?.name || trip.country}</h2>
                {insights.country ? (
                  <div className="country">
                    {insights.country.flag && <img src={insights.country.flag} alt={`Flag of ${insights.country.name}`} width="72" />}
                    <dl className="facts-list">
                      <div><dt>Capital</dt><dd>{insights.country.capital || 'Not listed'}</dd></div>
                      <div><dt>Languages</dt><dd>{insights.country.languages.join(', ') || 'Not listed'}</dd></div>
                      <div><dt>Population</dt><dd>{insights.country.population?.toLocaleString() ?? 'Not listed'}</dd></div>
                      <div><dt>Currency</dt><dd>{insights.country.currencyName} ({insights.country.currencyCode} {insights.country.currencySymbol})</dd></div>
                    </dl>
                  </div>
                ) : <p className="muted">Country details are unavailable right now.</p>}
              </div>

              <div className="panel">
                <h2>Your budget on arrival</h2>
                {insights.exchange ? (
                  <>
                    <p className="big-number">{insights.exchange.converted.toLocaleString()} <span>{insights.exchange.to}</span></p>
                    <p className="muted">
                      {money(insights.exchange.budget, insights.exchange.from)} at 1 {insights.exchange.from} = {insights.exchange.rate} {insights.exchange.to}
                    </p>
                  </>
                ) : <p className="muted">The exchange rate is unavailable right now.</p>}
              </div>
            </div>
          )}

          {insights?.weather && (
            <div>
              <h2>Seven-day forecast</h2>
              <div className="board-wrap">
                <table className="board">
                  <caption className="sr-only">Seven-day weather forecast for {trip.destination}</caption>
                  <thead>
                    <tr><th scope="col">Day</th><th scope="col">Conditions</th><th scope="col">Low / high</th><th scope="col">Rain</th></tr>
                  </thead>
                  <tbody>
                    {insights.weather.map((d) => {
                      const w = describeWeather(d.code);
                      return (
                        <tr key={d.date}>
                          <td>{fmtShort(d.date)}</td>
                          <td><span aria-hidden="true">{w.icon}</span> {w.label}</td>
                          <td>{Math.round(d.min)}° / {Math.round(d.max)}°C</td>
                          <td>{d.rain} mm</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div>
            <h2>On the map</h2>
            <iframe className="map" title={`Map of ${trip.destination}`} src={mapSrc} loading="lazy" />
          </div>

          {trip.notes && (
            <div className="panel">
              <h2>Notes</h2>
              <p className="pre">{trip.notes}</p>
            </div>
          )}
        </section>
      )}

      {/* ---------------- Itinerary ---------------- */}
      {tab === 'itinerary' && (
        <section role="tabpanel" id="panel-itinerary" aria-labelledby="tab-itinerary" className="stack">
          <form className="panel no-print" onSubmit={addItem} noValidate>
            <h2>Add an activity</h2>
            <div className="field-row">
              <div>
                <label htmlFor="title">Activity</label>
                <input id="title" value={item.title} onChange={(e) => setItem({ ...item, title: e.target.value })} placeholder="Visit Hagia Sophia" required />
              </div>
              <div>
                <label htmlFor="date">Day</label>
                <input id="date" type="date" value={item.date} onChange={(e) => setItem({ ...item, date: e.target.value })} required />
              </div>
            </div>
            <label htmlFor="note">Note (optional)</label>
            <input id="note" value={item.note} onChange={(e) => setItem({ ...item, note: e.target.value })} placeholder="Tickets open at 9am" />
            <button className="btn">Add activity</button>
          </form>

          {Object.keys(days).length === 0 && <p className="muted">No activities yet. Add the first one above.</p>}
          {Object.entries(days).map(([date, list]) => (
            <div key={date} className="day">
              <h3>{fmtShort(date)}</h3>
              <ul className="plain-list">
                {list.map((i) => (
                  <li key={i._id}>
                    <div>
                      <strong>{i.title}</strong>
                      {i.note && <p className="muted">{i.note}</p>}
                    </div>
                    <button className="btn btn-danger btn-sm no-print" onClick={() => run(() => api(`/trips/${id}/itinerary/${i._id}`, { method: 'DELETE' }), 'Activity removed.')} aria-label={`Remove ${i.title}`}>Remove</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {/* ---------------- Budget ---------------- */}
      {tab === 'budget' && (
        <section role="tabpanel" id="panel-budget" aria-labelledby="tab-budget" className="stack">
          <div className="budget-top">
            <div className="panel">
              <dl className="money-row">
                <div><dt>Budget</dt><dd>{money(trip.budget, trip.baseCurrency)}</dd></div>
                <div><dt>Spent</dt><dd>{money(spent, trip.baseCurrency)}</dd></div>
                <div><dt>{remaining < 0 ? 'Over budget by' : 'Left to spend'}</dt><dd className={remaining < 0 ? 'neg' : ''}>{money(Math.abs(remaining), trip.baseCurrency)}</dd></div>
              </dl>
              <div className={`bar bar-lg ${remaining < 0 ? 'over' : ''}`} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin="0" aria-valuemax="100" aria-label="Budget used">
                <span style={{ width: `${pct}%` }} />
              </div>
            </div>
            <div className="panel donut-panel">
              <div className="donut" style={{ background: `conic-gradient(${donut})` }} role="img" aria-label="Spending by category">
                <span>{byCategory.length ? `${Math.round(pct)}%` : '0%'}</span>
              </div>
              <ul className="legend">
                {byCategory.length === 0 && <li className="muted">No spending yet</li>}
                {byCategory.map(([cat, total]) => (
                  <li key={cat}><i style={{ background: CATEGORIES[cat] }} /> {cat}: {money(total, trip.baseCurrency)}</li>
                ))}
              </ul>
            </div>
          </div>

          <form className="panel" onSubmit={addExpense} noValidate>
            <h2>Log an expense</h2>
            <p className="muted">Amounts are in {trip.baseCurrency}, the currency you chose for this trip.</p>
            <div className="field-row three">
              <div>
                <label htmlFor="exTitle">What was it?</label>
                <input id="exTitle" value={expense.title} onChange={(e) => setExpense({ ...expense, title: e.target.value })} placeholder="Dinner by the Bosphorus" required />
              </div>
              <div>
                <label htmlFor="exAmount">Amount</label>
                <input id="exAmount" type="number" min="0" step="any" value={expense.amount} onChange={(e) => setExpense({ ...expense, amount: e.target.value })} required />
              </div>
              <div>
                <label htmlFor="exCat">Category</label>
                <select id="exCat" value={expense.category} onChange={(e) => setExpense({ ...expense, category: e.target.value })}>
                  {Object.keys(CATEGORIES).map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <button className="btn">Add expense</button>
          </form>

          <ul className="plain-list panel">
            {trip.expenses.length === 0 && <li className="muted">No expenses logged yet.</li>}
            {[...trip.expenses].reverse().map((x) => (
              <li key={x._id}>
                <div>
                  <strong>{x.title}</strong>
                  <p className="muted"><i className="dot" style={{ background: CATEGORIES[x.category] }} /> {x.category}, {fmtDate(x.date)}</p>
                </div>
                <div className="row">
                  <strong>{money(x.amount, trip.baseCurrency)}</strong>
                  <button className="btn btn-danger btn-sm" onClick={() => run(() => api(`/trips/${id}/expenses/${x._id}`, { method: 'DELETE' }), 'Expense removed.')} aria-label={`Remove ${x.title}`}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------------- Packing ---------------- */}
      {tab === 'packing' && (
        <section role="tabpanel" id="panel-packing" aria-labelledby="tab-packing" className="stack">
          <div className="panel">
            <div className="row between">
              <h2>Packing list</h2>
              <p className="muted">{packed} of {trip.packing.length} packed</p>
            </div>
            <div className="bar" aria-hidden="true"><span style={{ width: `${trip.packing.length ? (packed / trip.packing.length) * 100 : 0}%` }} /></div>
            <form className="input-group" onSubmit={(e) => { e.preventDefault(); addPacking(); }}>
              <input aria-label="New packing item" placeholder="Add an item" value={packLabel} onChange={(e) => setPackLabel(e.target.value)} />
              <button className="btn">Add</button>
            </form>
            {suggestions.length > 0 && (
              <div className="suggest">
                <p className="muted">{insights?.weather ? 'Suggested for the forecast' : 'Suggestions'}</p>
                <div className="chips">
                  {suggestions.map((s) => (
                    <button key={s} className="chip" onClick={() => addPacking(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <ul className="plain-list panel">
            {trip.packing.length === 0 && <li className="muted">Your list is empty. Tap a suggestion to start.</li>}
            {trip.packing.map((p) => (
              <li key={p._id}>
                <label className="check">
                  <input type="checkbox" checked={p.packed} onChange={(e) => run(() => api(`/trips/${id}/packing/${p._id}`, { method: 'PATCH', body: { packed: e.target.checked } }))} />
                  <span className={p.packed ? 'done' : ''}>{p.label}</span>
                </label>
                <button className="btn btn-danger btn-sm" onClick={() => run(() => api(`/trips/${id}/packing/${p._id}`, { method: 'DELETE' }))} aria-label={`Remove ${p.label}`}>Remove</button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
