import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";

export function AnalyticsSummary() {
  const { data, isLoading } = useQuery({
    queryKey: ["instructor-analytics"],
    queryFn: async () => {
      const res = await axiosInstance.get("/api/analytics");
      return res.data;
    }
  });

  if (isLoading) return <p>Loading analytics...</p>;

  return (
    <section className="metric-grid">
      <article>
        <span>Total Enrollments</span>
        <strong>{data?.totalEnrollments || 0}</strong>
      </article>
      <article>
        <span>Average Quiz Score</span>
        <strong>{Math.round(data?.avgQuizScore || 0)}%</strong>
      </article>
      <article>
        <span>Lesson Drop-off</span>
        <strong>{data?.lessonDropOff || 0}%</strong>
      </article>
    </section>
  );
}
