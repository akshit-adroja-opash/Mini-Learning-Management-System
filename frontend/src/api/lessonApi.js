import axiosInstance from "./axiosInstance";

export const getModuleLessons = (moduleId) => axiosInstance.get(`/lessons/module/${moduleId}`);
export const createLesson = (data) => axiosInstance.post("/lessons", data);
export const updateLesson = (id, data) => axiosInstance.put(`/lessons/${id}`, data);
export const deleteLesson = (id) => axiosInstance.delete(`/lessons/${id}`);
