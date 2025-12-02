import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    voteType: {
      type: String,
      enum: ["up", "down"],
      required: true,
    },
    targetType: {
      type: String,
      enum: ["Post", "Comment"], // Matches model names for dynamic ref
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'targetType', // Allows population based on targetType
    },
  },
  { timestamps: true }
);

// Ensure a user can only vote once per target
voteSchema.index({ user: 1, targetId: 1, targetType: 1 }, { unique: true });

const Vote = mongoose.model("Vote", voteSchema);
export default Vote;