
import express from 'express';
import { getUserProfile, updateUserProfile, getMe } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// More specific routes FIRST
router.get('/me/info', protect, getMe); 
router.put('/profile', protect, updateUserProfile);

// Generic routes LAST
router.get('/:username', getUserProfile);

export default router;