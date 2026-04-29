import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createCourse } from "../api/courseApi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../styles/courseCreate.css";

export function CourseCreatePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "General",
    level: "beginner",
    promoVideoUrl: "",
  });

  const mutation = useMutation({
    mutationFn: createCourse,
    onSuccess: (res) => {
      toast.success("Course created successfully!");
      navigate(`/instructor/courses/${res.data._id}/builder`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create course");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="course-create-page">
      <h1>Create New Course</h1>
      <form onSubmit={handleSubmit} className="course-form">
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Introduction to React"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            required
            rows="5"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe your course..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Promo Video URL</label>
            <input
              type="text"
              value={formData.promoVideoUrl}
              onChange={(e) => setFormData({ ...formData, promoVideoUrl: e.target.value })}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="General">General</option>
              <option value="Programming">Programming</option>
              <option value="Design">Design</option>
              <option value="Business">Business</option>
            </select>
          </div>

          <div className="form-group">
            <label>Level</label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={mutation.isLoading}>
          {mutation.isLoading ? "Creating..." : "Create Course"}
        </button>
      </form>
    </div>
  );
}
