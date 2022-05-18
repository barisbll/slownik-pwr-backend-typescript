import mongoose from "mongoose";
import { Schema, Types } from "mongoose";

interface PostI {
  content: string;
  titleId: Types.ObjectId;
  userId: Types.ObjectId;
  date: Date;
}

const post = new Schema<PostI>({
  content: { type: String, text: true, required: true },
  titleId: { type: Schema.Types.ObjectId, required: true, ref: "Title" },
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  date: { type: Date, required: true },
});

post.index({ content: "text" });

export const Post = mongoose.model("Post", post);
