import { apiClient } from "./client";

export const progressApi = {
  saveLessonProgress: (lessonId, payload) =>
    apiClient.patch(`/lessons/${lessonId}/progress`, payload),
  getLessonProgress: (lessonId) => apiClient.get(`/lessons/${lessonId}/progress`),
};
