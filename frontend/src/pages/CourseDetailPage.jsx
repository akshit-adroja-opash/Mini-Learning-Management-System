import { ModuleList } from "../components/ModuleList.jsx";

const demoModules = [
  { id: "m1", order: 1, title: "Getting Started", status: "completed" },
  { id: "m2", order: 2, title: "Secure Workflows", status: "in-progress" },
  { id: "m3", order: 3, title: "Final Assessment", status: "locked" },
];

export function CourseDetailPage() {
  return (
    <section>
      <div className="page-heading">
        <h1>Course Detail</h1>
        <p>Aggregated modules, lesson progress, quiz status, and unlock state.</p>
      </div>
      <ModuleList modules={demoModules} />
    </section>
  );
}
