import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    displayName: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    otpCode: { type: String, default: "" },
    password: { type: String, default: "" },
    bio: { type: String, default: "" },
    posts: [{ type: Schema.Types.ObjectId, ref: "Post" }],
    points: { type: Number, default: 0 },
    avatar: { type: String, required: false },
    cover_img: { type: String, required: false },
    acctstatus: {
      type: String,
      enum: ["pending", "active", "declined", "suspended"],
      default: "pending",
      index: true,
    },
    isVerified: { type: Boolean, default: false },
    token: { type: String },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const User = model("User", userSchema);

export default User;
