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

export const fetchCurrentUser = async () => {
  // Axios needs to be configured to send the Bearer token for this call
  const response = await api.get('/auth/me'); 
  return response.data;
};