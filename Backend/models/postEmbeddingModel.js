import mongoose from "mongoose";

const postEmbeddingSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      unique: true, // Ensures one embedding per post
    },
    embedding: {
      type: [Number], // Array of floats
      required: true,
    },
  },
  { timestamps: true }
);

const PostEmbedding = mongoose.model("PostEmbedding", postEmbeddingSchema);
export default PostEmbedding;