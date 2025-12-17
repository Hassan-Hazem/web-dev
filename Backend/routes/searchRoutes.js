import express from 'express';
import { searchPosts, searchCommunities } from '../controllers/searchController.js';
import { optionalProtect } from '../middlewares/optionalAuthMiddleware.js';

const router = express.Router();

// Search posts with vector similarity
router.get('/posts', optionalProtect, searchPosts);

// Search communities
router.get('/communities', searchCommunities);

export default router;
