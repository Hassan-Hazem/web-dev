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
import PostEmbedding from "../models/postEmbeddingModel.js";
import { generateEmbedding } from "../services/aiService.js";
import { createPostSchema, voteSchema } from "../validators/postValidator.js";

// Floor for cosine similarity; below this we treat results as unrelated noise
const MIN_SIMILARITY = 0.4;

// --- Helper: Cosine Similarity for Vector Search ---
// Calculates how similar two vectors are (returns -1 to 1)
const cosineSimilarity = (vecA, vecB) => {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
};

// --- Helper function to check if user can perform actions in community ---
const checkCommunityAccess = async (community, userId) => {
  if (community.isPublic) return true;
  if (userId) {
    const subscription = await Subscription.findOne({
      user: userId,
      community: community._id,
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
    let finalImageUrl = req.body.imageUrl || "";

    if (req.file && req.file.path) {
      finalImageUrl = req.file.path;
    }

    const community = await Community.findOne({ name: communityName });
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    const hasAccess = await checkCommunityAccess(community, userId);
    if (!hasAccess) {
      return res.status(403).json({
        message: "You must join this restricted community to post",
      });
    }

    const newPost = await createPost({
      title,
      content,
      postType: postType || "text",
      imageUrl: finalImageUrl,
      author: userId,
      community: community._id,
    });

    // --- AI INTEGRATION: Generate and Save Embedding ---
    try {
      const textToEmbed = title + (content ? "\n" + content : "");
      // task_type='document' ensures the model optimizes for storage
      const embeddingVector = await generateEmbedding(textToEmbed, "document");

      if (embeddingVector) {
        await PostEmbedding.create({
          post: newPost._id,
          embedding: embeddingVector,
        });
      }
    } catch (aiError) {
      console.error(
        `Failed to generate embedding for post ${newPost._id}:`,
        aiError.message
      );
      // We continue success response even if AI fails
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

// --- SEMANTIC SEARCH POSTS (NEW) ---
export const searchPosts = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

    // 1. Generate embedding for the search query
    // task_type='query' ensures the model optimizes for retrieval
    const queryEmbedding = await generateEmbedding(query, "query");

    // 2. Fetch all post embeddings (Project only necessary fields for speed)
    const allEmbeddings = await PostEmbedding.find({}, "post embedding");

    // 3. Calculate similarity and sort in memory
    const results = allEmbeddings.map((doc) => ({
      post: doc.post,
      score: cosineSimilarity(queryEmbedding, doc.embedding),
    }));

    // 4. Sort by score (descending) and drop weak matches
    results.sort((a, b) => b.score - a.score);
    const topResults = results
      .filter((r) => r.score >= MIN_SIMILARITY)
      .slice(0, limit);

    // 5. Fetch full post details for the top results
    const topPostIds = topResults.map((r) => r.post);

    // Fetch posts and preserve the order of relevance
    const posts = await Post.find({ _id: { $in: topPostIds } })
      .populate("author", "username profilePictureUrl")
      .populate("community", "name profilePictureUrl");

    // Re-order posts to match the similarity ranking
    const orderedPosts = topPostIds
      .map((id) => posts.find((p) => p._id.toString() === id.toString()))
      .filter((p) => p !== undefined); // Filter out any nulls (e.g. if a post was deleted but embedding remained)

    res.status(200).json(orderedPosts);
  } catch (error) {
    console.error("Search Error:", error);
    res
      .status(500)
      .json({ message: "Error searching posts", error: error.message });
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

export const getUserPosts = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
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

    const hasAccess = await checkCommunityAccess(post.community, userId);
    if (!hasAccess) {
      return res
        .status(403)
        .json({ message: "You must join this restricted community to vote" });
    }

    const existingVote = await Vote.findOne({
      user: userId,
      targetId: postId,
      targetType: "Post",
    });

    let karmaChange = 0;

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        await Vote.findByIdAndDelete(existingVote._id);
        if (voteType === "up") {
          post.upvotes = Math.max(0, post.upvotes - 1);
          karmaChange = -1;
        } else {
          post.downvotes = Math.max(0, post.downvotes - 1);
          karmaChange = 1;
        }
      } else {
        existingVote.voteType = voteType;
        await existingVote.save();
        if (voteType === "up") {
          post.upvotes++;
          post.downvotes = Math.max(0, post.downvotes - 1);
          karmaChange = 2;
        } else {
          post.downvotes++;
          post.upvotes = Math.max(0, post.upvotes - 1);
          karmaChange = -2;
        }
      }
    } else {
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

    // Authorization
    if (post.author._id.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    await deletePostById(req.params.id);

    // --- AI INTEGRATION: Cleanup Embedding ---
    // Remove the embedding so we don't find deleted posts in search results
    await PostEmbedding.findOneAndDelete({ post: req.params.id });
    // -----------------------------------------

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting post", error: error.message });
  }
};
