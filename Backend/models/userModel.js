import mongoose from "mongoose";

const userSchema = new mongoose.Schema( 
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true, 
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Please fill a valid email address"],
    },
    passwordHash: {
      type: String,
      required: true,
    },
    isVerified: { 
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      required: false,
    },
    verificationCodeExpiresAt: {
      type: Date,
      required: false,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },
    profilePictureUrl: {
      type: String,
      default: "", 
    },
    karma: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
