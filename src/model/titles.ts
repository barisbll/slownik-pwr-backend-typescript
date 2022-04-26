import mongoose from "mongoose";
import { Schema, Types } from "mongoose";

interface TitleI {
  name: string;
  counter: number;
  dayCounter: number;
  weekCounter: number;
  monthCounter: number;
  posts: Types.Array<Types.ObjectId>;
}

const title = new Schema<TitleI>({
  name: { type: String, required: true },
  counter: { type: Number, required: true },
  dayCounter: { type: Number, required: true },
  weekCounter: { type: Number, required: true },
  monthCounter: { type: Number, required: true },
  posts: { type: [Types.ObjectId], required: true, ref: "Post" },
});

export const Title = mongoose.model("Title", title);
