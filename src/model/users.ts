import mongoose from "mongoose";
import { Schema, Types } from "mongoose";

export interface UserI {
  username: string;
  email: string;
  password: string;
  imgUrl?: string;
  posts: Types.Array<Types.ObjectId>;
}

const user = new Schema<UserI>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  imgUrl: String,
  posts: { type: [Types.ObjectId], required: true, ref: "Post" },
});

export const User = mongoose.model("User", user);
