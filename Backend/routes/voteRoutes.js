import express from "express";
import {
  getUserUpvotedPosts,
  getUserDownvotedPosts,
} from "../controllers/voteController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();



router.get("/upvoted", protect, getUserUpvotedPosts);

router.get("/downvoted",protect, getUserDownvotedPosts);

export default router;