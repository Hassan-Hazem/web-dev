import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      required: true,
    },
  },
  { timestamps: { createdAt: "joinedAt", updatedAt: false } }
);

// Ensure a user can only join a specific community once
subscriptionSchema.index({ user: 1, community: 1 }, { unique: true });

const Subscription = mongoose.model("Subscription", subscriptionSchema);
export default Subscription;