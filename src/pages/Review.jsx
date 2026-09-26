import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LegSummary } from '../components/FlightSummary.jsx';
import { LoadingOverlay, StepBar, useTitle } from '../components/ui.jsx';
import { FARES } from '../lib/data.js';
import { money } from '../lib/format.js';
import { priceTrip } from '../lib/pricing.js';
import { useStore } from '../lib/store.js';
import { buildQuery, readSearch, selectedLegs } from '../lib/trip.js';
import { useVariant } from '../lib/variant.jsx';

export const DEMO_CREDITS = 5000;

export function makeRef(n) {
  return `DL${(n * 7919 + 104729).toString(36).toUpperCase()}`;
}

export function PriceBreakdown({ price, adults, infants, legs }) {
  return (
    <table className="price-table" aria-label="Price breakdown">
      <tbody>
        <tr>
          <th scope="row">
            Base fare
            <span className="muted small block">
              {legs.map((l) => FARES[l.fare].name).join(' + ')} · {adults} adult{adults > 1 ? 's' : ''}
              {infants ? ` + ${infants} lap infant${infants > 1 ? 's' : ''}` : ''}
            </span>
          </th>
          <td>{money(price.base)}</td>
        </tr>
        <tr>
          <th scope="row">
            Taxes and fees
            <span className="muted small block">
              Ticket tax {money(price.taxBreakdown.taxPct)} · Segment fees {money(price.taxBreakdown.segmentFees)}
              {price.taxBreakdown.intlFees ? ` · International fees ${money(price.taxBreakdown.intlFees)}` : ''}
            </span>
          </th>
          <td>{money(price.taxes)}</td>
        </tr>
        {price.bagFees > 0 && (
          <tr>
            <th scope="row">Checked bags</th>
            <td>{money(price.bagFees)}</td>
          </tr>
        )}
        {price.discount > 0 && (
          <tr className="discount">
            <th scope="row">Promo {price.promoCode}</th>
            <td>{money(-price.discount)}</td>
          </tr>
        )}
        <tr className="total">
          <th scope="row">Total</th>
          <td data-testid="trip-total">{money(price.total)}</td>
        </tr>
      </tbody>
    </table>
  );
}

