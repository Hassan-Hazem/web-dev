import {
  createCommunity,
  findCommunityByName,
  getAllCommunities,
  updateCommunity,
  getAvailableCommunitiesForPosting,
  getCommunityContributorsCount,
  searchCommunities,
} from "../repositories/communityRepository.js";
import Subscription from "../models/subscriptionModel.js";
import {
  createCommunitySchema,
  updateCommunitySchema,
} from "../validators/communityValidator.js";

export const createCommunityController = async (req, res) => {
  const { error } = createCommunitySchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { name, description, topics } = req.body;

  try {
    const existingCommunity = await findCommunityByName(name);
    if (existingCommunity) {
      return res
        .status(400)
        .json({ message: "Community with this name already exists" });
    }

    // 2. Create Community
    const isPublic = req.body.isPublic !== undefined ? req.body.isPublic : true;
    const newCommunity = await createCommunity({
      name,
      description,
      topics,
      isPublic,
      creator: req.user._id,
      memberCount: 1,
    });

    await Subscription.create({
      user: req.user._id,
      community: newCommunity._id,
    });

    res.status(201).json(newCommunity);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating community", error: error.message });
  }
};

export const getCommunity = async (req, res) => {
  const { name } = req.params;

  try {
    const community = await findCommunityByName(name);
    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    let isCreator = false;
    let isJoined = false;

    if (req.user) {
      isCreator = community.creator._id.toString() === req.user._id.toString();

      const subscription = await Subscription.findOne({
        user: req.user._id,
        community: community._id,
      });
      if (subscription) isJoined = true;
    }

    // ----------------------------------
    // CONTRIBUTORS COUNT (Reddit-style)
    // ----------------------------------
    const contributorsCount = await getCommunityContributorsCount(
      community._id
    );

    // ----------------------------------
    // RESPONSE
    // ----------------------------------

    res.status(200).json({
      ...community.toObject(),
      isCreator,
      isJoined,
      contributorsCount,
    });
  } catch (error) {
    console.error("Error fetching community", error);
    res
      .status(500)
      .json({ message: "Error fetching community", error: error.message });
  }
};

// --- GET COMMUNITIES (Explore Page) ---
export const getCommunities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const topic = req.query.topic || null;
    const skip = (page - 1) * limit;

    const communities = await getAllCommunities(skip, limit, topic);

    const communitiesWithJoinStatus = await Promise.all(
      communities.map(async (community) => {
        let isJoined = false;
        if (req.user) {
          const subscription = await Subscription.findOne({
            user: req.user._id,
            community: community._id,
          });
          if (subscription) isJoined = true;
        }
        return {
          ...community.toObject(),
          isJoined,
        };
      })
    );

    res.status(200).json(communitiesWithJoinStatus);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching communities", error: error.message });
  }
};

// --- JOIN COMMUNITY ---
export const joinCommunity = async (req, res) => {
  const { name } = req.params;
  const userId = req.user._id;

  try {
    const community = await findCommunityByName(name);
    if (!community)
      return res.status(404).json({ message: "Community not found" });

    const existingSub = await Subscription.findOne({
      user: userId,
      community: community._id,
    });
    if (existingSub) return res.status(400).json({ message: "Already joined" });

    await Subscription.create({ user: userId, community: community._id });

    community.memberCount += 1;
    await community.save();

    res.status(200).json({ message: `Successfully joined r/${name}` });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error joining community", error: error.message });
  }
};

// --- LEAVE COMMUNITY ---
export const leaveCommunity = async (req, res) => {
  const { name } = req.params;
  const userId = req.user._id;

  try {
    const community = await findCommunityByName(name);
    if (!community)
      return res.status(404).json({ message: "Community not found" });

    if (community.creator._id.toString() === userId.toString()) {
      return res
        .status(400)
        .json({ message: "Creator cannot leave their own community." });
    }

    const deletedSub = await Subscription.findOneAndDelete({
      user: userId,
      community: community._id,
    });
    if (!deletedSub)
      return res.status(400).json({ message: "You are not a member" });

    community.memberCount = Math.max(0, community.memberCount - 1);
    await community.save();

    res.status(200).json({ message: `Successfully left r/${name}` });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error leaving community", error: error.message });
  }
};

// --- UPDATE COMMUNITY ---
export const updateCommunityController = async (req, res) => {
  const { name: paramName } = req.params;
  const { error } = updateCommunitySchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  try {
    const community = await findCommunityByName(paramName);
    if (!community)
      return res.status(404).json({ message: "Community not found" });

    // only creator can update
    if (
      !req.user ||
      community.creator._id.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this community" });
    }

    // if name is being changed, ensure it's not taken
    if (req.body.name && req.body.name !== community.name) {
      const existing = await findCommunityByName(req.body.name);
      if (existing)
        return res
          .status(400)
          .json({ message: "Community name already taken" });
    }

    // Get file paths from uploaded files
    const profilePictureUrl =
      req.files?.profilePictureUrl?.[0]?.path || req.body.profilePictureUrl;
    const coverPictureUrl =
      req.files?.coverPictureUrl?.[0]?.path || req.body.coverPictureUrl;

    // Build update data
    const updateData = { ...req.body };
    if (profilePictureUrl !== undefined)
      updateData.profilePictureUrl = profilePictureUrl;
    if (coverPictureUrl !== undefined)
      updateData.coverPictureUrl = coverPictureUrl;

    const updated = await updateCommunity(community._id, updateData);
    res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating community", err);
    res
      .status(500)
      .json({ message: "Error updating community", error: err.message });
  }
};

// --- GET AVAILABLE COMMUNITIES FOR POSTING (For dropdown in create post modal) ---
export const getAvailableCommunitiesForPostingController = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const communities = await getAvailableCommunitiesForPosting(userId);
    res.status(200).json(communities);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching communities", error: error.message });
  }
};
export const searchCommunitiesController = async (req, res) => {
  try {
    const { q } = req.query; // Get search query ?q=keyword
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const communities = await searchCommunities(q, skip, limit);

    // Add 'isJoined' status for the logged-in user
    const communitiesWithJoinStatus = await Promise.all(
      communities.map(async (community) => {
        let isJoined = false;
        if (req.user) {
          const subscription = await Subscription.findOne({
            user: req.user._id,
            community: community._id,
          });
          if (subscription) isJoined = true;
        }
        return {
          ...community.toObject(),
          isJoined,
        };
      })
    );

    res.status(200).json(communitiesWithJoinStatus);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error searching communities", error: error.message });
  }
};
