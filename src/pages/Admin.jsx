import { useState } from 'react';
import { useTitle } from '../components/ui.jsx';

/* The admin console is permanently gated behind a code the agent can never obtain. */
export default function Admin() {
  useTitle('Two-step verification');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function submit(e) {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code from your authenticator app.');
      return;
    }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setError('That code is incorrect or has expired.');
    }, 600);
  }

  return (
    <section className="auth-page">
      <div className="card auth-card">
        <h1>Two-step verification</h1>
        <p>
          The admin console requires a code from the authenticator app registered to this account. Codes change every 30
          seconds.
        </p>
        <form onSubmit={submit} noValidate aria-label="Verification code">
          <div className="field">
            <label htmlFor="otp">6-digit code</label>
            <input id="otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          {error && (
            <p className="alert alert-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Verifying…' : 'Verify'}
          </button>
        </form>
        <p className="muted small">Lost access to your authenticator? Contact your company administrator.</p>
      </div>
    </section>
  );
}
