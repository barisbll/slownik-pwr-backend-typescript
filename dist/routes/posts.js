"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const posts_1 = require("../controller/posts");
const is_auth_1 = __importDefault(require("../middleware/is-auth"));
const router = (0, express_1.Router)();
router.post("/title", is_auth_1.default, [
    // Title length validator
    (0, express_validator_1.body)("title")
        .isLength({ max: 128 })
        .withMessage("The title's characters must be below 128"),
    // Post length validator
    (0, express_validator_1.body)("post")
        .isLength({ max: 560 })
        .withMessage("The post's characters must be below 560"),
], posts_1.createTitle);
router.post("/post", is_auth_1.default, [
    // Post length validator
    (0, express_validator_1.body)("post")
        .isLength({ max: 560 })
        .withMessage("The post's characters must be below 560"),
], posts_1.createPost);
router.get("/title/:titleId", posts_1.getTitle);
router.get("/titles/:filter", posts_1.getTitles);
router.get("/home", posts_1.getHomeContent);
router.put("/post", is_auth_1.default, [
    // Post length validator
    (0, express_validator_1.body)("postContent")
        .isLength({ max: 560 })
        .withMessage("The post's characters must be below 560"),
], posts_1.putUpdatePost);
router.delete("/post/:postId", is_auth_1.default, posts_1.deletePost);
router.get("/all-best-titles", posts_1.getAllBestTitles);
router.post("/title-text-search", posts_1.postTitleTextSearch);
router.post("/post-text-search", posts_1.postPostTextSearch);
router.post("/user-text-search", posts_1.postUserTextSearch);
exports.default = router;
