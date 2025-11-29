import User from '../models/userModel.js';


export const createUser = async (userData) => {
  const user = new User(userData);
  return await user.save();
};


export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
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