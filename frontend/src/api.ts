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

export const login = async (username: string, password: string) => {
  const form = new URLSearchParams();
  form.append('username', username);
  form.append('password', password);
  return api.post('/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
};

export const register = async (username: string, password: string) => {
  return api.post('/auth/register', { username, password });
};

export const uploadData = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/data/upload', formData);
};

export const getDataAnalysis = async (dataId: number) => {
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

export const deleteUserData = async (dataId: number) => {
  return api.delete(`/admin/data/${dataId}`);
};

export default api;
