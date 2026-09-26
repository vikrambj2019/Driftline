/*
 * Deterministic synthetic flight data.
 *
 * Every (origin, destination, date) triple always produces the same flights,
 * times, and fares, so demo videos are reproducible and "the cheapest nonstop
 * arriving before 6 PM" has one computable correct answer.
 *
 * Airport codes are real IATA codes (public facts); airlines are fictional.
 * Times use fixed standard-time UTC offsets and are shown as local times.
 */

const RAW_AIRPORTS = [
  ['SFO', 'San Francisco', 'San Francisco International', 'US', 37.619, -122.375, -8, 'bay'],
  ['OAK', 'Oakland', 'Oakland International', 'US', 37.721, -122.221, -8, 'bay'],
  ['SJC', 'San Jose', 'San Jose Mineta International', 'US', 37.363, -121.929, -8, 'bay'],
  ['LAX', 'Los Angeles', 'Los Angeles International', 'US', 33.942, -118.408, -8, null],
  ['SAN', 'San Diego', 'San Diego International', 'US', 32.733, -117.19, -8, null],
  ['SEA', 'Seattle', 'Seattle-Tacoma International', 'US', 47.45, -122.309, -8, null],
  ['PDX', 'Portland', 'Portland International', 'US', 45.589, -122.597, -8, null],
  ['DEN', 'Denver', 'Denver International', 'US', 39.856, -104.674, -7, null],
  ['PHX', 'Phoenix', 'Phoenix Sky Harbor International', 'US', 33.437, -112.008, -7, null],
  ['ORD', 'Chicago', "Chicago O'Hare International", 'US', 41.978, -87.905, -6, null],
  ['DFW', 'Dallas', 'Dallas/Fort Worth International', 'US', 32.897, -97.038, -6, null],
  ['AUS', 'Austin', 'Austin-Bergstrom International', 'US', 30.197, -97.666, -6, null],
  ['ATL', 'Atlanta', 'Hartsfield-Jackson Atlanta International', 'US', 33.64, -84.427, -5, null],
  ['MIA', 'Miami', 'Miami International', 'US', 25.795, -80.287, -5, null],
  ['BOS', 'Boston', 'Boston Logan International', 'US', 42.365, -71.009, -5, null],
  ['JFK', 'New York', 'John F. Kennedy International', 'US', 40.641, -73.778, -5, 'nyc'],
  ['LGA', 'New York', 'LaGuardia', 'US', 40.777, -73.872, -5, 'nyc'],
  ['EWR', 'Newark', 'Newark Liberty International', 'US', 40.689, -74.174, -5, 'nyc'],
  ['YVR', 'Vancouver', 'Vancouver International', 'CA', 49.195, -123.184, -8, null],
  ['MEX', 'Mexico City', 'Mexico City International', 'MX', 19.436, -99.072, -6, null],
  ['LHR', 'London', 'Heathrow', 'GB', 51.47, -0.454, 0, null],
  ['CDG', 'Paris', 'Charles de Gaulle', 'FR', 49.009, 2.548, 1, null],
  ['NRT', 'Tokyo', 'Narita International', 'JP', 35.772, 140.393, 9, null],
];

export const AIRPORTS = RAW_AIRPORTS.map(([code, city, name, country, lat, lon, tz, area]) => ({
  code, city, name, country, lat, lon, tz, area,
}));

export const AIRPORT = Object.fromEntries(AIRPORTS.map((a) => [a.code, a]));

export const AREA_NAMES = { bay: 'San Francisco Bay Area', nyc: 'New York area' };

export const AIRLINES = [
  { code: 'PC', name: 'Pinecrest Air' },
  { code: 'BF', name: 'Bluefin Airways' },
  { code: 'NL', name: 'Northlight' },
  { code: 'CW', name: 'Coastwise' },
  { code: 'HJ', name: 'Harbor Jet' },
];
const AIRLINE = Object.fromEntries(AIRLINES.map((a) => [a.code, a]));

export const COUNTRIES = { US: 'United States', CA: 'Canada', MX: 'Mexico', GB: 'United Kingdom', FR: 'France', JP: 'Japan' };

export const FARES = {
  basic: {
    code: 'basic',
    name: 'Basic',
    perks: ['Personal item only', 'Seat assigned at check-in', 'No changes or refunds'],
    carryOn: false,
    bagFee: [40, 45],
  },
  main: {
    code: 'main',
    name: 'Main',
    perks: ['Carry-on bag included', 'Choose your seat', 'Changes allowed, fare difference applies'],
    carryOn: true,
    bagFee: [35, 45],
  },
  premium: {
    code: 'premium',
    name: 'Premium',
    perks: ['1st checked bag included', 'Extra legroom seat', 'Free changes', 'Priority boarding'],
    carryOn: true,
    bagFee: [0, 45],
  },
};

export function airportLabel(code) {
  const a = AIRPORT[code];
  return a ? `${a.city} (${a.code})` : code;
}

export function searchAirports(text) {
  const q = text.trim().toLowerCase();
  if (!q) return [];
  return AIRPORTS.filter(
    (a) =>
      a.code.toLowerCase().startsWith(q) ||
      a.city.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q),
  ).slice(0, 7);
}

export function isInternational(from, to) {
  return AIRPORT[from]?.country !== AIRPORT[to]?.country;
}

