import { Link } from 'react-router-dom';
import Flap from '../components/Flap.jsx';

const BOARD = [
  { city: 'Istanbul', note: '18° clear' },
  { city: 'Lisbon', note: '21° sunny' },
  { city: 'Kyoto', note: '14° rain' },
  { city: 'Cairo', note: '27° clear' },
  { city: 'Reykjavik', note: '3° snow' },
];

const LEDGER = [
  ['Seven-day forecast', 'Daily highs, lows and rainfall for your destination, from Open-Meteo.'],
  ['Budget in local currency', 'Your budget converted at today’s exchange rate, so prices make sense on arrival.'],
  ['A map of where you are going', 'An OpenStreetMap view centred on your destination.'],
  ['Day-by-day itinerary', 'Add activities and notes, grouped by day. Print it before you fly.'],
  ['Expense tracking', 'Log what you spend by category and watch the remaining budget.'],
  ['A packing list that reads the forecast', 'Suggestions change with the weather. Tick items off as you pack.'],
];

export default function Landing() {
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <h1>Know before you go.</h1>
          <p className="lead">
            TripMate gathers the forecast, the exchange rate, a map and your budget onto one page for every trip you plan.
          </p>
          <div className="row">
            <Link to="/register" className="btn btn-lg">Create a free account</Link>
            <Link to="/login" className="btn btn-quiet btn-lg">Log in</Link>
          </div>
        </div>

        <div className="hero-board" aria-label="Sample departures board">
          <p className="board-title">Sample departures</p>
          {BOARD.map((r, i) => (
            <div className="board-row" key={r.city}>
              <Flap text={r.city} size="md" delay={i * 260} />
              <Flap text={r.note} size="sm" delay={i * 260 + 350} />
            </div>
          ))}
        </div>
      </section>

      <section className="container section">
        <h2 className="section-title">Everything a trip needs, on one page</h2>
        <ul className="ledger">
          {LEDGER.map(([title, text]) => (
            <li key={title}>
              <strong>{title}</strong>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="cta-band">
        <div className="container cta-inner">
          <h2>Your next departure is waiting.</h2>
          <Link to="/register" className="btn btn-amber btn-lg">Plan a trip</Link>
        </div>
      </section>
    </>
  );
}
