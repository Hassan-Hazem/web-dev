import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    content: {
      type: String,
      required: false, // Content might be optional if it's an image post
    },
    postType: {
      type: String,
      enum: ["text", "image", "link"],
      default: "text",
      required: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    upvotes: {
      type: Number,
      default: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    embedding: {
      type: [Number],  // Array of 768 floats
      required: false,
      select: false,   // Don't include in normal queries (optimization)
    },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
export default Post;