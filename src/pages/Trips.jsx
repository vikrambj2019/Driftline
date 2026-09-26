import { Link } from 'react-router-dom';
import { useTitle } from '../components/ui.jsx';
import { fmtDate, money } from '../lib/format.js';
import { tripLegs } from '../lib/itinerary.js';
import { useStore } from '../lib/store.js';
import { useVariant } from '../lib/variant.jsx';

export default function Trips() {
  useTitle('My trips');
  const v = useVariant();
  const [state] = useStore(v.id);
  const tripPath = (ref) => (v.is('b4') ? `/v/${v.id}/trip/${ref}` : v.to(`/trips/${ref}`));

  return (
    <section>
      <h1>My trips</h1>
      {state.trips.length === 0 ? (
        <div className="empty card">
          <h2>No trips yet</h2>
          <p>When you book a flight, it will show up here.</p>
          <Link className="btn btn-primary" to={v.to('/')}>
            Search flights
          </Link>
        </div>
      ) : (
        <ul className="trip-list">
          {state.trips.map((t) => {
            const legs = tripLegs(t);
            const first = legs[0]?.flight;
            return (
              <li key={t.ref} className="card trip-card">
                <div>
                  <p className="eyebrow">{t.status}</p>
                  <h2>
                    {first.from} → {first.to} {t.oneWay ? '(one way)' : '(round trip)'}
                  </h2>
                  <p className="muted">
                    {legs.map((l) => fmtDate(l.flight.date)).join(' – ')} · {t.adults.length + t.infants.length} traveler
                    {t.adults.length + t.infants.length > 1 ? 's' : ''} · {money(t.price.total)}
                  </p>
                  <p className="small">
                    Confirmation <strong>{t.ref}</strong>
                  </p>
                </div>
                <Link className="btn btn-secondary" to={tripPath(t.ref)} aria-label={`View trip ${t.ref}`}>
                  View trip
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
