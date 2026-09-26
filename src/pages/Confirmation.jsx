import { Link, useParams } from 'react-router-dom';
import { LegSummary } from '../components/FlightSummary.jsx';
import { downloadText, useTitle } from '../components/ui.jsx';
import { money } from '../lib/format.js';
import { itineraryText, receiptText, tripLegs } from '../lib/itinerary.js';
import { useStore } from '../lib/store.js';
import { useVariant } from '../lib/variant.jsx';
import NotFound from './NotFound.jsx';

export default function Confirmation() {
  const v = useVariant();
  const { ref } = useParams();
  const [state] = useStore(v.id);
  const trip = state.trips.find((t) => t.ref === ref);
  useTitle(trip ? `Booking confirmed ${trip.ref}` : 'Booking not found');
  if (!trip) return <NotFound />;

  return (
    <div className="confirm-page">
      <section className="card confirm-hero">
        <p className="confirm-check" aria-hidden="true">
          ✓
        </p>
        <h1>Booking confirmed</h1>
        <p>
          Confirmation number <strong className="ref">{trip.ref}</strong>
        </p>
        <p className="muted">A confirmation would be sent to {trip.contact.email}. (This is a demo, so no email is sent.)</p>
      </section>

      <section className="card">
        <h2>Itinerary</h2>
        {tripLegs(trip).map((l) => (
          <LegSummary key={l.label} label={l.label} flight={l.flight} fare={l.fare} />
        ))}
        <p>
          Total paid: <strong>{money(trip.price.total)}</strong> in demo credits
        </p>
        <div className="btn-row">
          <button type="button" className="btn btn-secondary" onClick={() => downloadText(`driftline-itinerary-${trip.ref}.txt`, itineraryText(trip))}>
            Download itinerary
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => downloadText(`driftline-receipt-${trip.ref}.txt`, receiptText(trip))}>
            Download receipt
          </button>
          <Link className="btn btn-primary" to={v.to('/trips')}>
            Go to My trips
          </Link>
        </div>
      </section>
    </div>
  );
}
