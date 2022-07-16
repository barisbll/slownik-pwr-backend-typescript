"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const user = new mongoose_2.Schema({
    username: { type: String, required: true, text: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    imgUrl: String,
    posts: { type: [mongoose_2.Types.ObjectId], required: true, ref: "Post" },
});
user.index({ usernamename: "text" });
exports.User = mongoose_1.default.model("User", user);
