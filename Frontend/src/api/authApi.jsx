import api from './axios';

export const registerUser = async (userData) => {
  // Post to /api/auth/register
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  // Post to /api/auth/login
  const response = await api.post('/auth/login', credentials);
  return response.data;
};

