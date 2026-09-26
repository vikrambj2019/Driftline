import { Link } from 'react-router-dom';
import { useTitle } from '../components/ui.jsx';
import { useVariant } from '../lib/variant.jsx';

export default function NotFound() {
  useTitle('Page not found');
  const v = useVariant();
  return (
    <section className="empty not-found">
      <p className="big-code" aria-hidden="true">
        404
      </p>
      <h1>We can’t find that page</h1>
      <p>The link may be broken, or the page may have moved.</p>
      <Link className="btn btn-primary" to={v.to('/')}>
        Back to flight search
      </Link>
    </section>
  );
}
