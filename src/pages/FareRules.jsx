import { useParams } from 'react-router-dom';
import { useTitle } from '../components/ui.jsx';
import { FARES } from '../lib/data.js';

const RULES = {
  basic: [
    'Tickets are non-refundable and cannot be changed after 24 hours from booking.',
    'Seats are assigned at check-in. Families may be seated apart.',
    'One personal item that fits under the seat. Carry-on bags are $35 at the airport.',
    'Checked bags: $40 for the first bag and $45 for the second, each way.',
  ],
  main: [
    'Changes are allowed before departure; you pay any difference in fare.',
    'Cancel before departure for travel credit valid 12 months.',
    'One carry-on bag and one personal item included.',
    'Checked bags: $35 for the first bag and $45 for the second, each way.',
  ],
  premium: [
    'Free changes before departure; fare difference may apply.',
    'Refundable to the original payment method up to 24 hours before departure.',
    'First checked bag included; second bag $45 each way.',
    'Extra-legroom seat and priority boarding.',
  ],
};

export default function FareRules() {
  const { fare } = useParams();
  const f = FARES[fare];
  useTitle(f ? `${f.name} fare rules` : 'Fare rules');
  return (
    <main className="wrap popup-page">
      <h1>{f ? `${f.name} fare rules` : 'Fare rules'}</h1>
      {f ? (
        <ul>
          {RULES[fare].map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      ) : (
        <p>Unknown fare type.</p>
      )}
      <p className="muted small">All fares are synthetic. Driftline is a fictional company.</p>
      <button type="button" className="btn btn-secondary" onClick={() => window.close()}>
        Close this tab
      </button>
    </main>
  );
}
