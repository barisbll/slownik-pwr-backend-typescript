import mongoose from "mongoose";
import { Schema, Types } from "mongoose";

interface PostI {
  content: string;
  titleId: Types.ObjectId;
  userId: Types.ObjectId;
}

const post = new Schema<PostI>({
  content: { type: String, required: true },
  titleId: { type: Schema.Types.ObjectId, required: true, ref: "Title" },
  userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
});

export const Post = mongoose.model("Post", post);
