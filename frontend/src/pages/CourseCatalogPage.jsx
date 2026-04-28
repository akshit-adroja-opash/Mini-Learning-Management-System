import { CourseCard } from "../components/CourseCard.jsx";

const demoCourses = [
  {
    id: "demo-course",
    title: "Corporate Security Basics",
    description: "Video lessons, module quiz, progress tracking, and completion certificate.",
    progressPercent: 35,
  },
];

export function CourseCatalogPage() {
  return (
    <section>
      <div className="page-heading">
        <h1>Course Catalog</h1>
        <p>Browse published training courses and continue enrolled learning.</p>
      </div>
      <div className="course-grid">
        {demoCourses.map((course) => (
          <CourseCard course={course} key={course.id} />
        ))}
      </div>
    </section>
  );
}
