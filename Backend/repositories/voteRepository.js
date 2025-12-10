import Vote from "../models/voteModel.js";

// Find a vote by user and target (Post/Comment)
export const findVoteByUserAndTarget = async (userId, targetId, targetType) => {
  return await Vote.findOne({ user: userId, targetId, targetType });
};

// Create a new vote
export const createVote = async (voteData) => {
  const vote = new Vote(voteData);
  return await vote.save();
};

// Delete a vote by ID
export const deleteVoteById = async (voteId) => {
  return await Vote.findByIdAndDelete(voteId);
};

// Update an existing vote's type (e.g., from 'up' to 'down')
export const updateVoteType = async (voteId, newType) => {
  return await Vote.findByIdAndUpdate(voteId, { voteType: newType }, { new: true });
};

// Get all posts voted on by a specific user (Upvoted or Downvoted)
export const findPostVotesByUser = async (userId, voteType, skip = 0, limit = 10) => {
  return await Vote.find({ 
      user: userId, 
      voteType: voteType, 
      targetType: "Post" 
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate({
      path: "targetId", 
      populate: [
        { path: "author", select: "username profilePictureUrl" },
        { path: "community", select: "name profilePictureUrl" }
      ]
    });
};