import api from './axios';

export const getPostComments = async (postId, params = {}) => {
  const response = await api.get(`/comments/post/${postId}`, { params });
  return response.data;
};

export const getComment = async (commentId) => {
  const response = await api.get(`/comments/${commentId}`);
  return response.data;
};

export const createComment = async ({ content, postId, parentCommentId = null }) => {
  const response = await api.post('/comments', {
    content,
    postId,
    parentCommentId,
  });
  return response.data;
};

export const updateComment = async (commentId, content) => {
  const response = await api.put(`/comments/${commentId}`, { content });
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);
  return response.data;
};

export const voteOnComment = async (commentId, voteType) => {
  const response = await api.post(`/comments/${commentId}/vote`, { voteType });
  return response.data;
};

export const getCommentReplies = async (commentId, params = {}) => {
  const response = await api.get(`/comments/${commentId}/replies`, { params });
  return response.data;
};

export const getUserComments = async (username, params = {}) => {
  const response = await api.get(`/comments/user/${username}`, { params });
  return response.data;
};
