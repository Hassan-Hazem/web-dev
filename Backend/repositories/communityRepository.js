import Community from "../models/communityModel.js";

export const createCommunity = async (communityData) => {
  const community = new Community(communityData);
  return await community.save();
};

export const findCommunityByName = async (name) => {
  return await Community.findOne({ name }).populate(
    "creator",
    "username profilePictureUrl"
  );
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
  // Use findByIdAndUpdate then populate creator so callers receive the same shape
  const updated = await Community.findByIdAndUpdate(id, updateData, {
    new: true,
  });
  if (!updated) return null;
  return await Community.findById(updated._id).populate(
    "creator",
    "username profilePictureUrl"
  );
};

// Get communities available for posting (public + joined restricted)
export const getAvailableCommunitiesForPosting = async (userId) => {
  const publicCommunities = await Community.find({ isPublic: true }).sort({
    memberCount: -1,
  });

  if (!userId) {
    return publicCommunities;
  }

  const Subscription = (await import("../models/subscriptionModel.js")).default;
  const userSubscriptions = await Subscription.find({ user: userId }).select(
    "community"
  );
  const joinedCommunityIds = userSubscriptions.map((sub) =>
    sub.community.toString()
  );

  const restrictedCommunities = await Community.find({
    _id: { $in: joinedCommunityIds },
    isPublic: false,
  }).sort({ memberCount: -1 });

  return [...publicCommunities, ...restrictedCommunities];
};
