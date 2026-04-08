import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (username, password) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  return api.post('/auth/login', formData);
};

export const uploadData = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/data/upload', formData, {
    headers: { 'Content-Type': 'multipart-form-data' },
  });
};

export const getDataAnalysis = async (dataId) => {
  return api.get(`/data/analysis/${dataId}`);
};

export const getMyData = async () => {
  return api.get('/my-data');
};

export const getAllUsers = async () => {
  return api.get('/admin/users');
};

export const getAllData = async () => {
  return api.get('/admin/data');
};

export const deleteUserData = async (dataId) => {
  return api.delete(`/admin/data/${dataId}`);
};

export default api;
