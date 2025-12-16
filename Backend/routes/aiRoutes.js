import express from "express";
import { summarizePostController } from "../controllers/aiController.js";

const router = express.Router();

// --- POST /api/ai/summarize ---
// Summarize a post using the AI Service
router.post("/summarize", summarizePostController);

export default router;
