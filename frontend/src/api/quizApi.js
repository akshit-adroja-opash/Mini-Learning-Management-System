import axiosInstance from "./axiosInstance";

export const createQuiz = (data) => axiosInstance.post("/quizzes", data);
export const addQuestion = (quizId, data) => axiosInstance.post(`/quizzes/${quizId}/questions`, data);
export const getModuleQuiz = (moduleId) => axiosInstance.get(`/quizzes/module/${moduleId}`);
export const getQuiz = (quizId) => axiosInstance.get(`/quizzes/${quizId}`);
export const submitQuiz = (quizId, answers) => axiosInstance.post(`/quizzes/${quizId}/submit`, { answers });