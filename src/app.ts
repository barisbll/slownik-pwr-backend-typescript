// eslint-disable-next-line @typescript-eslint/no-redeclare
import express, { Request, Response, ErrorRequestHandler } from "express";
import { json } from "body-parser";
import cors from "cors";
import mongoose from "mongoose";

import secret from "./secret";
import postRoutes from "./routes/posts";
import authRoutes from "./routes/users";
import { get404 } from "./controller/404";

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
const errorHandler: ErrorRequestHandler = (err, req, res) => {
  console.log(err);
  if (!err.status) err.status = 500;
  res.status(err.status).json({ err: err.message });
};

app.use(errorHandler);
