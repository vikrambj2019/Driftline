import { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useVariant } from '../lib/variant.jsx';
import { useStore } from '../lib/store.js';

export function useTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Driftline` : 'Driftline';
  }, [title]);
}

export function Spinner({ label = 'Loading…' }) {
  return (
    <div className="spinner-row" role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function LoadingOverlay({ label }) {
  return (
    <div className="overlay" role="status" aria-live="polite">
      <div className="overlay-card">
        <span className="spinner spinner-lg" aria-hidden="true" />
        <p>{label}</p>
      </div>
    </div>
  );
}

export function Toast({ message, onDone }) {
  useEffect(() => {
    if (!message) return undefined;
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [message, onDone]);
  if (!message) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      <span aria-hidden="true">✓</span> {message}
    </div>
  );
}

export function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p className="field-error" id={id}>
      {message}
    </p>
  );
}

export function ErrorSummary({ errors }) {
  const ref = useRef(null);
  const list = Object.values(errors || {}).filter(Boolean);
  useEffect(() => {
    if (list.length) ref.current?.focus();
  }, [list.length]);
  if (!list.length) return null;
  return (
    <div className="alert alert-error" role="alert" tabIndex={-1} ref={ref}>
      <strong>Please fix the following:</strong>
      <ul>
        {list.map((m) => (
          <li key={m}>{m}</li>
        ))}
      </ul>
    </div>
  );
}

const STEPS = ['Departing flight', 'Returning flight', 'Travelers', 'Review & book'];

export function StepBar({ current, oneWay }) {
  const steps = oneWay ? [STEPS[0], STEPS[2], STEPS[3]] : STEPS;
  const idx = oneWay ? [0, null, 1, 2][current] : current;
  return (
    <ol className="stepbar" aria-label="Booking progress">
      {steps.map((s, i) => (
        <li key={s} className={i === idx ? 'active' : i < idx ? 'done' : ''} aria-current={i === idx ? 'step' : undefined}>
          <span className="step-num">{i + 1}</span> {s}
        </li>
      ))}
    </ol>
  );
}

export function RequireLogin({ children }) {
  const v = useVariant();
  const [state] = useStore(v.id);
  const loc = useLocation();
  if (!state.session) {
    const next = encodeURIComponent(loc.pathname + loc.search);
    return <Navigate to={`${v.to('/login')}?next=${next}`} replace />;
  }
  return children;
}

export function Modal({ title, children, onClose, labelledBy = 'modal-title' }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
        <h2 id={labelledBy}>{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function useDelayedFlag(ms, deps = []) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDone(false);
    const t = setTimeout(() => setDone(true), ms);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return done;
}

export function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
