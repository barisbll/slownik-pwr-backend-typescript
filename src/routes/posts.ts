import { Router } from "express";
import { body } from "express-validator";

import {
  createPost,
  createTitle,
  getTitle,
  getTitles,
  getHomeContent,
  putUpdatePost,
  deletePost,
  getAllBestTitles,
  postTitleTextSearch,
  postPostTextSearch,
  postUserTextSearch,
} from "../controller/posts";
import isAuth from "../middleware/is-auth";

const router = Router();

router.post(
  "/title",
  isAuth,
  [
    // Title length validator
    body("title")
      .isLength({ max: 128 })
      .withMessage("The title's characters must be below 128"),
    // Post length validator
    body("post")
      .isLength({ max: 560 })
      .withMessage("The post's characters must be below 560"),
  ],
  createTitle
);

router.post(
  "/post",
  isAuth,
  [
    // Post length validator
    body("post")
      .isLength({ max: 560 })
      .withMessage("The post's characters must be below 560"),
  ],
  createPost
);

router.get("/title/:titleId", getTitle);

router.get("/titles/:filter", getTitles);

router.get("/home", getHomeContent);

router.put(
  "/post",
  isAuth,
  [
    // Post length validator
    body("postContent")
      .isLength({ max: 560 })
      .withMessage("The post's characters must be below 560"),
  ],
  putUpdatePost
);

router.delete("/post/:postId", isAuth, deletePost);

router.get("/all-best-titles", getAllBestTitles);

router.post("/title-text-search", postTitleTextSearch);

router.post("/post-text-search", postPostTextSearch);

router.post("/user-text-search", postUserTextSearch);

export default router;
