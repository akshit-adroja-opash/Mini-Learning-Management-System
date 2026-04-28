import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <main className="auth-shell">
      <section className="empty-state">
        <h1>Page not found</h1>
        <Link to="/courses">Back to catalog</Link>
      </section>
    </main>
  );
}
