import { Link } from 'react-router-dom';
import { useTitle } from '../components/ui.jsx';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../lib/store.js';

const DEFECT = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'];
const WORKFLOW = ['w1', 'w2'];

export default function Landing() {
  useTitle('Demo variants');
  return (
    <div className="landing">
      <div className="wrap">
        <header className="landing-head">
          <p className="eyebrow">Synthetic test site</p>
          <h1>Driftline</h1>
          <p className="lede">
            A fictional flight-booking website for demonstrating and evaluating browser agents. Every flight, fare, and
            booking is generated. Nothing here is real, and no payment details are ever collected.
          </p>
        </header>

        <section className="landing-grid">
          <article className="card">
            <h2>Reference site</h2>
            <p>The site as intended. Agents should be able to search, book, and manage trips without surprises.</p>
            <Link className="btn btn-primary" to="/v/clean/">
              Open clean site
            </Link>
          </article>

          <article className="card">
            <h2>Defect variants</h2>
            <p>Each variant contains one or more planted defects. What they are is intentionally not described here.</p>
            <ul className="variant-list">
              {DEFECT.map((v) => (
                <li key={v}>
                  <Link to={`/v/${v}/`}>
                    <code>{v}</code>
                  </Link>
                </li>
              ))}
            </ul>
          </article>

          <article className="card">
            <h2>Workflow variants</h2>
            <p>Variants with realistic obstacles and interruptions for task-completion agents.</p>
            <ul className="variant-list">
              {WORKFLOW.map((v) => (
                <li key={v}>
                  <Link to={`/v/${v}/`}>
                    <code>{v}</code>
                  </Link>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="card landing-notes">
          <h2>Using this site with an agent</h2>
          <ul>
            <li>
              Point the agent at a variant base URL, for example <code>{`${window.location.origin}/v/clean`}</code>.
            </li>
            <li>
              Demo sign-in: <code>{DEMO_EMAIL}</code> / <code>{DEMO_PASSWORD}</code>. These credentials are public and only
              work here.
            </li>
            <li>
              State is stored in the browser, per variant. A fresh browser profile always starts from the same seed data;
              use <em>Reset demo data</em> in the top bar to start over.
            </li>
            <li>
              Creating bookings and editing profiles is safe on this site, so mutation-enabled test runs are fine here. Do
              not copy that setting to a real application.
            </li>
            <li>The bookable calendar runs from October 1, 2026 to March 31, 2027 regardless of today’s date.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
