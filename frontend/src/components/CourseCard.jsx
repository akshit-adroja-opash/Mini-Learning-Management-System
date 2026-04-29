import { Link } from "react-router-dom";
import { ProgressBar } from "./ProgressBar.jsx";

export function CourseCard({ course }) {
  return (
    <article className="course-card">
      <h3>{course.title}</h3>
      <p>{course.description}</p>
      <ProgressBar value={course.progressPercent || 0} />
      <Link to={`/courses/${course._id}`}>View course</Link>
    </article>
  );
}
