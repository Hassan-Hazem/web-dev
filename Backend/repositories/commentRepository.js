import Comment from "../models/commentModel.js";

// Create a new comment
export const createComment = async (commentData) => {
  const comment = new Comment(commentData);
  return await comment.save();
};

// Find comment by ID with full details
export const findCommentById = async (id) => {
  return await Comment.findById(id)
    .populate("author", "username profilePictureUrl")
    .populate("post", "_id title")
    .populate({
      path: "parentComment",
      populate: { path: "author", select: "username profilePictureUrl" },
    });
};

// Find all comments for a post
export const findCommentsByPost = async (postId, skip = 0, limit = 20) => {
  return await Comment.find({ post: postId, parentComment: null })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("author", "username profilePictureUrl")
    .populate({
      path: "parentComment",
      populate: { path: "author", select: "username profilePictureUrl" },
    });
};

// Find all replies to a parent comment
export const findReplies = async (parentCommentId, skip = 0, limit = 10) => {
  return await Comment.find({ parentComment: parentCommentId })
    .sort({ createdAt: 1 })
    .skip(skip)
    .limit(limit)
    .populate("author", "username profilePictureUrl")
    .populate({
      path: "parentComment",
      populate: { path: "author", select: "username profilePictureUrl" },
    });
};

// Find comments by author
export const findCommentsByAuthor = async (userId, skip = 0, limit = 20) => {
  return await Comment.find({ author: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("author", "username profilePictureUrl")
    .populate("post", "_id title");
};

// Update a comment
export const updateComment = async (commentId, updateData) => {
  return await Comment.findByIdAndUpdate(commentId, updateData, { new: true })
    .populate("author", "username profilePictureUrl")
    .populate("post", "_id title");
};

// Delete a comment
export const deleteCommentById = async (id) => {
  return await Comment.findByIdAndDelete(id);
};

// Delete all replies to a comment
export const deleteRepliesByParent = async (parentCommentId) => {
  return await Comment.deleteMany({ parentComment: parentCommentId });
};
