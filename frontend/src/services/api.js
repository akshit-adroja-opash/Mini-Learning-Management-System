import axios from 'axios';

export const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
export const fallbackCourseImage = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';

const api = axios.create({
  baseURL: `${apiBaseUrl}/api`,
});

// Add a request interceptor to include the JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getData = async (url) => (await api.get(url)).data;

export const postData = async (url, payload, config) => (await api.post(url, payload, config)).data;

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return postData('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

export const mediaUrl = (url) => {
  if (!url || url.startsWith('http')) return url;
  return `${apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};

export default api;
