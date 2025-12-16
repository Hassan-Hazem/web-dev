import express from "express";
import {
  createCommunityController,
  getCommunity,
  getCommunities,
  joinCommunity,
  leaveCommunity,
  updateCommunityController,
  getAvailableCommunitiesForPostingController,
  searchCommunitiesController, // <--- Import this
} from "../controllers/communityController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { optionalProtect } from "../middlewares/optionalAuthMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/", optionalProtect, getCommunities);
router.get(
  "/available/for-posting",
  protect,
  getAvailableCommunitiesForPostingController
);

router.get("/search", optionalProtect, searchCommunitiesController);

router.get("/:name", optionalProtect, getCommunity);

router.post("/", protect, createCommunityController);
router.put(
  "/:name",
  protect,
  upload.fields([
    { name: "profilePictureUrl", maxCount: 1 },
    { name: "coverPictureUrl", maxCount: 1 },
  ]),
  updateCommunityController
);
router.post("/:name/join", protect, joinCommunity);
router.post("/:name/leave", protect, leaveCommunity);

export default router;
