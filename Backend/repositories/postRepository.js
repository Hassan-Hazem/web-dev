import Post from "../models/postModel.js";
import Comment from "../models/commentModel.js";

// Create a new post
export const createPost = async (postData) => {
  const post = new Post(postData);
  return await post.save();
};

// Find post by ID with full details
export const findPostById = async (id) => {
  const post = await Post.findById(id)
    .populate("author", "username profilePictureUrl")
    .populate("community", "name profilePictureUrl");

  if (post) {
    // Count all comments (including replies) for this post
    const commentCount = await Comment.countDocuments({ post: id });
    return { ...post.toObject(), commentCount };
  }
  return post;
};

export const findAllPosts = async (
  skip = 0,
  limit = 10,
  sort = { createdAt: -1 }
) => {
  const posts = await Post.find()
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate("author", "username profilePictureUrl")
    .populate("community", "name profilePictureUrl");

  // Add comment counts to each post
  const postsWithCounts = await Promise.all(
    posts.map(async (post) => {
      const commentCount = await Comment.countDocuments({ post: post._id });
      return { ...post.toObject(), commentCount };
    })
  );

  return postsWithCounts;
};

export const findPostsByCommunity = async (
  communityId,
  skip = 0,
  limit = 10
) => {
  const posts = await Post.find({ community: communityId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("author", "username profilePictureUrl")
    .populate("community", "name profilePictureUrl");

  // Add comment counts to each post
  const postsWithCounts = await Promise.all(
    posts.map(async (post) => {
      const commentCount = await Comment.countDocuments({ post: post._id });
      return { ...post.toObject(), commentCount };
    })
  );

  return postsWithCounts;
};

export const findPostsByUser = async (userId, skip = 0, limit = 10) => {
  const posts = await Post.find({ author: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("author", "username profilePictureUrl")
    .populate("community", "name profilePictureUrl");

  // Add comment counts to each post
  const postsWithCounts = await Promise.all(
    posts.map(async (post) => {
      const commentCount = await Comment.countDocuments({ post: post._id });
      return { ...post.toObject(), commentCount };
    })
  );

  return postsWithCounts;
};

// Delete a post
export const deletePostById = async (id) => {
  return await Post.findByIdAndDelete(id);
};
