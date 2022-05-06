import { RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { CustomError } from "../util/customError";

interface Token extends JwtPayload {
  email: string;
  userId: string;
}

const isAuth: RequestHandler = (req, res, next) => {
  const authHeader = req.get("Authorization");

  try {
    if (!authHeader) {
      throw new CustomError("Not authenticated", 401);
    }

    const token = authHeader.split(" ")[1];

    const decodedToken: Token = jwt.verify(token, "secret") as Token;

    if (!decodedToken) {
      throw new CustomError("Not authenticated", 401);
    }

    req.userId = decodedToken.userId;

    next();
  } catch (err) {
    next(err);
  }
};

export default isAuth;
