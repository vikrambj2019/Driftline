import { AIRPORT, flightById } from './data.js';
import { DEFAULT_DEPART, isValidISO } from './format.js';

/** Search + selection state lives in the URL so every step is linkable. */
export function readSearch(params) {
  const get = (k, d = '') => params.get(k) ?? d;
  const s = {
    trip: get('trip', 'round') === 'oneway' ? 'oneway' : 'round',
    from: get('from').toUpperCase(),
    to: get('to').toUpperCase(),
    depart: get('depart', DEFAULT_DEPART),
    ret: get('return'),
    adults: clampInt(get('adults', '1'), 1, 6),
    infants: clampInt(get('infants', '0'), 0, 2),
    cabin: get('cabin', 'economy'),
    nearby: get('nearby') === '1',
    leg: get('leg', 'out') === 'ret' ? 'ret' : 'out',
    out: get('out'),
    outFare: get('outFare'),
    retId: get('ret'),
    retFare: get('retFare'),
  };
  s.oneWay = s.trip === 'oneway';
  s.valid =
    !!AIRPORT[s.from] && !!AIRPORT[s.to] && s.from !== s.to && isValidISO(s.depart) && (s.oneWay || (isValidISO(s.ret) && s.ret >= s.depart));
  return s;
}

function clampInt(v, lo, hi) {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return lo;
  return Math.min(hi, Math.max(lo, n));
}

/** Build a query string from a search object plus overrides. */
export function buildQuery(s, overrides = {}) {
  const merged = { ...s, ...overrides };
  const q = new URLSearchParams();
  q.set('trip', merged.trip);
  q.set('from', merged.from);
  q.set('to', merged.to);
  q.set('depart', merged.depart);
  if (merged.trip === 'round' && merged.ret) q.set('return', merged.ret);
  q.set('adults', String(merged.adults));
  if (merged.infants) q.set('infants', String(merged.infants));
  if (merged.cabin && merged.cabin !== 'economy') q.set('cabin', merged.cabin);
  if (merged.nearby) q.set('nearby', '1');
  if (merged.leg === 'ret') q.set('leg', 'ret');
  if (merged.out) q.set('out', merged.out);
  if (merged.outFare) q.set('outFare', merged.outFare);
  if (merged.retId) q.set('ret', merged.retId);
  if (merged.retFare) q.set('retFare', merged.retFare);
  return q.toString();
}

/** Resolve the selected legs from a search object. Returns null if incomplete. */
export function selectedLegs(s) {
  const out = flightById(s.out);
  if (!out || !['basic', 'main', 'premium'].includes(s.outFare)) return null;
  const legs = [{ flight: out, fare: s.outFare, label: 'Departing' }];
  if (!s.oneWay) {
    const ret = flightById(s.retId);
    if (!ret || !['basic', 'main', 'premium'].includes(s.retFare)) return null;
    legs.push({ flight: ret, fare: s.retFare, label: 'Returning' });
  }
  return legs;
}
