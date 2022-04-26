"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Title = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const title = new mongoose_2.Schema({
    name: { type: String, required: true },
    counter: { type: Number, required: true },
    dayCounter: { type: Number, required: true },
    weekCounter: { type: Number, required: true },
    monthCounter: { type: Number, required: true },
    posts: { type: [mongoose_2.Types.ObjectId], required: true, ref: "Post" },
});
exports.Title = mongoose_1.default.model("Title", title);
