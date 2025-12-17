import express from "express";
import {
  createPostController,
  getAllPosts,
  getPost,
  getCommunityPosts,
  getUserPosts,
  votePost,
  deletePost,
  searchPosts, 
} from "../controllers/postController.js";
import {
  protect
} from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/", protect, upload.single("image"), createPostController);
router.get("/", getAllPosts);


router.get("/search", searchPosts);

router.get("/:id", getPost);
router.get("/community/:communityName", getCommunityPosts);
router.get("/user/:username", getUserPosts);
router.post("/:id/vote", protect, votePost);
router.delete("/:id", protect, deletePost);

export default router;