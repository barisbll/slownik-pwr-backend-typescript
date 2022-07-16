// eslint-disable-next-line @typescript-eslint/no-redeclare
import express, { NextFunction, Request, Response } from "express";
import "dotenv/config";

import { json } from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import helmet from "helmet";
import morgan from "morgan";

import secret from "./secret";
import postRoutes from "./routes/posts";
import authRoutes from "./routes/users";
import { get404 } from "./controller/404";
import { CustomError } from "./util/customError";

import { join } from "path";
import { createWriteStream } from "fs";

const app = express();

app.use(cors());
app.use(json());
app.use(helmet());

// Routes
app.use("/posts", postRoutes);
app.use("/auth", authRoutes);

const accessLogStream = createWriteStream(join(__dirname, "access.log"), {
  flags: "a",
});

app.use(morgan("combined", { stream: accessLogStream }));

mongoose
  .connect(secret.mongodbSecret, { autoIndex: false })
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
