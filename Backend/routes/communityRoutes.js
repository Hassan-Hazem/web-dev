import express from "express";
import {
  createCommunityController,
  getCommunity,
  getCommunities,
  joinCommunity,
  leaveCommunity,
  updateCommunityController,
  getAvailableCommunitiesForPostingController
} from "../controllers/communityController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { optionalProtect } from "../middlewares/optionalAuthMiddleware.js";

const router = express.Router();


router.get("/", optionalProtect, getCommunities); 
router.get("/available/for-posting", protect, getAvailableCommunitiesForPostingController);
router.get("/:name", optionalProtect, getCommunity); 

router.post("/", protect, createCommunityController);
router.put("/:name", protect, updateCommunityController);
router.post("/:name/join", protect, joinCommunity);
router.post("/:name/leave", protect, leaveCommunity);

export default router;