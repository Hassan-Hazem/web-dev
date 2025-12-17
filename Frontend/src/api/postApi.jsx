import api from './axios';

export const searchPosts = async (query) => {
  const response = await api.get(`/posts/search`, {
    params: { query: query, limit: 15 },
  });
  return response.data;
};

export const getAllPosts = async (params) => {
  const response = await api.get('/posts', { params });
  return response.data;
};

export const getPost = async (id) => {
  const response = await api.get(`/posts/${id}`);
  return response.data;
};

export const createPost = async (payload) => {
  const response = await api.post('/posts', payload);
  return response.data;
};

export const getCommunityPosts = async (communityName) => {
  const response = await api.get(`/posts/community/${communityName}`);
  return response.data;
};

export const getUserPosts = async (username) => {
  const response = await api.get(`/posts/user/${username}`);
  return response.data;
};

export const votePost = async (postId, voteType) => {
  const response = await api.post(`/posts/${postId}/vote`, { voteType });
  return response.data;
};

export const deletePost = async (postId) => {
  const response = await api.delete(`/posts/${postId}`);
  return response.data;
};
