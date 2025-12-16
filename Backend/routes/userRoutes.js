import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getMe,
  searchUsersController, // <--- Import this
} from "../controllers/userController.js";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/me/info", protect, getMe);
router.put(
  "/profile",
  protect,
  upload.fields([
    { name: "profilePictureUrl", maxCount: 1 },
    { name: "coverPictureUrl", maxCount: 1 },
  ]),
  updateUserProfile
);

// --- Add this route BEFORE /:username ---
router.get("/search", searchUsersController);

router.get("/:username", getUserProfile);

export default router;
