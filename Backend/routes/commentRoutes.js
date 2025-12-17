import express from "express";
import {
  createCommentController,
  getCommentController,
  getPostComments,
  getCommentReplies,
  getUserCommentsController,
  updateCommentController,
  deleteCommentController,
  voteCommentController,
} from "../controllers/commentController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { optionalProtect } from "../middlewares/optionalAuthMiddleware.js";

const router = express.Router();

// Create a new comment
router.post("/", protect, createCommentController);

// Get a single comment
router.get("/:id", optionalProtect, getCommentController);

// Get all comments for a post
router.get("/post/:postId", optionalProtect, getPostComments);

// Get replies to a comment
router.get("/:commentId/replies", optionalProtect, getCommentReplies);

// Get all comments by a user
router.get("/user/:username", optionalProtect, getUserCommentsController);

// Update a comment
router.put("/:id", protect, updateCommentController);

// Delete a comment
router.delete("/:id", protect, deleteCommentController);

// Vote on a comment
router.post("/:id/vote", protect, voteCommentController);

export default router;
