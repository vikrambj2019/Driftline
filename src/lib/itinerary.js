import { AIRPORT, FARES, airlineName, flightById } from './data.js';
import { fmtDateLong, fmtDuration, fmtTime, money } from './format.js';

export function tripLegs(trip) {
  return trip.legs.map((l) => ({ ...l, flight: flightById(l.flightId) })).filter((l) => l.flight);
}

export function itineraryText(trip) {
  const lines = [
    'DRIFTLINE ITINERARY (synthetic demo, not a real booking)',
    `Confirmation: ${trip.ref}`,
    `Status: ${trip.status}`,
    '',
  ];
  tripLegs(trip).forEach(({ label, flight, fare }) => {
    lines.push(`${label.toUpperCase()}: ${fmtDateLong(flight.date)} · ${FARES[fare].name} fare`);
    flight.segments.forEach((s) => {
      lines.push(
        `  ${s.flightNumber} ${airlineName(flight.airline)}  ${s.from} ${fmtTime(s.dep)} -> ${s.to} ${fmtTime(s.arr)}${
          Math.floor(s.arr / 1440) ? ' (+1 day)' : ''
        }  ${fmtDuration(s.duration)}  ${AIRPORT[s.from].city} to ${AIRPORT[s.to].city}`,
      );
    });
    lines.push('');
  });
  lines.push('TRAVELERS');
  trip.adults.forEach((a) => lines.push(`  ${a.firstName} ${a.lastName} (adult, ${a.bags} checked bag${a.bags === 1 ? '' : 's'})`));
  trip.infants.forEach((a) => lines.push(`  ${a.firstName} ${a.lastName} (lap infant)`));
  lines.push('', `Contact: ${trip.contact.email}`);
  return lines.join('\n');
}

export function receiptText(trip) {
  const p = trip.price;
  return [
    'DRIFTLINE RECEIPT (synthetic demo, no payment was taken)',
    `Confirmation: ${trip.ref}`,
    '',
    `Base fare          ${money(p.base)}`,
    `Taxes and fees     ${money(p.taxes)}`,
    p.bagFees ? `Checked bags       ${money(p.bagFees)}` : null,
    p.discount ? `Promo ${p.promoCode}      ${money(-p.discount)}` : null,
    `Total              ${money(p.total)}`,
    '',
    'Paid with: demo credits',
  ]
    .filter((l) => l !== null)
    .join('\n');
}
