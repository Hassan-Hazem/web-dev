import express from 'express';
import { 
    getUserProfile, 
    updateUserProfile, 
    getMe, 
    searchUsersController // <--- Import this
} from '../controllers/userController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/me/info', protect, getMe); 
router.put('/profile', protect, updateUserProfile);

// --- Add this route BEFORE /:username ---
router.get('/search', searchUsersController);

router.get('/:username', getUserProfile);

export default router;