// Backend/controllers/userController.js
import {
  findUserByUsername,
  findUserById,
  updateUser,
  searchUsers,
} from "../repositories/userRepository.js";
import { updateUserSchema } from "../validators/userValidator.js";

export const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await findUserByUsername(username);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userProfile = {
      _id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      profilePictureUrl: user.profilePictureUrl,
      coverPictureUrl: user.coverPictureUrl,
      interests: user.interests,
      karma: user.karma,
      createdAt: user.createdAt,
    };

    res.status(200).json(userProfile);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server error fetching profile", error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  const userId = req.user.id; // Comes from authMiddleware

  // Validate request body
  const { error } = updateUserSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { username, bio, profilePictureUrl, coverPictureUrl, interests } =
    req.body;

  console.log("updateUserProfile called with:", {
    userId,
    username,
    bio,
    profilePictureUrl,
    coverPictureUrl,
    interests,
  });

  try {
    const user = await findUserById(userId);

    if (!user) {
      console.log("User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Current user data:", {
      username: user.username,
      currentCoverPicture: user.coverPictureUrl,
    });

    // Check if username is being updated and if it's already taken
    if (username !== undefined && username !== user.username) {
      const existingUser = await findUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    const updateData = {};
    if (username !== undefined) updateData.username = username.trim();
    if (bio !== undefined) updateData.bio = bio;
    if (profilePictureUrl !== undefined)
      updateData.profilePictureUrl = profilePictureUrl;
    if (coverPictureUrl !== undefined)
      updateData.coverPictureUrl = coverPictureUrl;
    if (interests !== undefined) updateData.interests = interests;

    console.log("Updating with data:", updateData);

    const updatedUser = await updateUser(userId, updateData);

    console.log("Updated user:", {
      username: updatedUser.username,
      newCoverPicture: updatedUser.coverPictureUrl,
    });

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        bio: updatedUser.bio,
        profilePictureUrl: updatedUser.profilePictureUrl,
        coverPictureUrl: updatedUser.coverPictureUrl,
        interests: updatedUser.interests,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res
      .status(500)
      .json({ message: "Server error updating profile", error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = req.user; // Populated by authMiddleware

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,

      profilePictureUrl: user.profilePictureUrl,
      coverPictureUrl: user.coverPictureUrl, // Banner image
      bio: user.bio, // User description
      karma: user.karma, // Total points
      createdAt: user.createdAt, // "Cake Day" (Join Date)
      interests: user.interests, // Selected topics
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
export const searchUsersController = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const users = await searchUsers(q, skip, limit);
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching users", error: error.message });
  }
};
