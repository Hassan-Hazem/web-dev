// Backend/controllers/userController.js
import { 
  findUserByUsername, 
  findUserById, 
  updateUser 
} from '../repositories/userRepository.js';


export const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await findUserByUsername(username);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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
    res.status(500).json({ message: 'Server error fetching profile', error: error.message });
  }
};


export const updateUserProfile = async (req, res) => {
  const userId = req.user.id; // Comes from authMiddleware
  const { bio, profilePictureUrl, coverPictureUrl, interests } = req.body;

  try {
  
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (profilePictureUrl !== undefined) updateData.profilePictureUrl = profilePictureUrl;
    if (coverPictureUrl !== undefined) updateData.coverPictureUrl = coverPictureUrl;
    if (interests !== undefined) updateData.interests = interests;


    const updatedUser = await updateUser(userId, updateData);

    res.status(200).json({
      message: 'Profile updated successfully',
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
    res.status(500).json({ message: 'Server error updating profile', error: error.message });
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
            bio: user.bio,                         // User description
            karma: user.karma,                     // Total points
            createdAt: user.createdAt,             // "Cake Day" (Join Date)        
            interests: user.interests              // Selected topics
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}