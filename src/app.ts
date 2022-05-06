// eslint-disable-next-line @typescript-eslint/no-redeclare
import express, { NextFunction, Request, Response } from "express";

import { json } from "body-parser";
import cors from "cors";
import mongoose from "mongoose";

import secret from "./secret";
import postRoutes from "./routes/posts";
import authRoutes from "./routes/users";
import { get404 } from "./controller/404";
import { CustomError } from "./util/customError";

const app = express();

app.use(cors());
app.use(json());

// Routes
app.use("/posts", postRoutes);
app.use("/auth", authRoutes);

mongoose
  .connect(secret.mongodbSecret)
  .then(() => {
    app.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });

// 404 page to catch invalid requests
app.use(get404);

// express.js error handling middleware
const errorHandler = (
  err: TypeError | CustomError,
  req: Request,
  res: Response,
  // eslint-disable-next-line
  next: NextFunction
) => {
  let customError = err;

  if (!(err instanceof CustomError)) {
    customError = new CustomError(err.message);
  }

  res.status((customError as CustomError).status).send(customError);
};

app.use(errorHandler);
