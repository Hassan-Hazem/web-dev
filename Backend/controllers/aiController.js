import axios from "axios";

// --- SUMMARIZE POST ---
export const summarizePostController = async (req, res) => {
  const { title, content } = req.body;

  // Validate input
  if (!title || !content) {
    return res.status(400).json({
      message: "Both 'title' and 'content' are required fields",
    });
  }

  try {
    // Call the AI Service endpoint
    const aiServiceUrl = process.env.AI_SERVICE_URL ;

    const response = await axios.post(`${aiServiceUrl}/summarize`, {
      title,
      content,
    });

    // Return the summary from the AI service
    return res.status(200).json(response.data);
  } catch (error) {
    console.error("AI Service Error:", error.message);

    // Handle different error scenarios
    if (error.response) {
      // Error from the AI service
      return res.status(error.response.status).json({
        message:
          error.response.data.detail || "AI Service failed to generate summary",
      });
    } else if (error.code === "ECONNREFUSED") {
      // AI service is not running
      return res.status(503).json({
        message: "AI Service is currently unavailable",
      });
    } else {
      // Other errors
      return res.status(500).json({
        message: "Failed to process request to AI Service",
      });
    }
  }
};
