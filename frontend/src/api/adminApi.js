import axios from "./axiosInstance";
export const getUsers = (search = "", page = 1, limit = 10) =>
    axios.get(
        `/admin/users?search=${search}&page=${page}&limit=${limit}`
    );

export const updateUserRole = (id, role) =>
    axios.put(`/admin/users/${id}/role`, { role });

export const deleteUser = (id) =>
    axios.delete(`/admin/users/${id}`);

export const getAdminAnalytics = () => axios.get("/admin/analytics");