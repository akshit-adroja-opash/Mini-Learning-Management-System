import { useParams, useNavigate } from "react-router-dom";
import { ModuleList } from "../components/ModuleList.jsx";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getCourse } from "../api/courseApi.js";
import { enrollCourse, myCourses } from "../api/enrollmentApi.js";
import toast from "react-hot-toast";

export function CourseDetailPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourse(courseId).then(res => res.data)
  });

  const { data: userEnrollments } = useQuery({
    queryKey: ["user-enrollments"],
    queryFn: () => myCourses().then(res => res.data)
  });

  const isEnrolled = userEnrollments?.some(e => e.course._id === courseId);

  const enrollMutation = useMutation({
    mutationFn: () => enrollCourse(courseId),
    onSuccess: () => {
      toast.success("Enrolled successfully!");
      navigate(`/learn/${courseId}`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.msg || "Enrollment failed");
    }
  });

  if (isLoading) return <p>Loading course details...</p>;
  if (!course) return <p>Course not found</p>;

  return (
    <section className="course-detail-container">
      <div className="course-header">
        <h1>{course.title}</h1>
        <p>{course.description}</p>
        
        {isEnrolled ? (
          <button 
            className="primary-button secondary" 
            onClick={() => navigate(`/learn/${courseId}`)}
          >
            Continue Learning
          </button>
        ) : (
          <button 
            className="primary-button" 
            onClick={() => enrollMutation.mutate()}
            disabled={enrollMutation.isLoading}
          >
            {enrollMutation.isLoading ? "Enrolling..." : "Enroll Now"}
          </button>
        )}
      </div>

      <div className="course-content">
        <h2>Course Curriculum</h2>
        <ModuleList modules={course.modules || []} />
      </div>
    </section>
  );
}