export function nearbyAirports(code) {
  const a = AIRPORT[code];
  if (!a?.area) return [code];
  return AIRPORTS.filter((x) => x.area === a.area).map((x) => x.code);
}

/* ---------- deterministic randomness ---------- */

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function miles(a, b) {
  const R = 3958.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

const airMinutes = (m) => Math.round((m / 7.8 + 35) / 5) * 5;
const roundNine = (x) => Math.max(39, Math.round(x / 10) * 10 - 1);
const SECONDARY = new Set(['OAK', 'SJC', 'LGA', 'EWR']);
const HUBS = ['DEN', 'ORD', 'DFW', 'ATL', 'SEA', 'PHX'];
const FORCED_NONSTOP = new Set([1, 4, 9, 13]);
const FORCED_CONNECT = new Set([3, 11]);
const FLIGHTS_PER_DAY = 16;

function pickHub(A, B, rng) {
  const direct = miles(A, B);
  const options = HUBS.filter((h) => h !== A.code && h !== B.code).map((h) => {
    const H = AIRPORT[h];
    return { H, detour: (miles(A, H) + miles(H, B)) / direct };
  });
  const good = options.filter((o) => o.detour < 1.3);
  const pool = good.length ? good : [options.sort((x, y) => x.detour - y.detour)[0]];
  return pool[Math.floor(rng() * pool.length)].H;
}

function segment(from, to, depLocal, airline, rng) {
  const dur = airMinutes(miles(from, to));
  return {
    from: from.code,
    to: to.code,
    dep: depLocal,
    arr: depLocal + dur + (to.tz - from.tz) * 60,
    duration: dur,
    flightNumber: `${airline.code} ${100 + Math.floor(rng() * 1800)}`,
  };
}

/** All flights for one origin, destination, and date. Deterministic. */
export function flightsFor(from, to, date) {
  const A = AIRPORT[from];
  const B = AIRPORT[to];
  if (!A || !B || from === to || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  const rng = mulberry32(hash(`${from}|${to}|${date}`));
  const distance = miles(A, B);
  const intl = A.country !== B.country;
  const flights = [];

  for (let i = 0; i < FLIGHTS_PER_DAY; i++) {
    const airline = AIRLINES[Math.floor(rng() * AIRLINES.length)];
    const dep = Math.min(1410, 360 + Math.round((i * (1050 / (FLIGHTS_PER_DAY - 1))) / 5) * 5 + Math.floor(rng() * 4) * 5);
    const nonstopChance = distance < 700 ? 0.85 : 0.5;
    const nonstop = FORCED_NONSTOP.has(i) || (!FORCED_CONNECT.has(i) && rng() < nonstopChance);

    let segments;
    if (nonstop) {
      segments = [segment(A, B, dep, airline, rng)];
    } else {
      const H = pickHub(A, B, rng);
      const first = segment(A, H, dep, airline, rng);
      const layover = 45 + Math.floor(rng() * 22) * 5;
      const second = segment(H, B, first.arr + layover, airline, rng);
      segments = [first, { ...second, layover }];
    }

    const last = segments[segments.length - 1];
    const arr = last.arr;
    const duration = arr - dep - (B.tz - A.tz) * 60;

    let price = 59 + distance * 0.09;
    if (intl) price *= 1.35;
    if (nonstop) price *= 1.18;
    if ((dep >= 420 && dep < 540) || (dep >= 1020 && dep < 1140)) price *= 1.1;
    if (dep >= 1290) price *= 0.82;
    if (SECONDARY.has(from)) price *= 0.86;
    if (SECONDARY.has(to)) price *= 0.86;
    price *= 0.82 + rng() * 0.5;

    const main = roundNine(price);
    const basic = roundNine(main - (25 + rng() * 35));
    const premium = roundNine(main * 1.85);
    const seatsLeft = rng() < 0.22 ? 1 + Math.floor(rng() * 4) : null;

    flights.push({
      id: `${from}-${to}-${date.replaceAll('-', '')}-${String(i).padStart(2, '0')}`,
      index: i,
      from,
      to,
      date,
      airline: airline.code,
      airlineName: airline.name,
      dep,
      arr,
      dayOffset: Math.floor(arr / 1440),
      duration,
      stops: segments.length - 1,
      segments,
      fares: { basic, main, premium },
      seatsLeft,
    });
  }
  return flights;
}

/** Look up a single flight from its ID (IDs encode route, date, and index). */
export function flightById(id) {
  const m = /^([A-Z]{3})-([A-Z]{3})-(\d{4})(\d{2})(\d{2})-(\d{2})$/.exec(id || '');
  if (!m) return null;
  const [, from, to, y, mo, d, idx] = m;
  return flightsFor(from, to, `${y}-${mo}-${d}`)[Number(idx)] || null;
}

export function airlineName(code) {
  return AIRLINE[code]?.name || code;
}

/** Search results, optionally across nearby airports on both ends. */
export function searchFlights(from, to, date, nearby) {
  const origins = nearby ? nearbyAirports(from) : [from];
  const dests = nearby ? nearbyAirports(to) : [to];
  const out = [];
  origins.forEach((o) => dests.forEach((d) => out.push(...flightsFor(o, d, date))));
  return out.sort((a, b) => a.dep - b.dep || a.id.localeCompare(b.id));
}
