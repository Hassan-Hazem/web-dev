import {
  createComment,
  findCommentById,
  findCommentsByPost,
  findReplies,
  findCommentsByAuthor,
  updateComment,
  deleteCommentById,
  deleteRepliesByParent,
} from "../repositories/commentRepository.js";
import { findPostById } from "../repositories/postRepository.js";
import Comment from "../models/commentModel.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import Vote from "../models/voteModel.js";
import Subscription from "../models/subscriptionModel.js";
import {
  createCommentSchema,
  updateCommentSchema,
  voteCommentSchema,
} from "../validators/commentValidator.js";

// --- Helper function to check if user can perform actions in community ---
const checkCommunityAccess = async (post, userId) => {
  const community = await post.populate("community");

  if (community.community.isPublic) {
    return true;
  }

  if (userId) {
    const subscription = await Subscription.findOne({
      user: userId,
      community: community.community._id,
    });
    return !!subscription;
  }

  return false;
};

// --- CREATE COMMENT ---
export const createCommentController = async (req, res) => {
  const { error } = createCommentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { content, postId, parentCommentId } = req.body;
    const userId = req.user.id;

    // Check if post exists
    const post = await Post.findById(postId).populate("community");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user has access to comment in this post's community
    const hasAccess = await checkCommunityAccess(post, userId);
    if (!hasAccess) {
      return res.status(403).json({
        message: "You must join this restricted community to comment",
      });
    }

    // If replying to a comment, verify parent comment exists and belongs to the same post
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return res.status(404).json({ message: "Parent comment not found" });
      }
      if (parentComment.post.toString() !== postId) {
        return res.status(400).json({
          message: "Parent comment does not belong to this post",
        });
      }
    }

    // Create the comment
    const newComment = await createComment({
      content,
      author: userId,
      post: postId,
      parentComment: parentCommentId || null,
    });

    const populatedComment = await findCommentById(newComment._id);
    res.status(201).json(populatedComment);
  } catch (error) {
    console.error("Create Comment Error:", error);
    res.status(500).json({
      message: "Error creating comment",
      error: error.message,
    });
  }
};

// --- GET COMMENT ---
export const getCommentController = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await findCommentById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    res.status(200).json(comment);
  } catch (error) {
    console.error("Get Comment Error:", error);
    res.status(500).json({
      message: "Error fetching comment",
      error: error.message,
    });
  }
};

// --- GET COMMENTS FOR A POST ---
export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comments = await findCommentsByPost(postId, skip, limit);
    res.status(200).json(comments);
  } catch (error) {
    console.error("Get Post Comments Error:", error);
    res.status(500).json({
      message: "Error fetching comments",
      error: error.message,
    });
  }
};

// --- GET REPLIES TO A COMMENT ---
export const getCommentReplies = async (req, res) => {
  try {
    const { commentId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Check if parent comment exists
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return res.status(404).json({ message: "Parent comment not found" });
    }

    const replies = await findReplies(commentId, skip, limit);
    res.status(200).json(replies);
  } catch (error) {
    console.error("Get Comment Replies Error:", error);
    res.status(500).json({
      message: "Error fetching replies",
      error: error.message,
    });
  }
};

// --- GET USER COMMENTS ---
export const getUserCommentsController = async (req, res) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const comments = await findCommentsByAuthor(user._id, skip, limit);
    res.status(200).json(comments);
  } catch (error) {
    console.error("Get User Comments Error:", error);
    res.status(500).json({
      message: "Error fetching user comments",
      error: error.message,
    });
  }
};

// --- UPDATE COMMENT ---
export const updateCommentController = async (req, res) => {
  const { error } = updateCommentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the author
    if (comment.author.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only edit your own comments" });
    }

    const updatedComment = await updateComment(id, { content });
    res.status(200).json(updatedComment);
  } catch (error) {
    console.error("Update Comment Error:", error);
    res.status(500).json({
      message: "Error updating comment",
      error: error.message,
    });
  }
};

// --- DELETE COMMENT ---
export const deleteCommentController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is the author or post author
    const post = await Post.findById(comment.post);
    const isAuthor = comment.author.toString() === userId;
    const isPostAuthor = post.author.toString() === userId;

    if (!isAuthor && !isPostAuthor) {
      return res.status(403).json({
        message: "You can only delete your own comments",
      });
    }

    // Delete all replies to this comment first
    await deleteRepliesByParent(id);

    // Delete the comment
    await deleteCommentById(id);

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    res.status(500).json({
      message: "Error deleting comment",
      error: error.message,
    });
  }
};

// --- VOTE ON COMMENT ---
export const voteCommentController = async (req, res) => {
  const { error } = voteCommentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const { id } = req.params;
    const { voteType } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Get the post and check community access
    const post = await Post.findById(comment.post);
    const hasAccess = await checkCommunityAccess(post, userId);
    if (!hasAccess) {
      return res.status(403).json({
        message: "You must join this restricted community to vote",
      });
    }

    // Get comment author for karma updates
    const commentAuthor = await User.findById(comment.author);
    if (!commentAuthor) {
      return res.status(404).json({ message: "Comment author not found" });
    }

    // Check if user already voted on this comment
    const existingVote = await Vote.findOne({
      user: userId,
      targetId: id,
      targetType: "Comment",
    });

    if (existingVote) {
      // If voting the same way, remove the vote
      if (existingVote.voteType === voteType) {
        if (voteType === "up") {
          comment.upvotes = Math.max(0, comment.upvotes - 1);
          // Decrease author karma when upvote is removed
          commentAuthor.karma = Math.max(0, commentAuthor.karma - 1);
        } else {
          comment.downvotes = Math.max(0, comment.downvotes - 1);
          // Increase author karma when downvote is removed
          commentAuthor.karma += 1;
        }
        await comment.save();
        await commentAuthor.save();
        await Vote.deleteOne({ _id: existingVote._id });

        return res.status(200).json({
          comment: await findCommentById(id),
          voteRemoved: true,
        });
      } else {
        // Change vote from one type to another
        if (existingVote.voteType === "up") {
          comment.upvotes = Math.max(0, comment.upvotes - 1);
          comment.downvotes += 1;
          // Remove upvote karma and add downvote karma (net -2)
          commentAuthor.karma = Math.max(0, commentAuthor.karma - 2);
        } else {
          comment.downvotes = Math.max(0, comment.downvotes - 1);
          comment.upvotes += 1;
          // Remove downvote karma and add upvote karma (net +2)
          commentAuthor.karma += 2;
        }
        await comment.save();
        await commentAuthor.save();

        existingVote.voteType = voteType;
        await existingVote.save();

        return res.status(200).json({
          comment: await findCommentById(id),
          message: "Vote updated",
        });
      }
    }

    // First time voting
    if (voteType === "up") {
      comment.upvotes += 1;
      // Increase author karma on upvote
      commentAuthor.karma += 1;
    } else {
      comment.downvotes += 1;
      // Decrease author karma on downvote
      commentAuthor.karma = Math.max(0, commentAuthor.karma - 1);
    }
    await comment.save();
    await commentAuthor.save();

    await Vote.create({
      user: userId,
      targetId: id,
      targetType: "Comment",
      voteType,
    });

    res.status(200).json({
      comment: await findCommentById(id),
      message: "Vote registered",
    });
  } catch (error) {
    console.error("Vote Comment Error:", error);
    res.status(500).json({
      message: "Error voting on comment",
      error: error.message,
    });
  }
};
