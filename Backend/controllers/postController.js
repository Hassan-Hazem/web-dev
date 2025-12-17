import {
  createPost,
  findAllPosts,
  findPostById,
  findPostsByCommunity,
  findPostsByUser,
  deletePostById,
} from "../repositories/postRepository.js";
import { findUserByUsername } from "../repositories/userRepository.js";
import Community from "../models/communityModel.js";
import Subscription from "../models/subscriptionModel.js";
import Vote from "../models/voteModel.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import PostEmbedding from "../models/postEmbeddingModel.js"; // [NEW IMPORT]
import { generateEmbedding } from "../services/aiService.js"; // [NEW IMPORT]
import { createPostSchema, voteSchema } from "../validators/postValidator.js";

// --- Helper function to check if user can perform actions in community ---
const checkCommunityAccess = async (community, userId) => {
  // If community is public, anyone can perform actions
  if (community.isPublic) {
    return true;
  }
  
  // If community is restricted, only joined members can perform actions
  if (userId) {
    const subscription = await Subscription.findOne({
      user: userId,
      community: community._id
    });
    return !!subscription;
  }
  
  return false;
};

// --- CREATE POST ---
export const createPostController = async (req, res) => {
  const { error } = createPostSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { title, content, postType, communityName } = req.body;
    const userId = req.user.id;

    let finalImageUrl = req.body.imageUrl || ""; // Default or manual link

    if (req.file && req.file.path) {
      finalImageUrl = req.file.path;
    }

    // 3. Find Community
    const community = await Community.findOne({ name: communityName });
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // Check if user has access to post in this community
    const hasAccess = await checkCommunityAccess(community, userId);
    if (!hasAccess) {
      return res.status(403).json({ 
        message: "You must join this restricted community to post" 
      });
    }

    // 4. Create Post
    const newPost = await createPost({
      title,
      content,
      postType: postType || "text", // Default to text if missing
      imageUrl: finalImageUrl,
      author: userId,
      community: community._id,
    });

    // --- AI INTEGRATION: Generate and Save Embedding ---
    try {
      // Combine title and content for a richer embedding
      const textToEmbed = title + (content ? "\n" + content : "");
      
      console.log(`Generating embedding for post: ${newPost._id}`);
      const embeddingVector = await generateEmbedding(textToEmbed);

      if (embeddingVector) {
        await PostEmbedding.create({
          post: newPost._id,
          embedding: embeddingVector,
        });
        console.log(`Embedding saved successfully for post: ${newPost._id}`);
      }
    } catch (aiError) {
      // Log error but DO NOT fail the request. The post was created successfully.
      // We don't want to block the user if the AI service is temporarily down.
      console.error(`Failed to generate embedding for post ${newPost._id}:`, aiError.message);
    }
    // --------------------------------------------------

    const populatedPost = await findPostById(newPost._id);
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Create Post Error:", error);
    res
      .status(500)
      .json({ message: "Error creating post", error: error.message });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await findAllPosts(skip, limit);
    res.status(200).json(posts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching posts", error: error.message });
  }
};

export const getPost = async (req, res) => {
  try {
    const post = await findPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching post", error: error.message });
  }
};

export const getCommunityPosts = async (req, res) => {
  try {
    const { communityName } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const community = await Community.findOne({ name: communityName });
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const posts = await findPostsByCommunity(community._id, skip, limit);
    res.status(200).json(posts);
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Error fetching community posts",
        error: error.message,
      });
  }
};

// --- GET POSTS BY USER  ---
export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;

    // Use the existing repository function
    const user = await findUserByUsername(username);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Now we have the ID to query posts
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await findPostsByUser(user._id, skip, limit);
    res.status(200).json(posts);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching user posts", error: error.message });
  }
};

export const votePost = async (req, res) => {
  const { error } = voteSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { id: postId } = req.params;
  const { voteType } = req.body;
  const userId = req.user.id;

  try {
    const post = await Post.findById(postId).populate("author community");
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Check if user has access to vote in this community
    const hasAccess = await checkCommunityAccess(post.community, userId);
    if (!hasAccess) {
      return res.status(403).json({ 
        message: "You must join this restricted community to vote" 
      });
    }

    const existingVote = await Vote.findOne({
      user: userId,
      targetId: postId,
      targetType: "Post",
    });

    let karmaChange = 0;

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote
        await Vote.findByIdAndDelete(existingVote._id);
        if (voteType === "up") {
          post.upvotes = Math.max(0, post.upvotes - 1);
          karmaChange = -1; // Remove upvote
        } else {
          post.downvotes = Math.max(0, post.downvotes - 1);
          karmaChange = 1; // Remove downvote
        }
      } else {
        // Change vote
        existingVote.voteType = voteType;
        await existingVote.save();
        if (voteType === "up") {
          post.upvotes++;
          post.downvotes = Math.max(0, post.downvotes - 1);
          karmaChange = 2; // Was down (-1), now up (+1) => +2 diff
        } else {
          post.downvotes++;
          post.upvotes = Math.max(0, post.upvotes - 1);
          karmaChange = -2; // Was up (+1), now down (-1) => -2 diff
        }
      }
    } else {
      // New vote
      const newVote = new Vote({
        user: userId,
        voteType,
        targetType: "Post",
        targetId: postId,
      });
      await newVote.save();
      if (voteType === "up") {
        post.upvotes++;
        karmaChange = 1;
      } else {
        post.downvotes++;
        karmaChange = -1;
      }
    }

    await post.save();

    if (post.author) {
      console.log(
        "Updating karma for user:",
        post.author.username,
        "Change:",
        karmaChange
      );
      console.log("Post author ID:", post.author._id);
      await User.findByIdAndUpdate(post.author._id, {
        $inc: { karma: karmaChange },
      });
    }

    res.status(200).json({
      message: "Vote registered",
      upvotes: post.upvotes,
      downvotes: post.downvotes,
    });
  } catch (error) {
    res.status(500).json({ message: "Error voting", error: error.message });
  }
};
export const deletePost = async (req, res) => {
  try {
    const post = await findPostById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Authorization: Only author or admin (optional) can delete
    if (post.author._id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    await deletePostById(req.params.id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting post", error: error.message });
  }
};