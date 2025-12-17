import axios from "axios";


export const generateEmbedding = async (text) => {
  try {
    // Ensure AI_SERVICE_URL is defined in your .env file
    const aiServiceUrl = process.env.AI_SERVICE_URL; 
    
    if (!aiServiceUrl) {
        throw new Error("AI_SERVICE_URL environment variable is not defined");
    }

    // Call the Python FastAPI endpoint
    const response = await axios.post(`${aiServiceUrl}/api/embed`, {
      text: text,
      task_type: "document", // 'document' for storage, 'query' for search
    });

    if (response.data && response.data.embedding) {
      return response.data.embedding;
    }

    throw new Error("Invalid response format from AI Service");
  } catch (error) {
    console.error("AI Service Embedding Error:", error.message);
    // Re-throw to let the caller decide how to handle the failure
    throw error;
  }
};