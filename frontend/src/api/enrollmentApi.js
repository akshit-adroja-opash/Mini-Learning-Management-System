import { apiClient } from "./client";

export const enrollCourse = (courseId) => {
  return apiClient.post(`/enrollments/${courseId}`);
};

export const unenrollCourse = (courseId) => {
  return apiClient.delete(`/enrollments/${courseId}`);
};

export const myCourses = () => {
  return apiClient.get("/enrollments/me");
};