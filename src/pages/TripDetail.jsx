import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { LegSummary } from '../components/FlightSummary.jsx';
import { Modal, downloadText, useTitle } from '../components/ui.jsx';
import { itineraryText, receiptText, tripLegs } from '../lib/itinerary.js';
import { useStore } from '../lib/store.js';
import { useVariant } from '../lib/variant.jsx';
import { PriceBreakdown } from './Review.jsx';
import NotFound from './NotFound.jsx';

export default function TripDetail() {
  const v = useVariant();
  const { ref } = useParams();
  const [state, update] = useStore(v.id);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const trip = state.trips.find((t) => t.ref === ref);
  useTitle(trip ? `Trip ${trip.ref}` : 'Trip not found');
  if (!trip) return <NotFound />;
  const legs = tripLegs(trip);

  return (
    <div>
      <p>
        <Link to={v.to('/trips')}>← All trips</Link>
      </p>
      <h1>
        Trip {trip.ref} <span className={`status status-${trip.status.toLowerCase()}`}>{trip.status}</span>
      </h1>
      <div className="two-col">
        <div>
          <section className="card">
            <h2>Flights</h2>
            {legs.map((l) => (
              <LegSummary key={l.label} label={l.label} flight={l.flight} fare={l.fare} />
            ))}
          </section>
          <section className="card">
            <h2>Travelers</h2>
            <ul className="plain">
              {trip.adults.map((a, i) => (
                <li key={`a${i}`}>
                  {a.firstName} {a.lastName} <span className="muted">· adult</span>
                </li>
              ))}
              {trip.infants.map((a, i) => (
                <li key={`i${i}`}>
                  {a.firstName} {a.lastName} <span className="muted">· lap infant</span>
                </li>
              ))}
            </ul>
          </section>
          <div className="btn-row">
            <button type="button" className="btn btn-secondary" onClick={() => downloadText(`driftline-itinerary-${trip.ref}.txt`, itineraryText(trip))}>
              Download itinerary
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => downloadText(`driftline-receipt-${trip.ref}.txt`, receiptText(trip))}>
              Download receipt
            </button>
            {trip.status === 'Confirmed' && (
              <button type="button" className="btn btn-danger" onClick={() => setConfirmCancel(true)}>
                Cancel trip
              </button>
            )}
          </div>
        </div>
        <aside className="card">
          <h2>Price details</h2>
          <PriceBreakdown price={trip.price} adults={trip.adults.length} infants={trip.infants.length} legs={legs} />
        </aside>
      </div>
      {confirmCancel && (
        <Modal title={`Cancel trip ${trip.ref}?`} onClose={() => setConfirmCancel(false)}>
          <p>This cancels every flight on this trip. Demo credits are refunded.</p>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setConfirmCancel(false)}>
              Keep trip
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                update((cur) => ({ ...cur, trips: cur.trips.map((t) => (t.ref === trip.ref ? { ...t, status: 'Cancelled' } : t)) }));
                setConfirmCancel(false);
              }}
            >
              Yes, cancel trip
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
