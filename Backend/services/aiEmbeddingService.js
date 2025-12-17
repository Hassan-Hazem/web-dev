import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Generate embedding for a post using AI-Service (Gemini)
 * @param {Object} post - Post object with title, content, community
 * @returns {Promise<number[]>} - 768-dimensional embedding vector
 */
export const generatePostEmbedding = async (post) => {
  try {
    // Combine title, content, and community for richer embeddings
    const text = `${post.title}\n${post.content || ''}\nr/${post.communityName || ''}`.trim();
    
    const response = await axios.post(`${AI_SERVICE_URL}/api/embed`, {
      text,
      task_type: 'document'
    }, {
      timeout: 10000 // 10 second timeout
    });
    
    return response.data.embedding;
  } catch (error) {
    console.error('Error generating post embedding:', error.message);
    // Don't throw - embedding generation failure shouldn't block post creation
    return null;
  }
};

/**
 * Generate embedding for a search query
 * @param {string} query - Search query text
 * @returns {Promise<number[]>} - 768-dimensional embedding vector
 */
export const generateQueryEmbedding = async (query) => {
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/embed`, {
      text: query,
      task_type: 'query'
    }, {
      timeout: 5000 // 5 second timeout
    });
    
    return response.data.embedding;
  } catch (error) {
    console.error('Error generating query embedding:', error.message);
    throw new Error('Failed to process search query');
  }
};

/**
 * Generate embeddings for multiple posts in batch (for backfilling)
 * @param {Array} posts - Array of post objects
 * @returns {Promise<number[][]>} - Array of embedding vectors
 */
export const generateBatchEmbeddings = async (posts) => {
  try {
    const texts = posts.map(post => 
      `${post.title}\n${post.content || ''}\nr/${post.communityName || ''}`.trim()
    );
    
    const response = await axios.post(`${AI_SERVICE_URL}/api/embed/batch`, {
      texts
    }, {
      timeout: 60000 // 60 second timeout for batch
    });
    
    return response.data.embeddings;
  } catch (error) {
    console.error('Error generating batch embeddings:', error.message);
    throw error;
  }
};

/**
 * Check if AI-Service is healthy
 * @returns {Promise<boolean>}
 */
export const checkAIServiceHealth = async () => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/health`, {
      timeout: 3000
    });
    return response.data.status === 'healthy';
  } catch (error) {
    console.error('AI-Service health check failed:', error.message);
    return false;
  }
};
