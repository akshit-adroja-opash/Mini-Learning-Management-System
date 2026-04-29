import axiosInstance from "./axiosInstance";

export const getCourseModules = (courseId) => axiosInstance.get(`/modules/course/${courseId}`);
export const createModule = (data) => axiosInstance.post("/modules", data);
export const updateModule = (id, data) => axiosInstance.put(`/modules/${id}`, data);
export const deleteModule = (id) => axiosInstance.delete(`/modules/${id}`);
