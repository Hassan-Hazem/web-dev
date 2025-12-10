import { findPostVotesByUser } from "../repositories/voteRepository.js";

// --- GET POSTS UPVOTED BY USER ---
export const getUserUpvotedPosts = async (req, res) => {
  try {
    // 1. Fix: Get ID directly from req.user (attached by protect middleware)
    const userId = req.user._id; 
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 2. Optimization: specific 'findUserById' check is removed 
    // because 'protect' middleware guarantees the user exists.

    // Fetch Votes with populated Posts
    const votes = await findPostVotesByUser(userId, "up", skip, limit);

    const posts = votes
      .map((vote) => vote.targetId)
      .filter((post) => post !== null);

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching upvoted posts", error: error.message });
  }
};

// --- GET POSTS DOWNVOTED BY USER ---
export const getUserDownvotedPosts = async (req, res) => {
  try {
    const userId = req.user._id; // Fix applied here too
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const votes = await findPostVotesByUser(userId, "down", skip, limit);

    const posts = votes
      .map((vote) => vote.targetId)
      .filter((post) => post !== null);

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching downvoted posts", error: error.message });
  }
};