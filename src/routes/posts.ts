import { Router } from "express";
import { body } from "express-validator";

import {
  createPost,
  createTitle,
  getTitle,
  getTitles,
  updatePost,
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
    // Post length validator
    body("post")
      .isLength({ max: 560 })
      .withMessage("The post's characters must be below 255"),
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
      .withMessage("The post's characters must be below 255"),
  ],
  createPost
);

router.get("/title/:titleId", getTitle);

router.get("/titles/:filter", getTitles);

router.put("/post", isAuth, updatePost);

router.delete("/post/:postId", isAuth, deletePost);

router.get("/all-best-titles", getAllBestTitles);

router.post("/title-text-search", postTitleTextSearch);

router.post("/post-text-search", postPostTextSearch);

router.post("/user-text-search", postUserTextSearch);

export default router;
