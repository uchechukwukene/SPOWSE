import mongoose from "mongoose";

const { Schema, model } = mongoose;

const commentSchema = new Schema(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    content: { type: String, default: "" },
    mentions: [{ type: Schema.Types.ObjectId, ref: "User" }],
    hashtags: [{ type: String }],
    media: {
      key: { type: String },
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "Like" }],
    parentCommentId: { type: Schema.Types.ObjectId, ref: "Comment" },
  },
  { timestamps: true }
);

export default model("Comment", commentSchema);
