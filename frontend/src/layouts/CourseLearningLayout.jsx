import { Outlet } from "react-router-dom";
import { CourseShellProvider } from "../context/CourseShellContext.jsx";

export function CourseLearningLayout() {
  return (
    <CourseShellProvider>
      <section className="learning-shell">
        <Outlet />
      </section>
    </CourseShellProvider>
  );
}
