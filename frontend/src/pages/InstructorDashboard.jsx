import { useQuery } from "@tanstack/react-query";
import { getInstructorCourses } from "../api/courseApi";
import { Link } from "react-router-dom";
import "../styles/instructorDashboard.css";

export default function InstructorDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["instructor-courses"],
    queryFn: async () => {
      const res = await getInstructorCourses();
      return res.data;
    },
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="instructor-dashboard">
      <div className="instructor-header">
        <h1>Instructor Dashboard</h1>
        <Link to="/instructor/create" className="create-course-btn">
          Create New Course
        </Link>
      </div>

      <div className="instructor-courses-grid">
        {data?.map((course) => (
          <div key={course._id} className="course-item">
            <h3>{course.title}</h3>
            <div className="course-actions">
              <span className={`course-status ${course.status}`}>{course.status}</span>
              <Link to={`/instructor/courses/${course._id}/builder`} className="builder-link">
                Edit Content
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}