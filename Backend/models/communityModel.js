import mongoose from "mongoose";

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    description: {
      type: String,
      required: true,
      maxlength: 500,
    },
    coverPictureUrl: {
      type: String,
      default: "",
    },
    profilePictureUrl: {
      type: String,
      default: "",
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    memberCount: {
      type: Number,
      default: 1, 
    },
    topics: [{
      type: String,
      trim: true,
    }],
    isPublic: {
      type: Boolean,
      default: true,
      description: "If true, anyone can post/vote/comment. If false, only members can."
    },
  },
  { timestamps: true }
);

const Community = mongoose.model("Community", communitySchema);
export default Community;