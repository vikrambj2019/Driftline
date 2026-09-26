import { useTitle } from '../components/ui.jsx';

export default function Help() {
  useTitle('Help and fare policies');
  return (
    <section className="prose">
      <h1>Help &amp; fare policies</h1>
      <h2>Prices</h2>
      <p>
        Search results show the lowest available fare per person, one way. Your final total, shown on the review page before
        you book, adds taxes, government fees, and any checked bags you choose.
      </p>
      <h2>Fare types</h2>
      <ul>
        <li>
          <strong>Basic</strong>: personal item only; seats assigned at check-in; no changes.
        </li>
        <li>
          <strong>Main</strong>: carry-on included; choose your seat; changes allowed.
        </li>
        <li>
          <strong>Premium</strong>: first checked bag included; extra legroom; free changes.
        </li>
      </ul>
      <h2>International travel</h2>
      <p>Passports must be valid for at least six months after your last travel date.</p>
      <h2>Lap infants</h2>
      <p>Children under two may travel on an adult’s lap. Each adult may hold one infant.</p>
      <h2>Promo codes</h2>
      <p>Promo codes apply to the base fare only, not to taxes, fees, or bags.</p>
    </section>
  );
}
