
import express from 'express';
import { getUserProfile, updateUserProfile, getMe } from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();


router.get('/:username', getUserProfile);


router.get('/me/info', protect, getMe); 
router.put('/profile', protect, updateUserProfile);

export default router;