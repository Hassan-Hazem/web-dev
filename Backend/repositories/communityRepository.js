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

// Get communities available for posting (public + joined restricted)
export const getAvailableCommunitiesForPosting = async (userId) => {
  // First, get all public communities
  const publicCommunities = await Community.find({ isPublic: true })
    .sort({ memberCount: -1 });

  // If user is not logged in, return only public communities
  if (!userId) {
    return publicCommunities;
  }

  // Get all communities the user has joined
  const Subscription = (await import("../models/subscriptionModel.js")).default;
  const userSubscriptions = await Subscription.find({ user: userId }).select("community");
  const joinedCommunityIds = userSubscriptions.map(sub => sub.community.toString());

  // Get restricted communities the user is a member of
  const restrictedCommunities = await Community.find({
    _id: { $in: joinedCommunityIds },
    isPublic: false
  }).sort({ memberCount: -1 });

  // Combine and return
  return [...publicCommunities, ...restrictedCommunities];
};