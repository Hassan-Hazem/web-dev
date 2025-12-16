import User from '../models/userModel.js';


export const createUser = async (userData) => {
  const user = new User(userData);
  return await user.save();
};


export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

export const searchUsers = async (query, skip = 0, limit = 10) => {
  return await User.find({
    username: { $regex: query, $options: "i" }, // Case-insensitive partial match
  })
    .select("username profilePictureUrl karma bio") // Only return public info
    .skip(skip)
    .limit(limit);
};
export const findUserByUsername = async (username) => {
  return await User.findOne({ username });
};


export const findUserById = async (id) => {
  return await User.findById(id);
};


export const updateUser = async (userId, updateData) => {
  return await User.findByIdAndUpdate(userId, updateData, { new: true });
};


export const deleteUser = async (userId) => {
  return await User.findByIdAndDelete(userId);
};

// used for google oauth to know if the google account is already linked to a user
export const findUserByGoogleId = async (googleId) => {
    return await User.findOne({ googleId });
};