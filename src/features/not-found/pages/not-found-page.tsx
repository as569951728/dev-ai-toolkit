import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <section className="panel empty-state">
      <p className="eyebrow">Page not found</p>
      <h1>We could not find that page.</h1>
      <p>
        The route may have changed, or the page may only exist in a future
        version of the toolbox.
      </p>
      <Link className="primary-button" to="/">
        Back to Overview
      </Link>
    </section>
  );
}
