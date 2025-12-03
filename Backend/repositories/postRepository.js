import Post from "../models/postModel.js";

// Create a new post
export const createPost = async (postData) => {
  const post = new Post(postData);
  return await post.save();
};

// Find post by ID with full details
export const findPostById = async (id) => {
  return await Post.findById(id)
    .populate("author", "username profilePictureUrl")
    .populate("community", "name profilePictureUrl");
};


export const findAllPosts = async (skip = 0, limit = 10, sort = { createdAt: -1 }) => {
  return await Post.find()
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate("author", "username profilePictureUrl")
    .populate("community", "name profilePictureUrl");
};


export const findPostsByCommunity = async (communityId, skip = 0, limit = 10) => {
  return await Post.find({ community: communityId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("author", "username profilePictureUrl")
    .populate("community", "name profilePictureUrl");
};


export const findPostsByUser = async (userId, skip = 0, limit = 10) => {
  return await Post.find({ author: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("community", "name profilePictureUrl");
};

// Delete a post
export const deletePostById = async (id) => {
  return await Post.findByIdAndDelete(id);
};