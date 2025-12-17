import api from './axios';

/**
 * Search posts using RAG vector search
 * @param {string} query - Search query text
 * @param {number} limit - Number of results to return
 * @param {number} page - Page number for pagination
 * @returns {Promise} - Search results
 */
export const searchPosts = async (query, limit = 10, page = 1) => {
  const response = await api.get('/search/posts', {
    params: { q: query, limit, page }
  });
  return response.data;
};

/**
 * Search communities
 * @param {string} query - Search query text
 * @param {number} limit - Number of results to return
 * @returns {Promise} - Community search results
 */
export const searchCommunities = async (query, limit = 10) => {
  const response = await api.get('/search/communities', {
    params: { q: query, limit }
  });
  return response.data;
};
