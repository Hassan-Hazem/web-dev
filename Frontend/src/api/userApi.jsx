import api from './axios';

export const getMyProfile = async () => {
  const response = await api.get('/users/me/info');
  return response.data;
};

export const updateUserProfile = async (payload) => {
  const response = await api.put('/users/profile', payload);
  return response.data;
};

export const searchUsers = async (query) => {
  const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

export const getUserProfile = async (username) => {
  const response = await api.get(`/users/${username}`);
  return response.data;
};
