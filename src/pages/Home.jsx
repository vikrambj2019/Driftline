import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AirportInput from '../components/AirportInput.jsx';
import DatePicker from '../components/DatePicker.jsx';
import { useTitle } from '../components/ui.jsx';
import { airportLabel } from '../lib/data.js';
import { DEFAULT_DEPART, DEFAULT_RETURN, fmtDate } from '../lib/format.js';
import { buildQuery } from '../lib/trip.js';
import { useVariant } from '../lib/variant.jsx';

const POPULAR = [
  { from: 'SFO', to: 'JFK', depart: '2026-11-12', ret: '2026-11-16' },
  { from: 'SEA', to: 'LHR', depart: '2026-12-04', ret: '2026-12-14' },
  { from: 'OAK', to: 'LAX', depart: '2026-10-23', ret: '2026-10-25' },
  { from: 'BOS', to: 'MIA', depart: '2027-01-15', ret: '2027-01-19' },
];

export function SearchForm({ initial = {}, compact = false }) {
  const v = useVariant();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(initial.trip || 'round');
  const [from, setFrom] = useState(initial.from || '');
  const [to, setTo] = useState(initial.to || '');
  const [depart, setDepart] = useState(initial.depart || DEFAULT_DEPART);
  const [ret, setRet] = useState(initial.ret || DEFAULT_RETURN);
  const [adults, setAdults] = useState(initial.adults || 1);
  const [infants, setInfants] = useState(initial.infants || 0);
  const [cabin, setCabin] = useState(initial.cabin || 'economy');
  const [errors, setErrors] = useState({});

  function submit(e) {
    e.preventDefault();
    const errs = {};
    if (!from) errs.from = 'Choose a departure airport from the list.';
    if (!to) errs.to = 'Choose a destination airport from the list.';
    if (from && to && from === to) errs.to = 'Destination must be different from departure.';
    if (trip === 'round' && ret < depart) errs.ret = 'Return date must be on or after the departure date.';
    if (infants > adults) errs.infants = 'Each lap infant must travel with an adult.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const q = buildQuery({ trip, from, to, depart, ret, adults, infants, cabin, nearby: false, leg: 'out' });
    navigate(`${v.to('/flights')}?${q}`);
  }

  return (
    <form className={`search-form${compact ? ' compact' : ''}`} onSubmit={submit} noValidate aria-label="Search flights">
      <fieldset className="trip-type">
        <legend className="visually-hidden">Trip type</legend>
        <label>
          <input type="radio" name="trip" value="round" checked={trip === 'round'} onChange={() => setTrip('round')} /> Round
          trip
        </label>
        <label>
          <input type="radio" name="trip" value="oneway" checked={trip === 'oneway'} onChange={() => setTrip('oneway')} /> One
          way
        </label>
      </fieldset>

      <div className="search-row">
        <AirportInput id="from" label="From" value={from} onChange={setFrom} error={errors.from} />
        <button
          type="button"
          className="swap"
          aria-label="Swap departure and destination"
          onClick={() => {
            setFrom(to);
            setTo(from);
          }}
        >
          ⇄
        </button>
        <AirportInput id="to" label="To" value={to} onChange={setTo} error={errors.to} />
        <DatePicker
          id="depart"
          label="Depart"
          value={depart}
          onChange={(d) => {
            setDepart(d);
            if (ret < d) setRet(d);
          }}
        />
        {trip === 'round' && <DatePicker id="return" label="Return" value={ret} min={depart} onChange={setRet} error={errors.ret} />}
      </div>

      <div className="search-row search-row-2">
        <div className="field">
          <label htmlFor="adults">Adults</label>
          <select id="adults" value={adults} onChange={(e) => setAdults(Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="infants">Lap infants (under 2)</label>
          <select id="infants" value={infants} onChange={(e) => setInfants(Number(e.target.value))} aria-invalid={!!errors.infants}>
            {[0, 1, 2].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          {errors.infants && <p className="field-error">{errors.infants}</p>}
        </div>
        <div className="field">
          <label htmlFor="cabin">Cabin</label>
          <select id="cabin" value={cabin} onChange={(e) => setCabin(e.target.value)}>
            <option value="economy">Economy</option>
            <option value="premium">Premium economy</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary btn-search">
          Search flights
        </button>
      </div>
    </form>
  );
}

export default function Home() {
  useTitle('Search flights');
  const v = useVariant();
  return (
    <>
      <section className="hero">
        <h1>Where to next?</h1>
        <p className="lede">Compare fares across five airlines. Transparent fees, shown before you book.</p>
        <SearchForm />
      </section>

      <section aria-labelledby="popular-heading" className="popular">
        <h2 id="popular-heading">Popular routes</h2>
        <ul className="popular-grid">
          {POPULAR.map((p) => (
            <li key={p.from + p.to}>
              <Link
                className="popular-card"
                to={`${v.to('/flights')}?${buildQuery({ trip: 'round', ...p, adults: 1, infants: 0, leg: 'out' })}`}
              >
                <strong>
                  {airportLabel(p.from)} → {airportLabel(p.to)}
                </strong>
                <span className="muted">
                  {fmtDate(p.depart)} – {fmtDate(p.ret)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
