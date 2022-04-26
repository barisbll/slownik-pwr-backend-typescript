import express, {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";
import { json } from "body-parser";
import cors from "cors";
import mongoose, { HydratedDocument, Types } from "mongoose";

import secret from "./secret";
import postRoutes from "./routes/posts";
import authRoutes from "./routes/users";
import { get404 } from "./controller/404";
import { User, UserI } from "./model/users";

const app = express();

app.use(cors());
app.use(json());

app.use((req: Request, res, next) => {
  User.findById("6263f69f49ed0b9f655a29b7")
    .then((user) => {
      req.user = user! as HydratedDocument<UserI>;
      next();
    })
    .catch((err) => console.log(err));
});

// Routes
app.use("/posts", postRoutes);
app.use("/auth", authRoutes);

mongoose
  .connect(secret.mongodbSecret)
  .then(() => {
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: "Baris",
          email: "baris@test.com",
          password: "baris",
          posts: [],
        });
        user.save();
      }
    });
    app.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });

// mongoose
//   .connect(secret.mongodbSecret)
//   .then(() => {
//     app.listen(8080);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

// 404 page to catch invalid requests
app.use(get404);

// extending error interface to have attributes
interface ErrorMiddleware extends Error {
  status?: number;
  message: string;
}

// express.js error handling middleware
app.use((error: ErrorMiddleware, req: Request, res: Response) => {
  console.log("Im here");
  console.log(error);
  if (!error.status) error.status = 500;
  res.status(error.status).json({ error: error.message });
});
