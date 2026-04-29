import { useEffect, useState } from "react";
import { CourseCard } from "../components/CourseCard.jsx";
import { listCourses } from "../api/courseApi.js";

export function CourseCatalogPage() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    listCourses()
      .then((res) => setCourses(res.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <section>
      <div className="page-heading">
        <h1>Course Catalog</h1>
        <p>Browse published training courses and continue enrolled learning.</p>
      </div>
      {isLoading && <p>Loading courses...</p>}
      <div className="course-grid">
        {courses.map((course) => (
          <CourseCard course={course} key={course._id} />
        ))}
        {!isLoading && courses.length === 0 && (
          <p>No courses available yet.</p>
        )}
      </div>
    </section>
  );
}
