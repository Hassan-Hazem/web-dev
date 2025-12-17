import api from './axios';

export const searchCommunities = async (query) => {
  const response = await api.get(`/communities/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

export const getCommunity = async (name) => {
  const response = await api.get(`/communities/${name}`);
  return response.data;
};

export const getCommunities = async () => {
  const response = await api.get('/communities');
  return response.data;
};

export const createCommunity = async (payload) => {
  const response = await api.post('/communities', payload);
  return response.data;
};

export const joinCommunity = async (name) => {
  const response = await api.post(`/communities/${name}/join`);
  return response.data;
};

export const leaveCommunity = async (name) => {
  const response = await api.post(`/communities/${name}/leave`);
  return response.data;
};
