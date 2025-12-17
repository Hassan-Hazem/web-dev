import axios from "axios";

/**
 * Calls the AI Service to generate an embedding for the given text.
 * @param {string} text - The text to embed.
 * @param {string} taskType - 'document' for storing posts, 'query' for search inputs.
 * @returns {Promise<number[]>} - The embedding vector.
 */
export const generateEmbedding = async (text, taskType = "document") => {
  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL; 

    if (!aiServiceUrl) {
        throw new Error("AI_SERVICE_URL environment variable is not defined");
    }

    // Call the Python FastAPI endpoint
    const response = await axios.post(`${aiServiceUrl}/api/embed`, {
      text: text,
      task_type: taskType, 
    });

    if (response.data && response.data.embedding) {
      return response.data.embedding;
    }

    throw new Error("Invalid response format from AI Service");
  } catch (error) {
    console.error("AI Service Embedding Error:", error.message);
    throw error;
  }
};