import mongoose from "mongoose";

const { Schema, model } = mongoose;

const postSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    content: { type: String, required: true },
    media: {
      key: [{ type: String }],
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "Like" }],
    repostedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    hashtags: [{ type: String }],
    mentions: [{ type: Schema.Types.ObjectId, ref: "User" }],
    originalPostId: { type: Schema.Types.ObjectId, ref: "Post" },
  },
  { timestamps: true }
);

export default model("Post", postSchema);
