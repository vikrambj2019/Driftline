import { AIRPORT, FARES, airlineName } from '../lib/data.js';
import { fmtDate, fmtDuration, fmtTime } from '../lib/format.js';

export function StopsLabel({ flight }) {
  if (!flight.stops) return <span className="stops nonstop">Nonstop</span>;
  const seg = flight.segments[1];
  return (
    <span className="stops">
      1 stop · {flight.segments[0].to} ({fmtDuration(seg.layover)})
    </span>
  );
}

export function TimeRange({ flight }) {
  return (
    <span className="time-range">
      <span>{fmtTime(flight.dep)}</span>
      <span aria-hidden="true"> – </span>
      <span className="visually-hidden"> to </span>
      <span>
        {fmtTime(flight.arr)}
        {flight.dayOffset > 0 && (
          <sup className="day-offset" title="Arrives the next day">
            +{flight.dayOffset}
            <span className="visually-hidden"> day</span>
          </sup>
        )}
      </span>
    </span>
  );
}

/** Compact leg summary used on review, confirmation, and trip pages. */
export function LegSummary({ label, flight, fare }) {
  return (
    <div className="leg-summary">
      <div className="leg-head">
        <span className="leg-label">{label}</span>
        <span>{fmtDate(flight.date)}</span>
      </div>
      <div className="leg-main">
        <strong>
          {flight.from} → {flight.to}
        </strong>
        <TimeRange flight={flight} />
        <span className="muted">{fmtDuration(flight.duration)}</span>
        <StopsLabel flight={flight} />
      </div>
      <div className="muted small">
        {airlineName(flight.airline)} · {flight.segments.map((s) => s.flightNumber).join(', ')}
        {fare && <> · {FARES[fare].name} fare</>}
      </div>
    </div>
  );
}

export function SegmentList({ flight }) {
  return (
    <ol className="segments">
      {flight.segments.map((s) => (
        <li key={s.flightNumber + s.from}>
          {s.layover && <p className="layover">Layover in {AIRPORT[s.from].city} · {fmtDuration(s.layover)}</p>}
          <div className="segment">
            <div>
              <strong>{fmtTime(s.dep)}</strong> {AIRPORT[s.from].name} ({s.from})
            </div>
            <div className="muted small">
              {s.flightNumber} · {fmtDuration(s.duration)}
            </div>
            <div>
              <strong>
                {fmtTime(s.arr)}
                {Math.floor(s.arr / 1440) > 0 && <sup className="day-offset">+{Math.floor(s.arr / 1440)}</sup>}
              </strong>{' '}
              {AIRPORT[s.to].name} ({s.to})
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
