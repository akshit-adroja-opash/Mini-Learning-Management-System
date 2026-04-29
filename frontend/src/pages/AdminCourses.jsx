import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../api/axiosInstance";
import "../styles/admin.css";
import toast from "react-hot-toast";

export default function AdminCourses() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/courses");
      return res.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/admin/courses/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-courses"]);
      toast.success("Course deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete course");
    }
  });

  if (isLoading) return <p>Loading courses...</p>;

  return (
    <div className="admin-users"> {/* Using same wrapper for styles */}
      <h1>Courses Management</h1>

      <table className="users-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Instructor</th>
            <th>Category</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data?.map?.((course) => (
            <tr key={course._id}>
              <td>{course.title}</td>
              <td>{course.instructor?.name || "Unknown"}</td>
              <td>{course.category}</td>
              <td>
                <span className={`status-badge ${course.status}`}>
                  {course.status}
                </span>
              </td>
              <td>
                <button
                  className="delete-btn"
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this course?")) {
                      deleteMutation.mutate(course._id);
                    }
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}