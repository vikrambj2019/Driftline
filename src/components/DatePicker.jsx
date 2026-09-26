import { useEffect, useRef, useState } from 'react';
import { DATE_MAX, DATE_MIN, fmtDate, fmtDateLong, monthLabel, parseISO, toISO } from '../lib/format.js';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/** Custom calendar popover (deliberately not a native date input). */
export default function DatePicker({ id, label, value, onChange, min = DATE_MIN, max = DATE_MAX, error }) {
  const initial = parseISO(value) || parseISO(min);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState({ y: initial.getUTCFullYear(), m: initial.getUTCMonth() });
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    const d = parseISO(value);
    if (d) setView({ y: d.getUTCFullYear(), m: d.getUTCMonth() });
  }, [value]);

  const first = new Date(Date.UTC(view.y, view.m, 1));
  const daysInMonth = new Date(Date.UTC(view.y, view.m + 1, 0)).getUTCDate();
  const cells = [];
  for (let i = 0; i < first.getUTCDay(); i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(toISO(new Date(Date.UTC(view.y, view.m, d))));

  const minD = parseISO(min);
  const maxD = parseISO(max);
  const canPrev = new Date(Date.UTC(view.y, view.m, 1)) > minD;
  const canNext = new Date(Date.UTC(view.y, view.m + 1, 1)) <= maxD;
  const shift = (n) => {
    const d = new Date(Date.UTC(view.y, view.m + n, 1));
    setView({ y: d.getUTCFullYear(), m: d.getUTCMonth() });
  };

  return (
    <div className="field datepicker" ref={ref}>
      <span className="label" id={`${id}-label`}>
        {label}
      </span>
      <button
        type="button"
        id={id}
        className={`date-trigger${error ? ' invalid' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span aria-hidden="true" className="cal-icon">
          ▦
        </span>
        {value ? fmtDate(value) : 'Select date'}
      </button>
      {open && (
        <div className="calendar" role="dialog" aria-label={`Choose ${label.toLowerCase()}`}>
          <div className="cal-head">
            <button type="button" className="cal-nav" onClick={() => shift(-1)} disabled={!canPrev} aria-label="Previous month">
              ‹
            </button>
            <span className="cal-month" aria-live="polite">
              {monthLabel(view.y, view.m)}
            </span>
            <button type="button" className="cal-nav" onClick={() => shift(1)} disabled={!canNext} aria-label="Next month">
              ›
            </button>
          </div>
          <div className="cal-grid" role="grid">
            {WEEKDAYS.map((w) => (
              <span key={w} className="cal-dow" aria-hidden="true">
                {w}
              </span>
            ))}
            {cells.map((iso, i) =>
              iso ? (
                <button
                  type="button"
                  key={iso}
                  className={`cal-day${iso === value ? ' selected' : ''}`}
                  disabled={iso < min || iso > max}
                  aria-label={fmtDateLong(iso)}
                  aria-pressed={iso === value}
                  onClick={() => {
                    onChange(iso);
                    setOpen(false);
                  }}
                >
                  {Number(iso.slice(8))}
                </button>
              ) : (
                <span key={`e${i}`} />
              ),
            )}
          </div>
        </div>
      )}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
