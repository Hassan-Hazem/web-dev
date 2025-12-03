import express from "express";
import {
  createPostController,
  getAllPosts,
  getPost,
  getCommunityPosts,
  getUserPosts,
  deletePost,
  votePost,
} from "../controllers/postController.js";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
const router = express.Router();

router.get("/", getAllPosts); 
router.get("/:id", getPost); 
router.get("/community/:communityName", getCommunityPosts); 
router.get("/user/:username", getUserPosts); 

router.post("/", protect, upload.single("image"), createPostController); 
router.delete("/:id", protect, deletePost); 
router.post("/:id/vote", protect, votePost); 

export default router;