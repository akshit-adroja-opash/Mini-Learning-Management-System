import { apiClient } from "./client";
import axiosInstance from "./axiosInstance";

export const createCourse = (data) => {
  return apiClient.post("/courses", data);
};

export const updateCourse = (courseId, data) => {
  return apiClient.patch(`/courses/${courseId}`, data);
};

export const getCourse = (courseId) => {
  return apiClient.get(`/courses/${courseId}`);
};

export const listCourses = () => {
  return apiClient.get("/courses");
};

export const getInstructorCourses = () => {
  return axiosInstance.get("/courses/instructor");
}