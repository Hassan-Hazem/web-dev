import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import { uploadFile } from "../controllers/uploadController.js";
import { protect } from "../middlewares/authMiddleware.js"; // Optional: if you want only logged-in users to upload

const router = express.Router();

// Route: POST /api/upload
// Usage: Send form-data with key 'file'
router.post("/", protect, upload.single("file"), uploadFile);

export default router;