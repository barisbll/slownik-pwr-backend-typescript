import { HydratedDocument } from "mongoose";
import { UserI } from "./model/posts";

declare global {
  namespace Express {
    interface Request {
      user?: HydratedDocument<UserI>;
      userId?: string;
    }
  }
}
