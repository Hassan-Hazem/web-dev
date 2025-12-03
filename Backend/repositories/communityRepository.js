import Community from "../models/communityModel.js";

export const createCommunity = async (communityData) => {
  const community = new Community(communityData);
  return await community.save();
};

export const findCommunityByName = async (name) => {
  return await Community.findOne({ name }).populate("creator", "username profilePictureUrl");
};

export const findCommunityById = async (id) => {
  return await Community.findById(id);
};


export const getAllCommunities = async (skip = 0, limit = 10, topic = null) => {
  const query = {};
  

  if (topic) {
    query.topics = topic; 
  }

  return await Community.find(query)
    .sort({ memberCount: -1 }) 
    .skip(skip)
    .limit(limit);
};

export const updateCommunity = async (id, updateData) => {
  return await Community.findByIdAndUpdate(id, updateData, { new: true });
};