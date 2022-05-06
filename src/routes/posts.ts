import { Router } from "express";
import { body } from "express-validator";

import {
  createPost,
  createTitle,
  getTitle,
  getTitles,
  updatePost,
  deletePost,
} from "../controller/posts";
import isAuth from "../middleware/is-auth";

const router = Router();

router.post(
  "/create-title",
  isAuth,
  [
    // Post length validator
    body("post")
      .isLength({ max: 255 })
      .withMessage("The post's characters must be below 255"),
  ],
  createTitle
);

router.post(
  "/create-post",
  isAuth,
  [
    // Post length validator
    body("post")
      .isLength({ max: 255 })
      .withMessage("The post's characters must be below 255"),
  ],
  createPost
);

router.get("/get-title/:titleId", getTitle);

router.get("/get-titles/:filter", getTitles);

router.put("/update-post", isAuth, updatePost);

router.put("/delete-post/:postId", isAuth, deletePost);

export default router;
