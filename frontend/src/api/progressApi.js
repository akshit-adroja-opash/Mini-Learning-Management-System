import { apiClient } from "./client";

export const saveProgress = (data) => {
  return apiClient.post("/progress", data);
};

export const getProgress = (lessonId) => {
  return apiClient.get(`/progress/${lessonId}`);
};