export default function Review() {
  useTitle('Review and book');
  const v = useVariant();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [state, update] = useStore(v.id);
  const s = readSearch(params);
  const legs = selectedLegs(s);
  const draft = state.draft && state.draft.key === buildQuery(s) ? state.draft : null;

  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState('');
  const [agree, setAgree] = useState(false);
  const [agreeError, setAgreeError] = useState('');
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');

  if (!legs || !draft) {
    return (
      <section>
        <h1>Review and book</h1>
        <p className="alert alert-error" role="alert">
          We couldn’t find your traveler details. Please go back and enter them again.
        </p>
        {legs ? (
          <Link className="btn btn-primary" to={`${v.to('/book/travelers')}?${buildQuery(s)}`}>
            Enter traveler details
          </Link>
        ) : (
          <Link className="btn btn-primary" to={v.to('/')}>
            Search flights
          </Link>
        )}
      </section>
    );
  }

  const price = priceTrip({
    legs,
    adults: s.adults,
    infants: s.infants,
    bags: draft.adults.map((a) => a.bags),
    promo,
    ignorePromoInTotal: v.is('b6'),
  });

  function saveTrip(current) {
    const n = current.seq + 1;
    const trip = {
      ref: makeRef(n),
      seq: n,
      query: buildQuery(s),
      oneWay: s.oneWay,
      legs: legs.map((l) => ({ flightId: l.flight.id, fare: l.fare, label: l.label })),
      adults: draft.adults.map(({ firstName, lastName, bags }) => ({ firstName, lastName, bags })),
      infants: draft.infants.map(({ firstName, lastName }) => ({ firstName, lastName })),
      contact: draft.contact,
      price,
      status: 'Confirmed',
    };
    return { ...current, seq: n, trips: [trip, ...current.trips], draft: null, _lastRef: trip.ref };
  }

  function confirm(e) {
    e.preventDefault();
    setFailure('');
    if (!agree) {
      setAgreeError('Please confirm you have read the fare rules and traveler details.');
      return;
    }
    setAgreeError('');
    setBusy(true);
    if (v.is('w2')) {
      setTimeout(() => {
        // The booking is recorded, but the page reports a failure.
        update((cur) => {
          const next = saveTrip(cur);
          return { ...next, draft: cur.draft };
        });
        setBusy(false);
        setFailure('We couldn’t confirm your booking because the request timed out. Please try again.');
      }, 3000);
      return;
    }
    setTimeout(() => {
      let ref = null;
      update((cur) => {
        const next = saveTrip(cur);
        ref = next._lastRef;
        return next;
      });
      navigate(v.to(`/book/confirmation/${ref}`));
    }, 800);
  }

  return (
    <div className="review-page">
      <StepBar current={3} oneWay={s.oneWay} />
      <h1>Review and book</h1>

      <div className="two-col">
        <div>
          <section className="card">
            <h2>Flights</h2>
            {legs.map((l) => (
              <LegSummary key={l.label} label={l.label} flight={l.flight} fare={l.fare} />
            ))}
            <p className="small">
              <Link to={`${v.to('/flights')}?${buildQuery(s, { leg: 'out', out: '', outFare: '', retId: '', retFare: '' })}`}>
                Change flights
              </Link>
            </p>
          </section>

          <section className="card">
            <h2>Travelers</h2>
            <ul className="plain">
              {draft.adults.map((a, i) => (
                <li key={`a${i}`}>
                  {a.firstName} {a.lastName} <span className="muted">· adult · {a.bags} checked bag{a.bags === 1 ? '' : 's'}</span>
                </li>
              ))}
              {draft.infants.map((a, i) => (
                <li key={`i${i}`}>
                  {a.firstName} {a.lastName} <span className="muted">· lap infant</span>
                </li>
              ))}
            </ul>
            <p className="muted small">
              Confirmation will be sent to {draft.contact.email}.{' '}
              <Link to={`${v.to('/book/travelers')}?${buildQuery(s)}`}>Edit travelers</Link>
            </p>
          </section>

          <form className="card" onSubmit={confirm} noValidate aria-label="Payment and confirmation">
            <h2>Payment</h2>
            <fieldset>
              <legend className="visually-hidden">Payment method</legend>
              <label className="check">
                <input type="radio" name="payment" defaultChecked /> Pay with demo credits{' '}
                <span className="muted">(balance {money(DEMO_CREDITS)})</span>
              </label>
            </fieldset>
            <p className="muted small">This is a synthetic site. No card details are collected and no money changes hands.</p>
            <label className="check">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                aria-invalid={!!agreeError}
                aria-describedby={agreeError ? 'agree-err' : undefined}
              />
              I’ve reviewed the traveler details and accept the{' '}
              <a href={v.to(`/fare-rules/${legs[0].fare}`)} target="_blank" rel="noopener">
                fare rules
              </a>
              .
            </label>
            {agreeError && (
              <p className="field-error" id="agree-err">
                {agreeError}
              </p>
            )}
            {failure && (
              <div className="alert alert-error" role="alert">
                {failure}
              </div>
            )}
            <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>
              Confirm and book · {money(price.total)}
            </button>
          </form>
        </div>

        <aside className="card sticky" aria-label="Price summary">
          <h2>Price details</h2>
          <PriceBreakdown price={price} adults={s.adults} infants={s.infants} legs={legs} />
          <form
            className="promo-form"
            onSubmit={(e) => {
              e.preventDefault();
              setPromo(promoInput);
            }}
            aria-label="Apply a promo code"
          >
            <label htmlFor="promo">Promo code</label>
            <div className="inline-row">
              <input id="promo" value={promoInput} onChange={(e) => setPromoInput(e.target.value)} aria-invalid={!!price.promoError} />
              <button type="submit" className="btn btn-secondary">
                Apply
              </button>
            </div>
            {price.promoError && <p className="field-error">{price.promoError}</p>}
            {price.promoCode && <p className="field-ok">Promo {price.promoCode} applied.</p>}
          </form>
        </aside>
      </div>
      {busy && <LoadingOverlay label="Confirming your booking…" />}
    </div>
  );
}
