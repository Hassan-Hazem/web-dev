import api from './axios';

export const getMyProfile = async () => {
  const response = await api.get('/users/me/info');
  return response.data;
};

export const updateUserProfile = async (payload) => {
  const response = await api.put('/users/profile', payload);
  return response.data;
};
