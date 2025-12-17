import { generateQueryEmbedding } from "../services/aiEmbeddingService.js";
import Post from "../models/postModel.js";
import Community from "../models/communityModel.js";

/**
 * Search posts using vector similarity (RAG) and optional keyword search
 */
export const searchPosts = async (req, res) => {
  try {
    const { q: query, limit = 10, page = 1 } = req.query;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;

    // Generate embedding for the search query
    const queryEmbedding = await generateQueryEmbedding(query.trim());

    // MongoDB Atlas Vector Search
    // Note: This requires a vector search index to be created in Atlas
    const results = await Post.aggregate([
      {
        $vectorSearch: {
          index: "post_embedding_index", // You'll create this in Atlas
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100, // Number of candidates to consider
          limit: limitNum * 3, // Get more for hybrid filtering
        }
      },
      {
        $addFields: {
          vectorScore: { $meta: "vectorSearchScore" }
        }
      },
      // Lookup author
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author"
        }
      },
      { $unwind: "$author" },
      // Lookup community
      {
        $lookup: {
          from: "communities",
          localField: "community",
          foreignField: "_id",
          as: "community"
        }
      },
      { $unwind: "$community" },
      // Project fields
      {
        $project: {
          title: 1,
          content: 1,
          postType: 1,
          imageUrl: 1,
          upvotes: 1,
          downvotes: 1,
          commentCount: 1,
          createdAt: 1,
          updatedAt: 1,
          vectorScore: 1,
          "author._id": 1,
          "author.username": 1,
          "author.profilePictureUrl": 1,
          "community._id": 1,
          "community.name": 1,
          "community.icon": 1,
        }
      },
      { $skip: skip },
      { $limit: limitNum }
    ]);

    res.status(200).json({
      results,
      query,
      count: results.length,
      page: pageNum,
      limit: limitNum
    });

  } catch (error) {
    console.error("Search error:", error);
    
    // Fallback to keyword search if vector search fails
    if (error.message?.includes('vector') || error.message?.includes('embedding')) {
      return fallbackKeywordSearch(req, res);
    }
    
    res.status(500).json({ 
      message: "Error searching posts", 
      error: error.message 
    });
  }
};

/**
 * Fallback keyword search when vector search is not available
 */
const fallbackKeywordSearch = async (req, res) => {
  try {
    const { q: query, limit = 10, page = 1 } = req.query;
    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;

    const results = await Post.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } }
      ]
    })
      .populate('author', 'username profilePictureUrl')
      .populate('community', 'name icon')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      results,
      query,
      count: results.length,
      page: pageNum,
      limit: limitNum,
      fallback: true,
      message: "Using keyword search (vector search unavailable)"
    });
  } catch (error) {
    console.error("Fallback search error:", error);
    res.status(500).json({ 
      message: "Error in fallback search", 
      error: error.message 
    });
  }
};

/**
 * Search communities
 */
export const searchCommunities = async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;
    
    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const communities = await Community.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    })
      .select('name description icon memberCount isPublic')
      .limit(parseInt(limit))
      .sort({ memberCount: -1 }); // Popular communities first

    res.status(200).json({
      results: communities,
      query,
      count: communities.length
    });
  } catch (error) {
    console.error("Community search error:", error);
    res.status(500).json({ 
      message: "Error searching communities", 
      error: error.message 
    });
  }
};
