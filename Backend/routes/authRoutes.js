import express from 'express';

import passport from 'passport';
import '../config/passport.js';

import { register, login, verifyEmail, googleAuthCallback , getMe, forgotPassword, resetPassword} from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-email', verifyEmail);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    googleAuthCallback
);
router.get('/me', protect, getMe);

router.post('/forgotpassword', forgotPassword);
router.patch('/resetpassword/:token', resetPassword);
router.get('/resetpassword/:token', resetPassword);

export default router;