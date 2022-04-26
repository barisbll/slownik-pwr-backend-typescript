import { RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

import { CustomError } from "../util/interfaces";

interface Token extends JwtPayload {
  email: string;
  userId: string;
}

const isAuth: RequestHandler = (req, res, next) => {
  const authHeader = req.get("Authorization");

  try {
    if (!authHeader) {
      const err: CustomError = new Error("Not authenticated");
      err.status = 401;
      throw err;
    }

    const token = authHeader.split(" ")[1];

    const decodedToken: Token = jwt.verify(token, "secret") as Token;

    if (!decodedToken) {
      const err: CustomError = new Error("Not authenticated");
      err.status = 401;
      throw err;
    }

    req.userId = decodedToken.userId;

    next();
  } catch (err) {
    next(err);
  }
};

export default isAuth;
