import { apiClient } from "./client";

export const enrollmentApi = {
  enroll: (courseId) => apiClient.post(`/courses/${courseId}/enroll`),
  unenroll: (courseId) => apiClient.delete(`/courses/${courseId}/enroll`),
  myCourses: () => apiClient.get("/me/enrollments"),
};
