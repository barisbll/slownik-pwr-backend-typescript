"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const post = new mongoose_2.Schema({
    content: { type: String, required: true },
    titleId: { type: mongoose_2.Schema.Types.ObjectId, required: true, ref: "Title" },
    userId: { type: mongoose_2.Schema.Types.ObjectId, required: true, ref: "User" },
});
exports.Post = mongoose_1.default.model("Post", post);
