import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SearchForm } from './Home.jsx';
import { StopsLabel, TimeRange } from '../components/FlightSummary.jsx';
import { Modal, Spinner, StepBar, useTitle } from '../components/ui.jsx';
import { AIRLINES, AREA_NAMES, AIRPORT, airportLabel, flightById, nearbyAirports, searchFlights } from '../lib/data.js';
import { fmtDate, fmtDuration, fmtTime, moneyWhole } from '../lib/format.js';
import { buildQuery, readSearch } from '../lib/trip.js';
import { useVariant } from '../lib/variant.jsx';
import { getFlag, setFlag } from '../lib/store.js';

const PAGE_SIZE = 10;
const WINDOWS = [
  { id: 'morning', label: 'Morning (5 AM – 12 PM)', test: (m) => m >= 300 && m < 720 },
  { id: 'afternoon', label: 'Afternoon (12 – 6 PM)', test: (m) => m >= 720 && m < 1080 },
  { id: 'evening', label: 'Evening (6 – 9 PM)', test: (m) => m >= 1080 && m < 1260 },
  { id: 'night', label: 'Night (after 9 PM)', test: (m) => m >= 1260 },
];

export default function Results() {
  const v = useVariant();
  const [params, setParams] = useSearchParams();
  const s = readSearch(params);
  const isRet = s.leg === 'ret' && !s.oneWay;
  const origin = isRet ? s.to : s.from;
  const dest = isRet ? s.from : s.to;
  const date = isRet ? s.ret : s.depart;
  const outbound = isRet ? flightById(s.out) : null;

  useTitle(s.valid ? `${isRet ? 'Returning' : 'Departing'} flights ${origin} to ${dest}` : 'Search flights');

  const [loading, setLoading] = useState(true);
  const [stops, setStops] = useState('any');
  const [airlines, setAirlines] = useState([]);
  const [windows, setWindows] = useState([]);
  const [arriveBy, setArriveBy] = useState('any');
  const [sort, setSort] = useState('recommended');
  const [maxPrice, setMaxPrice] = useState(null);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [notice, setNotice] = useState(false);

  const key = params.toString();
  useEffect(() => {
    setLoading(true);
    setNotice(false);
    const t = setTimeout(() => setLoading(false), v.is('w1') ? 2500 : 600);
    let t2;
    if (v.is('w1')) {
      t2 = setTimeout(() => setNotice(true), 1500);
      if (!getFlag('w1-promo')) setPromoOpen(true);
    }
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [key, v.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setPage(1);
  }, [stops, airlines, windows, arriveBy, sort, maxPrice, key]);

  const all = useMemo(() => (s.valid ? searchFlights(origin, dest, date, s.nearby) : []), [s.valid, origin, dest, date, s.nearby]);
  const priceCeil = all.reduce((m, f) => Math.max(m, f.fares.basic), 0);
  const limit = maxPrice ?? priceCeil;

  const filtered = useMemo(() => {
    let list = all.filter((f) => {
      if (stops === 'nonstop' && f.stops) return false;
      if (airlines.length && !airlines.includes(f.airline)) return false;
      if (windows.length && !windows.some((w) => WINDOWS.find((x) => x.id === w).test(f.dep))) return false;
      if (arriveBy !== 'any' && (f.dayOffset > 0 || f.arr > Number(arriveBy))) return false;
      if (f.fares.basic > limit) return false;
      return true;
    });
    const byPrice = (a, b) => a.fares.basic - b.fares.basic || a.dep - b.dep;
    if (sort === 'price') {
      list = [...list].sort(v.is('b1') ? (a, b) => byPrice(b, a) : byPrice);
    } else if (sort === 'depart') list = [...list].sort((a, b) => a.dep - b.dep);
    else if (sort === 'duration') list = [...list].sort((a, b) => a.duration - b.duration || byPrice(a, b));
    else list = [...list].sort((a, b) => a.fares.basic + a.duration * 0.35 - (b.fares.basic + b.duration * 0.35));
    return list;
  }, [all, stops, airlines, windows, arriveBy, limit, sort, v.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!s.valid) {
    return (
      <section>
        <h1>Search flights</h1>
        <p className="alert alert-error" role="alert">
          That search is incomplete. Choose airports and dates to see flights.
        </p>
        <SearchForm />
      </section>
    );
  }

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const toggle = (list, setList, id) => setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const hasNearby = nearbyAirports(s.from).length > 1 || nearbyAirports(s.to).length > 1;
  const areaFor = (code) => AREA_NAMES[AIRPORT[code]?.area];

  return (
    <div className="results-page">
      <StepBar current={isRet ? 1 : 0} oneWay={s.oneWay} />

      <div className="results-head">
        <div>
          <h1>
            {isRet ? 'Choose your returning flight' : 'Choose your departing flight'}
          </h1>
          <p className="muted">
            {airportLabel(origin)} → {airportLabel(dest)} · {fmtDate(date)} · {s.adults} adult{s.adults > 1 ? 's' : ''}
            {s.infants ? `, ${s.infants} lap infant${s.infants > 1 ? 's' : ''}` : ''}
          </p>
        </div>
        {!isRet && (
          <button type="button" className="btn btn-secondary" onClick={() => setEditing((e) => !e)} aria-expanded={editing}>
            {editing ? 'Close search' : 'Change search'}
          </button>
        )}
      </div>

      {editing && !isRet && (
        <div className="card">
          <SearchForm initial={s} compact />
        </div>
      )}

      {outbound && (
        <div className="selected-leg" aria-label="Selected departing flight">
          <span className="leg-label">Departing flight selected</span>
          <span>
            {outbound.from} → {outbound.to} · {fmtDate(outbound.date)} · {fmtTime(outbound.dep)} · {outbound.airlineName}
          </span>
          <Link to={`${v.to('/flights')}?${buildQuery(s, { leg: 'out', out: '', outFare: '' })}`}>Change</Link>
        </div>
      )}

      {notice && (
        <div className="alert alert-info" role="status">
          Fares are updated frequently. Prices may change until your booking is confirmed.
        </div>
      )}

      <div className="results-layout">
        <aside className="filters" aria-label="Filters">
          <h2>Filters</h2>

          {hasNearby && (
            <fieldset>
              <legend>Airports</legend>
              <label className="check">
                <input
                  type="checkbox"
                  checked={s.nearby}
                  onChange={(e) => {
                    const next = new URLSearchParams(params);
                    if (e.target.checked) next.set('nearby', '1');
                    else next.delete('nearby');
                    setParams(next);
                  }}
                />
                Include nearby airports
              </label>
              <p className="muted small">
                {[areaFor(s.from), areaFor(s.to)].filter(Boolean).join(' and ')}
              </p>
            </fieldset>
          )}

          <fieldset>
            <legend>Stops</legend>
            <label className="check">
              <input type="radio" name="stops" checked={stops === 'any'} onChange={() => setStops('any')} /> Any number of stops
            </label>
            <label className="check">
              <input type="radio" name="stops" checked={stops === 'nonstop'} onChange={() => setStops('nonstop')} /> Nonstop only
            </label>
          </fieldset>

          <fieldset>
            <legend>Airlines</legend>
            {AIRLINES.map((a) => (
              <label className="check" key={a.code}>
                <input type="checkbox" checked={airlines.includes(a.code)} onChange={() => toggle(airlines, setAirlines, a.code)} />
                {a.name}
              </label>
            ))}
          </fieldset>

          <fieldset>
            <legend>Departure time</legend>
            {WINDOWS.map((w) => (
              <label className="check" key={w.id}>
                <input type="checkbox" checked={windows.includes(w.id)} onChange={() => toggle(windows, setWindows, w.id)} />
                {w.label}
              </label>
            ))}
          </fieldset>

          <div className="field">
            <label htmlFor="arrive-by">Arrive by (local time)</label>
            <select id="arrive-by" value={arriveBy} onChange={(e) => setArriveBy(e.target.value)}>
              <option value="any">Any time</option>
              <option value="720">12:00 PM same day</option>
              <option value="1080">6:00 PM same day</option>
              <option value="1260">9:00 PM same day</option>
              <option value="1439">Before midnight</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="max-price">
              Max price: <strong>{moneyWhole(limit)}</strong>
            </label>
            <input
              id="max-price"
              type="range"
              min={0}
              max={priceCeil}
              step={10}
              value={limit}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
          </div>
        </aside>

        <section className="results" aria-label="Flight results" aria-busy={loading}>
          <div className="results-toolbar">
            <p className="muted" aria-live="polite">
              {loading ? 'Searching…' : `${filtered.length} flight${filtered.length === 1 ? '' : 's'}`}
            </p>
            <div className="field inline">
              <label htmlFor="sort">Sort by</label>
              <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="recommended">Recommended</option>
                <option value="price">Price: low to high</option>
                <option value="depart">Departure time</option>
                <option value="duration">Duration: shortest</option>
              </select>
            </div>
          </div>
          <p className="muted small">Prices are the lowest available fare per person, one way. Taxes and fees are added at review.</p>

          {loading ? (
            <div className="skeletons">
              <Spinner label="Finding the best fares…" />
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="skeleton" />
              ))}
            </div>
          ) : shown.length === 0 ? (
            <div className="empty">
              <h2>No flights match your filters</h2>
              <p>Try removing a filter or widening the price range.</p>
            </div>
          ) : (
            <ul className="flight-list">
              {shown.map((f) => (
                <li key={f.id} className="flight-card" data-flight-id={f.id}>
                  <div className="fc-airline">
                    <span className={`airline-badge a-${f.airline}`} aria-hidden="true">
                      {f.airline}
                    </span>
                    <span>{f.airlineName}</span>
                  </div>
                  <div className="fc-times">
                    <TimeRange flight={f} />
                    <span className="muted small">
                      {f.from} – {f.to}
                    </span>
                  </div>
                  <div className="fc-meta">
                    <span>{fmtDuration(f.duration)}</span>
                    <StopsLabel flight={f} />
                  </div>
                  <div className="fc-price">
                    <span className="from">from</span>
                    <span className="price">{moneyWhole(f.fares.basic)}</span>
                    {f.seatsLeft && <span className="seats-left">{f.seatsLeft} left at this price</span>}
                  </div>
                  <Link
                    className="btn btn-primary"
                    to={`${v.to(`/flights/${f.id}`)}?${key}`}
                    aria-label={`Select ${f.airlineName} ${fmtTime(f.dep)} flight from ${f.from} to ${f.to}, from ${moneyWhole(f.fares.basic)}`}
                  >
                    Select
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {!loading && pages > 1 && (
            <nav className="pagination" aria-label="Result pages">
              <button type="button" className="btn btn-secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
              </button>
              <span>
                Page {page} of {pages}
              </span>
              <button type="button" className="btn btn-secondary" disabled={page === pages} onClick={() => setPage(page + 1)}>
                Next
              </button>
            </nav>
          )}
        </section>
      </div>

      {promoOpen && (
        <Modal
          title="Save 10% on your trip"
          onClose={() => {
            setFlag('w1-promo', '1');
            setPromoOpen(false);
          }}
        >
          <p>
            Use code <strong>DRIFT10</strong> at review for 10% off the base fare.
          </p>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setFlag('w1-promo', '1');
                setPromoOpen(false);
              }}
            >
              No thanks
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setFlag('w1-promo', '1');
                setPromoOpen(false);
              }}
            >
              Got it
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
