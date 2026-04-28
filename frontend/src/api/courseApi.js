import { apiClient } from "./client";

export const courseApi = {
  listCourses: () => apiClient.get("/courses"),
  getCourse: (courseId) => apiClient.get(`/courses/${courseId}`),
  createCourse: (payload) => apiClient.post("/instructor/courses", payload),
  updateCourse: (courseId, payload) =>
    apiClient.patch(`/instructor/courses/${courseId}`, payload),
};
