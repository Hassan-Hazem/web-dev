import express from "express";
import {
  createCommunityController,
  getCommunity,
  getCommunities,
  joinCommunity,
  leaveCommunity
} from "../controllers/communityController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { optionalProtect } from "../middlewares/optionalAuthMiddleware.js";

const router = express.Router();


router.get("/", getCommunities); 
router.get("/:name", optionalProtect, getCommunity); 

router.post("/", protect, createCommunityController);
router.post("/:name/join", protect, joinCommunity);
router.post("/:name/leave", protect, leaveCommunity);

export default router;