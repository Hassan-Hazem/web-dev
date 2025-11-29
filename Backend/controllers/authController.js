import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { 
  createUser, 
  findUserByEmail, 
  findUserByUsername 
} from '../repositories/userRepository.js';

import { registerSchema, loginSchema } from '../validators/userValidator.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', 
  });
};

export const register = async (req, res) => {
console.log("Register request body:", req.body);
  const { error } = registerSchema.validate(req.body);
  
  if (error) {
   
    return res.status(400).json({ message: error.details[0].message });
  }

  const { username, email, password } = req.body;

  try {
    const emailExists = await findUserByEmail(email);
    if (emailExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const usernameExists = await findUserByUsername(username);
    if (usernameExists) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await createUser({
      username,
      email,
      passwordHash,
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
console.log("Login request body:", req.body);
  const { error } = loginSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { loginIdentifier, password } = req.body; 

  try {
    const user = await findUserByEmail(loginIdentifier) || await findUserByUsername(loginIdentifier);

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      res.json({
        _id: user.id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};