import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LegSummary } from '../components/FlightSummary.jsx';
import { ErrorSummary, LoadingOverlay, StepBar, useTitle } from '../components/ui.jsx';
import { COUNTRIES } from '../lib/data.js';
import { addDays, fmtDate, isValidISO, yearsBetween } from '../lib/format.js';
import { priceTrip } from '../lib/pricing.js';
import { useStore } from '../lib/store.js';
import { buildQuery, readSearch, selectedLegs } from '../lib/trip.js';
import { useVariant } from '../lib/variant.jsx';

const NAME_RE = /^[A-Za-z][A-Za-z' -]*$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const blankAdult = () => ({ firstName: '', lastName: '', dob: '', passportNumber: '', passportCountry: 'US', passportExpiry: '', bags: 0, scan: '' });
const blankInfant = () => ({ firstName: '', lastName: '', dob: '' });

export default function Travelers() {
  useTitle('Traveler details');
  const v = useVariant();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [state, update] = useStore(v.id);
  const s = readSearch(params);
  const legs = selectedLegs(s);

  const sameTrip = state.draft && state.draft.key === buildQuery(s);
  const [adults, setAdults] = useState(() =>
    sameTrip ? state.draft.adults : Array.from({ length: s.adults }, blankAdult),
  );
  const [infants, setInfants] = useState(() =>
    sameTrip ? state.draft.infants : Array.from({ length: s.infants }, blankInfant),
  );
  const [contact, setContact] = useState(() =>
    sameTrip ? state.draft.contact : { email: state.session ? state.profile.email : '', phone: state.session ? state.profile.phone : '' },
  );
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  if (!legs) {
    return (
      <section>
        <h1>Traveler details</h1>
        <p className="alert alert-error" role="alert">
          Your flight selection is incomplete. Please start a new search.
        </p>
        <Link className="btn btn-primary" to={v.to('/')}>
          Search flights
        </Link>
      </section>
    );
  }

  const intl = priceTrip({ legs, adults: s.adults, infants: s.infants }).intl;
  const lastDate = s.oneWay ? s.depart : s.ret;
  const passportCutoff = addDays(lastDate, 182);

  const setA = (i, k, val) => setAdults((list) => list.map((a, j) => (j === i ? { ...a, [k]: val } : a)));
  const setI = (i, k, val) => setInfants((list) => list.map((a, j) => (j === i ? { ...a, [k]: val } : a)));

  function validate() {
    const e = {};
    adults.forEach((a, i) => {
      const who = `Traveler ${i + 1}`;
      if (!a.firstName.trim()) e[`a${i}-firstName`] = `${who}: enter a first name.`;
      else if (!NAME_RE.test(a.firstName.trim())) e[`a${i}-firstName`] = `${who}: first name can only contain letters, spaces, hyphens, and apostrophes.`;
      if (!a.lastName.trim()) e[`a${i}-lastName`] = `${who}: enter a last name.`;
      else if (!NAME_RE.test(a.lastName.trim())) e[`a${i}-lastName`] = `${who}: last name can only contain letters, spaces, hyphens, and apostrophes.`;
      if (!isValidISO(a.dob)) e[`a${i}-dob`] = `${who}: enter a date of birth.`;
      else if (yearsBetween(a.dob, s.depart) < 12) e[`a${i}-dob`] = `${who}: adults must be at least 12 years old on the travel date.`;
      if (intl) {
        if (!/^[A-Z0-9]{6,9}$/i.test(a.passportNumber.trim())) e[`a${i}-passportNumber`] = `${who}: passport number must be 6 to 9 letters or digits.`;
        if (!isValidISO(a.passportExpiry)) e[`a${i}-passportExpiry`] = `${who}: enter the passport expiration date.`;
        else if (!v.is('b3') && a.passportExpiry < passportCutoff)
          e[`a${i}-passportExpiry`] = `${who}: passport must be valid for at least 6 months after your last travel date (${fmtDate(passportCutoff)}).`;
      }
    });
    infants.forEach((a, i) => {
      const who = `Infant ${i + 1}`;
      if (!a.firstName.trim()) e[`i${i}-firstName`] = `${who}: enter a first name.`;
      if (!a.lastName.trim()) e[`i${i}-lastName`] = `${who}: enter a last name.`;
      if (!isValidISO(a.dob)) e[`i${i}-dob`] = `${who}: enter a date of birth.`;
      else if (a.dob > s.depart) e[`i${i}-dob`] = `${who}: date of birth can't be after the travel date.`;
      else if (yearsBetween(a.dob, lastDate) >= 2) e[`i${i}-dob`] = `${who}: lap infants must be under 2 years old for the whole trip.`;
    });
    if (!EMAIL_RE.test(contact.email.trim())) e.email = 'Enter a valid email address for your confirmation.';
    if (contact.phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a phone number with at least 10 digits.';
    return e;
  }

  function submit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    update({ draft: { key: buildQuery(s), adults, infants, contact } });
    setBusy(true);
    setTimeout(() => navigate(`${v.to('/book/review')}?${buildQuery(s)}`), 1000);
  }

  const err = (k) => errors[k];
  const inputProps = (k) => ({ 'aria-invalid': !!err(k), 'aria-describedby': err(k) ? `${k}-err` : undefined });
  const fieldErr = (k) => (err(k) ? <p className="field-error" id={`${k}-err`}>{err(k)}</p> : null);

  return (
    <div className="travelers-page">
      <StepBar current={2} oneWay={s.oneWay} />
      <h1>Who’s traveling?</h1>
      <p className="muted">Enter names exactly as they appear on each traveler’s government-issued ID.</p>

      <div className="two-col">
        <form onSubmit={submit} noValidate aria-label="Traveler details">
          <ErrorSummary errors={errors} />

          {adults.map((a, i) => (
            <fieldset key={`a${i}`} className="card traveler">
              <legend>
                Traveler {i + 1} <span className="muted">(adult)</span>
              </legend>
              {state.session && state.savedTravelers.length > 0 && (
                <div className="field">
                  <label htmlFor={`a${i}-saved`}>Fill from saved traveler</label>
                  <select
                    id={`a${i}-saved`}
                    defaultValue=""
                    onChange={(e) => {
                      const st = state.savedTravelers.find((x) => x.id === e.target.value);
                      if (st) setAdults((list) => list.map((x, j) => (j === i ? { ...x, firstName: st.firstName, lastName: st.lastName, dob: st.dob } : x)));
                    }}
                  >
                    <option value="">Choose…</option>
                    {state.savedTravelers.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.firstName} {st.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid-2">
                <div className="field">
                  <label htmlFor={`a${i}-firstName`}>First name</label>
                  <input id={`a${i}-firstName`} autoComplete="given-name" value={a.firstName} onChange={(e) => setA(i, 'firstName', e.target.value)} {...inputProps(`a${i}-firstName`)} />
                  {fieldErr(`a${i}-firstName`)}
                </div>
                <div className="field">
                  <label htmlFor={`a${i}-lastName`}>Last name</label>
                  <input id={`a${i}-lastName`} autoComplete="family-name" value={a.lastName} onChange={(e) => setA(i, 'lastName', e.target.value)} {...inputProps(`a${i}-lastName`)} />
                  {fieldErr(`a${i}-lastName`)}
                </div>
                <div className="field">
                  <label htmlFor={`a${i}-dob`}>Date of birth</label>
                  <input id={`a${i}-dob`} type="date" value={a.dob} onChange={(e) => setA(i, 'dob', e.target.value)} {...inputProps(`a${i}-dob`)} />
                  {fieldErr(`a${i}-dob`)}
                </div>
                <div className="field">
                  <label htmlFor={`a${i}-bags`}>Checked bags (each way)</label>
                  <select id={`a${i}-bags`} value={a.bags} onChange={(e) => setA(i, 'bags', Number(e.target.value))}>
                    <option value={0}>0</option>
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                  </select>
                </div>
              </div>

              {intl && (
                <div className="passport">
                  <h3>Passport</h3>
                  <p className="muted small">Required for international travel.</p>
                  <div className="grid-2">
                    <div className="field">
                      <label htmlFor={`a${i}-passportNumber`}>Passport number</label>
                      <input id={`a${i}-passportNumber`} value={a.passportNumber} onChange={(e) => setA(i, 'passportNumber', e.target.value)} {...inputProps(`a${i}-passportNumber`)} />
                      {fieldErr(`a${i}-passportNumber`)}
                    </div>
                    <div className="field">
                      <label htmlFor={`a${i}-passportCountry`}>Issuing country</label>
                      <select id={`a${i}-passportCountry`} value={a.passportCountry} onChange={(e) => setA(i, 'passportCountry', e.target.value)}>
                        {Object.entries(COUNTRIES).map(([code, name]) => (
                          <option key={code} value={code}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor={`a${i}-passportExpiry`}>Expiration date</label>
                      <input id={`a${i}-passportExpiry`} type="date" value={a.passportExpiry} onChange={(e) => setA(i, 'passportExpiry', e.target.value)} {...inputProps(`a${i}-passportExpiry`)} />
                      {fieldErr(`a${i}-passportExpiry`)}
                    </div>
                    <div className="field">
                      <label htmlFor={`a${i}-scan`}>Passport photo page (optional)</label>
                      <input
                        id={`a${i}-scan`}
                        type="file"
                        accept="image/png,image/jpeg,application/pdf"
                        onChange={(e) => setA(i, 'scan', e.target.files?.[0]?.name || '')}
                      />
                      {a.scan && <p className="field-ok">Attached: {a.scan}</p>}
                    </div>
                  </div>
                </div>
              )}
            </fieldset>
          ))}

          {infants.map((a, i) => (
            <fieldset key={`i${i}`} className="card traveler">
              <legend>
                Infant {i + 1} <span className="muted">(on the lap of Traveler {i + 1})</span>
              </legend>
              <div className="grid-2">
                <div className="field">
                  <label htmlFor={`i${i}-firstName`}>First name</label>
                  <input id={`i${i}-firstName`} value={a.firstName} onChange={(e) => setI(i, 'firstName', e.target.value)} {...inputProps(`i${i}-firstName`)} />
                  {fieldErr(`i${i}-firstName`)}
                </div>
                <div className="field">
                  <label htmlFor={`i${i}-lastName`}>Last name</label>
                  <input id={`i${i}-lastName`} value={a.lastName} onChange={(e) => setI(i, 'lastName', e.target.value)} {...inputProps(`i${i}-lastName`)} />
                  {fieldErr(`i${i}-lastName`)}
                </div>
                <div className="field">
                  <label htmlFor={`i${i}-dob`}>Date of birth</label>
                  <input id={`i${i}-dob`} type="date" value={a.dob} onChange={(e) => setI(i, 'dob', e.target.value)} {...inputProps(`i${i}-dob`)} />
                  {fieldErr(`i${i}-dob`)}
                </div>
              </div>
            </fieldset>
          ))}

          <fieldset className="card">
            <legend>Contact details</legend>
            <div className="grid-2">
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" autoComplete="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} {...inputProps('email')} />
                {fieldErr('email')}
              </div>
              <div className="field">
                <label htmlFor="phone">Mobile phone</label>
                <input id="phone" type="tel" autoComplete="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} {...inputProps('phone')} />
                {fieldErr('phone')}
              </div>
            </div>
          </fieldset>

          <button type="submit" className="btn btn-primary btn-lg">
            Continue to review
          </button>
        </form>

        <aside className="card sticky" aria-label="Trip summary">
          <h2>Your trip</h2>
          {legs.map((l) => (
            <LegSummary key={l.label} label={l.label} flight={l.flight} fare={l.fare} />
          ))}
        </aside>
      </div>
      {busy && <LoadingOverlay label="Checking seat availability…" />}
    </div>
  );
}
