import { AnalyticsSummary } from "../components/AnalyticsSummary.jsx";

export function AnalyticsPage() {
  return (
    <section>
      <div className="page-heading">
        <h1>Instructor Analytics</h1>
        <p>Enrollment trends, quiz scores, and lesson drop-off.</p>
      </div>
      <AnalyticsSummary />
    </section>
  );
}
