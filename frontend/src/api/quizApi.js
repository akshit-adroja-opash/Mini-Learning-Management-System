import { apiClient } from "./client";

export const quizApi = {
  getQuiz: (quizId) => apiClient.get(`/quizzes/${quizId}`),
  submitQuiz: (quizId, payload) => apiClient.post(`/quizzes/${quizId}/attempts`, payload),
};
