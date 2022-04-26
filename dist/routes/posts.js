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
router.post("/create-title", is_auth_1.default, [
    // Post length validator
    (0, express_validator_1.body)("post")
        .isLength({ max: 255 })
        .withMessage("The post's characters must be below 255"),
], posts_1.createTitle);
router.post("/create-post", is_auth_1.default, [
    // Post length validator
    (0, express_validator_1.body)("post")
        .isLength({ max: 255 })
        .withMessage("The post's characters must be below 255"),
], posts_1.createPost);
router.get("/get-title/:titleId", posts_1.getTitle);
router.get("/get-titles/:filter", posts_1.getTitles);
exports.default = router;
