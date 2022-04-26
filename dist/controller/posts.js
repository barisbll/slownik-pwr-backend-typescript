"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTitles = exports.getTitle = exports.createPost = exports.createTitle = void 0;
const express_validator_1 = require("express-validator");
const titles_1 = require("../model/titles");
const posts_1 = require("../model/posts");
const users_1 = require("../model/users");
const POSTS_PER_PAGE = 7;
const createTitle = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, post } = req.body;
    const { userId } = req;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(500).json({ errors });
    }
    try {
        const user = yield users_1.User.findById(userId);
        if (!user) {
            throw new Error("User does not exist!");
        }
        const existingTitle = yield titles_1.Title.findOne({ name: title });
        if (existingTitle) {
            throw new Error("Title already exists!");
        }
        const titleObject = new titles_1.Title({
            name: title,
            counter: 1,
            dayCounter: 1,
            weekCounter: 1,
            monthCounter: 1,
            posts: [],
        });
        const savedTitle = yield titleObject.save();
        const postObject = new posts_1.Post({
            content: post,
            titleId: savedTitle._id,
            userId: user._id,
        });
        const savedPost = yield postObject.save();
        user.posts.push(savedPost._id);
        user.save();
        savedTitle.posts.push(savedPost._id);
        const result = yield savedTitle.save();
        res.status(201).json({ result });
    }
    catch (err) {
        next(err);
    }
});
exports.createTitle = createTitle;
const createPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { titleId, post } = req.body;
    const { userId } = req;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(422).json({ errors });
    }
    try {
        const user = yield users_1.User.findById(userId);
        if (!user) {
            throw new Error("User does not exist!");
        }
        const title = yield titles_1.Title.findById(titleId);
        if (!title) {
            throw new Error("Title id does not exist!");
        }
        const postObject = new posts_1.Post({
            content: post,
            titleId: title._id,
            userId: user._id,
        });
        const savedPost = yield postObject.save();
        user.posts.push(savedPost._id);
        user.save();
        title.counter += 1;
        title.dayCounter += 1;
        title.weekCounter += 1;
        title.monthCounter += 1;
        title.posts.push(savedPost._id);
        const savedTitle = yield title.save();
        res.status(201).json({ savedTitle });
    }
    catch (err) {
        next(err);
    }
});
exports.createPost = createPost;
const getTitle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { titleId } = req.params;
    const { pId = "1" } = req.query;
    try {
        // Check if the title exists
        const foundTitle = yield titles_1.Title.findById(titleId);
        if (!foundTitle) {
            throw new Error("Title Id Does Not Exist!");
        }
        // Pagination boundaries for quick filtering
        const paginationStart = (+pId - 1) * POSTS_PER_PAGE;
        const paginationEnds = (+pId - 1) * POSTS_PER_PAGE + POSTS_PER_PAGE;
        // Filter for POST_PER_PAGE limit
        const paginatedPosts = foundTitle.posts.filter((_, idx) => idx >= paginationStart && idx < paginationEnds);
        if (paginatedPosts.length === 0) {
            throw new Error("There is no post in that page");
        }
        // Array to return in response
        const arr = [];
        const paginationHelperFunction = (post) => __awaiter(void 0, void 0, void 0, function* () {
            const foundPost = (yield posts_1.Post.findOne({
                _id: post.toString(),
            }).select("content userId -_id"));
            arr.push(foundPost);
            // If it found all the posts in that page return
            if (arr.length === paginatedPosts.length) {
                return res.status(200).json({ arr });
            }
            return foundPost;
        });
        return paginatedPosts.map(paginationHelperFunction);
    }
    catch ({ message }) {
        res.status(500).json({ err: message });
    }
});
exports.getTitle = getTitle;
var Filter;
(function (Filter) {
    Filter[Filter["ALL_TIME"] = 0] = "ALL_TIME";
    Filter[Filter["DAY"] = 1] = "DAY";
    Filter[Filter["WEEK"] = 2] = "WEEK";
    Filter[Filter["MONTH"] = 3] = "MONTH";
})(Filter || (Filter = {}));
// Gets the most popular titles based on filter
// filter : 0 -> counter
// filter : 1 -> dayCounter ...
const getTitles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { filter } = req.params;
    let sortCategory;
    switch (+filter) {
        case Filter.ALL_TIME:
            sortCategory = "counter";
            break;
        case Filter.DAY:
            sortCategory = "dayCounter";
            break;
        case Filter.WEEK:
            sortCategory = "weekCounter";
            break;
        case Filter.MONTH:
            sortCategory = "monthCounter";
            break;
        default:
            sortCategory = "dayCounter";
    }
    try {
        const bestTitles = yield titles_1.Title.find()
            .sort("-" + sortCategory)
            .select(`name ${sortCategory}`)
            .limit(POSTS_PER_PAGE);
        res.json({ bestTitles });
    }
    catch (err) {
        next(err);
    }
});
exports.getTitles = getTitles;
