import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // Node's built-in cryptographic library
import { 
  createUser, 
  findUserByEmail, 
  findUserByUsername,
  updateUser
} from '../repositories/userRepository.js';
import { generateVerificationCode, sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js'; 
import { registerSchema, loginSchema } from '../validators/userValidator.js';
import User from '../models/userModel.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', 
  });
};

// --- REGISTER ---
export const register = async (req, res) => {
  const { error } = registerSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { username, email, password } = req.body;

  try {
    const emailExists = await findUserByEmail(email);
    if (emailExists) return res.status(400).json({ message: 'User already exists' });

    const usernameExists = await findUserByUsername(username);
    if (usernameExists) return res.status(400).json({ message: 'Username already taken' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const verificationCode = generateVerificationCode();
 
    const verificationCodeExpiresAt = Date.now() + 10 * 60 * 1000; 

    const user = await createUser({
      username,
      email,
      passwordHash,
      verificationCode,
      verificationCodeExpiresAt, 
    });

    if (user) {
      try {
        await sendVerificationEmail(user.email, verificationCode);
        res.status(201).json({
          _id: user.id,
          username: user.username,
          email: user.email,
          message: 'Registration successful. A verification code has been sent to your email.',
        });
      } catch (emailError) {
        console.error("Email send failed:", emailError);
        res.status(500).json({ message: 'User created, but failed to send verification email.' });
      }
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- VERIFY EMAIL ---
export const verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ message: 'Email and verification code are required.' });
  }

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(200).json({ 
        message: 'Email already verified.', 
        token: generateToken(user._id),
        username: user.username,
        email: user.email
      });
    }

 
    if (user.verificationCode !== code) {
        return res.status(400).json({ message: 'Invalid verification code.' });
    }


    if (user.verificationCodeExpiresAt < Date.now()) {
        return res.status(400).json({ message: 'Verification code has expired. Please register again.' });
    }

    // Success
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiresAt = undefined; // Clear expiration
    await user.save();

    res.status(200).json({
      message: 'Email successfully verified.',
      token: generateToken(user._id),
      _id: user.id,
      username: user.username,
      email: user.email,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- LOGIN 
export const login = async (req, res) => {
  const { error } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { loginIdentifier, password } = req.body; 

  try {
    const user = await findUserByEmail(loginIdentifier) || await findUserByUsername(loginIdentifier);

    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      if (!user.isVerified) {
        return res.status(401).json({ message: 'Please verify your email before logging in.' });
      }
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

// `--- GOOGLE AUTH CALLBACK ---
export const googleAuthCallback = (req, res) => {
    const token = generateToken(req.user._id); 
    res.redirect(`http://localhost:5173/auth/success?token=${token}`);//edit here
};

export const getMe = (req, res) => {
    res.json({
        _id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        karma: req.user.karma,
        profilePictureUrl: req.user.profilePictureUrl,
    });
};

const createPasswordResetToken = () => {
    const resetToken = crypto.randomBytes(32).toString('hex');
    return resetToken;
};

export const forgotPassword = async (req, res) => {
    const { identifier } = req.body;

    let user;
    if (identifier.includes('@')) {
        user = await findUserByEmail(identifier);
    } else {
        user = await findUserByUsername(identifier);
    }
    if (!user) {
        return res.status(200).json({ message: 'If a user is registered with that email, a password reset link will be sent.' });
    }

    const resetToken = createPasswordResetToken();
    const tokenExpiry = Date.now() + 3600000; //1 hour

    await updateUser(user._id, {
        passwordResetToken: resetToken,
        passwordResetExpires: tokenExpiry,
    });

    const resetUrl = `http://localhost:5173/resetpassword?token=${resetToken}&email=${user.email}`; //edit here

    try {
        await sendPasswordResetEmail(user.email, resetUrl);
        res.status(200).json({ message: 'Password reset link sent to email.' });
    } catch (error) {
        console.error('Email sending error:', error);
        await updateUser(user._id, {
            passwordResetToken: undefined,
            passwordResetExpires: undefined,
        });
        res.status(500).json({ message: 'Failed to send password reset email.' });
    }
};

export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { email, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const user = await User.findOne({ 
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() },
        email: email // Optional: Adds extra verification
    });

  if (!user) {
              // Log the failure details for future debugging (optional, but helpful)
              console.warn(`Reset failure: Token ${token} not found, expired, or email ${email} mismatch.`);
              return res.status(400).json({ message: 'Token is invalid or has expired.' });
          }

    await updateUser(user._id, {
        passwordHash: passwordHash, 
        passwordResetToken: undefined,
        passwordResetExpires: undefined,
    });

    res.status(200).json({ message: 'Password successfully reset.' });
};