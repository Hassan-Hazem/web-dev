import express from 'express';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
    console.log("Register request body:");
router.post('/login', login);
console.log("Login request body:");
export default router;