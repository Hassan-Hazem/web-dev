import api from './axios';

export const summarizePost = async (title, content) => {
  const response = await api.post('/ai/summarize', {
    title,
    content,
  });
  return response.data;
};
