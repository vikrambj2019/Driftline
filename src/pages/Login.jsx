import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTitle } from '../components/ui.jsx';
import { DEMO_EMAIL, DEMO_PASSWORD, useStore } from '../lib/store.js';
import { useVariant } from '../lib/variant.jsx';

export default function Login() {
  useTitle('Sign in');
  const v = useVariant();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [state, update] = useStore(v.id);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const next = params.get('next');
  const safeNext = next && next.startsWith(v.base) ? next : v.to('/account');

  function submit(e) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      if (email.trim().toLowerCase() !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
        setError('Email or password is incorrect.');
        return;
      }
      update({ session: { email: DEMO_EMAIL } });
      navigate(v.is('b5') ? `/v/${v.id}/account/home` : safeNext, { replace: true });
    }, 500);
  }

  return (
    <section className="auth-page">
      <div className="card auth-card">
        <h1>Sign in to Driftline</h1>
        {state.session && <p className="alert alert-info">You’re already signed in as {state.session.email}.</p>}
        <form onSubmit={submit} noValidate aria-label="Sign in">
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input id="login-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p className="alert alert-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="demo-creds">
          Demo account: <code>{DEMO_EMAIL}</code> / <code>{DEMO_PASSWORD}</code>
        </p>
      </div>
    </section>
  );
}
