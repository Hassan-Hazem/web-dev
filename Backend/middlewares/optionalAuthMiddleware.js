import jwt from 'jsonwebtoken';
import { findUserById } from '../repositories/userRepository.js';

export const optionalProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await findUserById(decoded.id);
    } catch (error) {
      // If token is invalid or expired, we just proceed as a guest.
      console.log("Optional auth check failed (proceeding as guest):", error.message);
    }
  }

  next();
};