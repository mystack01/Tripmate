import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useUI } from '../UIContext.jsx';
import { toInputDate } from '../utils.js';

const empty = { destination: '', startDate: '', endDate: '', budget: '', baseCurrency: 'USD', notes: '' };
const CURRENCIES = ['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR', 'INR', 'CAD', 'AUD', 'TRY', 'JPY'];

export default function TripForm() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useUI();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editing) return;
    api(`/trips/${id}`)
      .then(({ trip }) =>
        setForm({
          destination: trip.destination,
          startDate: toInputDate(trip.startDate),
          endDate: toInputDate(trip.endDate),
          budget: trip.budget,
          baseCurrency: trip.baseCurrency,
          notes: trip.notes || '',
        })
      )
      .catch((e) => setError(e.message));
  }, [id, editing]);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const payload = { ...form, budget: Number(form.budget) };
      const data = editing
        ? await api(`/trips/${id}`, { method: 'PUT', body: payload })
        : await api('/trips', { method: 'POST', body: payload });
      toast(editing ? 'Trip updated.' : 'Trip created. Fetching your destination details…');
      navigate(`/trips/${data.trip._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container page">
      <Link to={editing ? `/trips/${id}` : '/'} className="back">Back</Link>
      <div className="panel form-panel">
        <h1>{editing ? 'Edit trip' : 'Plan a trip'}</h1>
        <p className="muted">Type a city. TripMate looks up its location, country and forecast for you.</p>
        <form onSubmit={onSubmit} noValidate>
          <label htmlFor="destination">Destination city</label>
          <input id="destination" name="destination" value={form.destination} onChange={onChange} placeholder="For example, Istanbul" required />
          <div className="field-row">
            <div>
              <label htmlFor="startDate">Departs</label>
              <input id="startDate" name="startDate" type="date" value={form.startDate} onChange={onChange} required />
            </div>
            <div>
              <label htmlFor="endDate">Returns</label>
              <input id="endDate" name="endDate" type="date" value={form.endDate} onChange={onChange} required />
            </div>
          </div>
          <div className="field-row">
            <div>
              <label htmlFor="budget">Budget</label>
              <input id="budget" name="budget" type="number" min="0" step="any" value={form.budget} onChange={onChange} required />
            </div>
            <div>
              <label htmlFor="baseCurrency">Your currency</label>
              <input id="baseCurrency" name="baseCurrency" list="currencies" maxLength={3} value={form.baseCurrency} onChange={(e) => setForm({ ...form, baseCurrency: e.target.value.toUpperCase() })} placeholder="PKR" required />
              <datalist id="currencies">{CURRENCIES.map((c) => <option key={c} value={c} />)}</datalist>
            </div>
          </div>
          <label htmlFor="notes">Notes (optional)</label>
          <textarea id="notes" name="notes" rows="4" maxLength={1000} value={form.notes} onChange={onChange} />
          <p className="error" role="alert">{error}</p>
          <button className="btn" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Create trip'}</button>
        </form>
      </div>
    </div>
  );
}
