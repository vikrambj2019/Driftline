import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Toast, useTitle } from '../components/ui.jsx';
import { AIRPORTS } from '../lib/data.js';
import { isValidISO } from '../lib/format.js';
import { useStore } from '../lib/store.js';
import { useVariant } from '../lib/variant.jsx';

const NAME_RE = /^[A-Za-z][A-Za-z' -]*$/;

function ProfileForm() {
  const v = useVariant();
  const [state, update] = useStore(v.id);
  const [form, setForm] = useState(state.profile);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState('');
  const clearToast = useCallback(() => setToast(''), []);

  function save(e) {
    e.preventDefault();
    const errs = {};
    if (!NAME_RE.test(form.firstName.trim())) errs.firstName = 'Enter a first name using letters only.';
    if (!NAME_RE.test(form.lastName.trim())) errs.lastName = 'Enter a last name using letters only.';
    if (form.phone.replace(/\D/g, '').length < 10) errs.phone = 'Enter a phone number with at least 10 digits.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const cleaned = { ...form, firstName: form.firstName.trim(), lastName: form.lastName.trim() };
    if (!v.is('b2')) update((cur) => ({ ...cur, profile: cleaned }));
    setForm(cleaned);
    setToast('Profile saved');
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <form className="card" onSubmit={save} noValidate aria-labelledby="profile-heading">
      <h2 id="profile-heading">Profile</h2>
      <div className="grid-2">
        <div className="field">
          <label htmlFor="pf-first">First name</label>
          <input id="pf-first" value={form.firstName} onChange={set('firstName')} aria-invalid={!!errors.firstName} />
          {errors.firstName && <p className="field-error">{errors.firstName}</p>}
        </div>
        <div className="field">
          <label htmlFor="pf-last">Last name</label>
          <input id="pf-last" value={form.lastName} onChange={set('lastName')} aria-invalid={!!errors.lastName} />
          {errors.lastName && <p className="field-error">{errors.lastName}</p>}
        </div>
        <div className="field">
          <label htmlFor="pf-email">Email</label>
          <input id="pf-email" value={form.email} readOnly aria-describedby="pf-email-help" />
          <p className="muted small" id="pf-email-help">
            Contact support to change your sign-in email.
          </p>
        </div>
        <div className="field">
          <label htmlFor="pf-phone">Mobile phone</label>
          <input id="pf-phone" type="tel" value={form.phone} onChange={set('phone')} aria-invalid={!!errors.phone} />
          {errors.phone && <p className="field-error">{errors.phone}</p>}
        </div>
        <div className="field">
          <label htmlFor="pf-home">Home airport</label>
          <select id="pf-home" value={form.homeAirport} onChange={set('homeAirport')}>
            {AIRPORTS.map((a) => (
              <option key={a.code} value={a.code}>
                {a.city} ({a.code})
              </option>
            ))}
          </select>
        </div>
      </div>
      <button type="submit" className="btn btn-primary">
        Save changes
      </button>
      <Toast message={toast} onDone={clearToast} />
    </form>
  );
}

function SavedTravelers() {
  const v = useVariant();
  const [state, update] = useStore(v.id);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', dob: '' });
  const [errors, setErrors] = useState({});

  function add(e) {
    e.preventDefault();
    const errs = {};
    if (!NAME_RE.test(form.firstName.trim())) errs.firstName = 'Enter a first name.';
    if (!NAME_RE.test(form.lastName.trim())) errs.lastName = 'Enter a last name.';
    if (!isValidISO(form.dob)) errs.dob = 'Enter a date of birth.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    update((cur) => ({
      ...cur,
      savedTravelers: [...cur.savedTravelers, { id: `st-${Date.now()}`, firstName: form.firstName.trim(), lastName: form.lastName.trim(), dob: form.dob }],
    }));
    setForm({ firstName: '', lastName: '', dob: '' });
    setAdding(false);
  }

  return (
    <section className="card" aria-labelledby="st-heading">
      <h2 id="st-heading">Saved travelers</h2>
      <ul className="saved-list">
        {state.savedTravelers.map((t) => (
          <li key={t.id}>
            <span>
              {t.firstName} {t.lastName} <span className="muted small">· born {t.dob}</span>
            </span>
            <button
              type="button"
              className="linklike"
              aria-label={`Remove ${t.firstName} ${t.lastName}`}
              onClick={() => update((cur) => ({ ...cur, savedTravelers: cur.savedTravelers.filter((x) => x.id !== t.id) }))}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      {adding ? (
        <form onSubmit={add} noValidate aria-label="Add saved traveler">
          <div className="grid-3">
            <div className="field">
              <label htmlFor="st-first">First name</label>
              <input id="st-first" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              {errors.firstName && <p className="field-error">{errors.firstName}</p>}
            </div>
            <div className="field">
              <label htmlFor="st-last">Last name</label>
              <input id="st-last" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              {errors.lastName && <p className="field-error">{errors.lastName}</p>}
            </div>
            <div className="field">
              <label htmlFor="st-dob">Date of birth</label>
              <input id="st-dob" type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
              {errors.dob && <p className="field-error">{errors.dob}</p>}
            </div>
          </div>
          <div className="btn-row">
            <button type="submit" className="btn btn-primary">
              Save traveler
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setAdding(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button type="button" className="btn btn-secondary" onClick={() => setAdding(true)}>
          Add a traveler
        </button>
      )}
    </section>
  );
}

export default function Account() {
  useTitle('Account');
  const v = useVariant();
  const [state] = useStore(v.id);
  return (
    <div>
      <h1>Account</h1>
      <p className="muted">Signed in as {state.session.email}</p>
      <ProfileForm />
      <SavedTravelers />
      <section className="card">
        <h2>Business tools</h2>
        <p>
          Manage company fares and agents in the <Link to={v.to('/admin')}>admin console</Link>. Requires two-step
          verification.
        </p>
      </section>
    </div>
  );
}
