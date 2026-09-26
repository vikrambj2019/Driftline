const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/* The bookable window is fixed so the site behaves identically on any real date. */
export const DATE_MIN = '2026-10-01';
export const DATE_MAX = '2027-03-31';
export const DEFAULT_DEPART = '2026-11-12';
export const DEFAULT_RETURN = '2026-11-16';

export function parseISO(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function toISO(dt) {
  return dt.toISOString().slice(0, 10);
}

export function isValidISO(iso) {
  const dt = parseISO(iso);
  return !!dt && toISO(dt) === iso;
}

export function addDays(iso, n) {
  const dt = parseISO(iso);
  dt.setUTCDate(dt.getUTCDate() + n);
  return toISO(dt);
}

export function fmtDate(iso) {
  const dt = parseISO(iso);
  if (!dt) return '';
  return `${DAYS[dt.getUTCDay()]}, ${MONTHS[dt.getUTCMonth()]} ${dt.getUTCDate()}`;
}

export function fmtDateLong(iso) {
  const dt = parseISO(iso);
  if (!dt) return '';
  return `${DAYS_LONG[dt.getUTCDay()]}, ${MONTHS_LONG[dt.getUTCMonth()]} ${dt.getUTCDate()}, ${dt.getUTCFullYear()}`;
}

export function monthLabel(year, month) {
  return `${MONTHS_LONG[month]} ${year}`;
}

export function fmtTime(minutes) {
  const m = ((minutes % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, '0');
  const ampm = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${mm} ${ampm}`;
}

export function fmtDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function money(n) {
  const sign = n < 0 ? '-' : '';
  return `${sign}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function moneyWhole(n) {
  return `$${Math.round(n).toLocaleString('en-US')}`;
}

export function yearsBetween(isoFrom, isoTo) {
  const a = parseISO(isoFrom);
  const b = parseISO(isoTo);
  if (!a || !b) return NaN;
  let years = b.getUTCFullYear() - a.getUTCFullYear();
  const beforeBirthday =
    b.getUTCMonth() < a.getUTCMonth() ||
    (b.getUTCMonth() === a.getUTCMonth() && b.getUTCDate() < a.getUTCDate());
  if (beforeBirthday) years -= 1;
  return years;
}
