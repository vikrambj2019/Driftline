import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useVariant } from '../lib/variant.jsx';
import { getFlag, resetAllDemoData, setFlag, useStore } from '../lib/store.js';

function CookieBanner() {
  const [choice, setChoice] = useState(() => getFlag('cookies'));
  if (choice) return null;
  const decide = (c) => {
    setFlag('cookies', c);
    setChoice(c);
  };
  return (
    <div className="cookie-banner" role="region" aria-label="Cookie preferences">
      <p>
        Driftline uses browser storage to remember your searches, sign-in, and trips on this device. This demo site has no
        tracking.
      </p>
      <div className="cookie-actions">
        <button type="button" className="btn btn-secondary" onClick={() => decide('necessary')}>
          Only necessary
        </button>
        <button type="button" className="btn btn-primary" onClick={() => decide('all')}>
          Accept all
        </button>
      </div>
    </div>
  );
}

export default function Layout() {
  const v = useVariant();
  const [state, update] = useStore(v.id);
  const navigate = useNavigate();

  return (
    <div className="app">
      <div className="demo-banner" role="note">
        <div className="wrap demo-banner-inner">
          <span>
            <strong>Synthetic demo site.</strong> No real flights, bookings, or payments. Variant <code>{v.id}</code>
          </span>
          <span className="demo-banner-links">
            <Link to="/">All variants</Link>
            <button
              type="button"
              className="linklike"
              onClick={() => {
                resetAllDemoData();
                navigate(v.to('/'));
              }}
            >
              Reset demo data
            </button>
          </span>
        </div>
      </div>

      <header className="site-header">
        <div className="wrap header-inner">
          <Link to={v.to('/')} className="logo" aria-label="Driftline home">
            <span className="logo-mark" aria-hidden="true">
              <svg viewBox="0 0 32 32" width="28" height="28">
                <rect width="32" height="32" rx="8" fill="currentColor" />
                <path d="M7 20l18-8-6 12-3-5z" fill="#fff" />
              </svg>
            </span>
            Driftline
          </Link>
          <nav aria-label="Main">
            <NavLink to={v.to('/')} end>
              Flights
            </NavLink>
            <NavLink to={v.to('/trips')}>My trips</NavLink>
            {state.session ? (
              <>
                <NavLink to={v.to('/account')}>Account</NavLink>
                <button
                  type="button"
                  className="linklike nav-signout"
                  onClick={() => {
                    update({ session: null });
                    navigate(v.to('/'));
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <NavLink to={v.to('/login')} className="nav-signin">
                Sign in
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <main id="main" className="wrap main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="wrap footer-inner">
          <p>
            Driftline is a fictional travel company. Airlines, fares, and schedules are generated. Airport codes are real;
            everything else is synthetic.
          </p>
          <p>
            <Link to={v.to('/help')}>Help &amp; fare policies</Link> · <Link to="/">About this demo</Link>
          </p>
        </div>
      </footer>
      <CookieBanner />
    </div>
  );
}
