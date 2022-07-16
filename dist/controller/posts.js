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
exports.postUserTextSearch = exports.postPostTextSearch = exports.postTitleTextSearch = exports.getAllBestTitles = exports.deletePost = exports.putUpdatePost = exports.getHomeContent = exports.getTitles = exports.getTitle = exports.createPost = exports.createTitle = void 0;
const express_validator_1 = require("express-validator");
const titles_1 = require("../model/titles");
const posts_1 = require("../model/posts");
const users_1 = require("../model/users");
const customError_1 = require("../util/customError");
const POSTS_PER_PAGE = 7;
const BEST_TITLES_LIMIT = 20;
const TEXT_SEARCH_RESULT_LIMIT = 5;
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
            throw new customError_1.CustomError("User does not exist!");
        }
        const existingTitle = yield titles_1.Title.findOne({ name: title });
        if (existingTitle) {
            throw new customError_1.CustomError("Title already exists!");
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
            date: new Date(),
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
            throw new customError_1.CustomError("User does not exist!");
        }
        const title = yield titles_1.Title.findById(titleId);
        if (!title) {
            throw new customError_1.CustomError("Title id does not exist!");
        }
        const postObject = new posts_1.Post({
            content: post,
            titleId: title._id,
            userId: user._id,
            date: new Date(),
        });
        const savedPost = yield postObject.save();
        user.posts.push(savedPost._id);
        user.save();
        title.counter += 1;
        title.dayCounter += 1;
        title.weekCounter += 1;
        title.monthCounter += 1;
        title.posts.push(savedPost._id);
        // const savedTitle = await title.save();
        yield title.save();
        const response = {
            _id: savedPost._id,
            content: savedPost.content,
            date: savedPost.date,
            userId: {
                username: user.username,
                _id: user._id,
            },
        };
        res.status(201).json({ response });
    }
    catch (err) {
        next(err);
    }
});
exports.createPost = createPost;
const getTitle = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { titleId } = req.params;
    const { pId = "1" } = req.query;
    try {
        // Check if the title exists
        const foundTitle = yield titles_1.Title.findById(titleId);
        if (!foundTitle) {
            throw new customError_1.CustomError("Title Id Does Not Exist!");
        }
        // Pagination boundaries for quick filtering
        const paginationStart = (+pId - 1) * POSTS_PER_PAGE;
        const paginationEnds = (+pId - 1) * POSTS_PER_PAGE + POSTS_PER_PAGE;
        // Filter for POST_PER_PAGE limit
        const paginatedPosts = foundTitle.posts.filter((_, idx) => idx >= paginationStart && idx < paginationEnds);
        if (paginatedPosts.length === 0) {
            throw new customError_1.CustomError("There is no post in that page");
        }
        const paginationHelperFunction = (post) => __awaiter(void 0, void 0, void 0, function* () {
            const foundPost = yield posts_1.Post.findOne({
                _id: post.toString(),
            })
                .populate("userId", "username")
                .select("content userId date ");
            return foundPost;
        });
        // Calling each of the posts with the helper function
        const paginatedPostsArray = [];
        let tempPaginatedPost;
        for (let each in paginatedPosts) {
            tempPaginatedPost = yield paginationHelperFunction([
                paginatedPosts[each],
            ]);
            paginatedPostsArray.push(tempPaginatedPost);
        }
        // Result object to send
        const resultObject = {
            titleName: foundTitle.name,
            totalPages: Math.floor(foundTitle.posts.length / 7) + 1,
            totalPosts: foundTitle.posts.length,
            posts: paginatedPostsArray,
        };
        res.status(200).json(resultObject);
    }
    catch (err) {
        next(err);
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
            .limit(BEST_TITLES_LIMIT);
        res.json({ bestTitles });
    }
    catch (err) {
        next(err);
    }
});
exports.getTitles = getTitles;
const getHomeContent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Response array
    const result = [];
    try {
        // Fetch last 7 posts
        const lastPosts = yield posts_1.Post.find()
            .sort("-date")
            .limit(POSTS_PER_PAGE);
        for (const post of lastPosts) {
            if (!post) {
                throw new Error("Post is not found");
            }
            // Find title of those posts
            const title = yield titles_1.Title.findById(post.titleId);
            if (title) {
                title;
            }
            if (!title) {
                throw new Error("Title of the post not found");
            }
            // Find pageId of that post
            const postObjectId = post._id;
            const postIndexOnTitle = title === null || title === void 0 ? void 0 : title.posts.indexOf(postObjectId);
            let pageId = 0;
            if (typeof postIndexOnTitle === "number") {
                pageId = Math.floor(postIndexOnTitle / 7);
                pageId += 1;
            }
            // Find user of that post
            const user = yield users_1.User.findById(post.userId);
            if (!user) {
                throw new Error("User of the post not fount");
            }
            // Push the output to the result array
            result.push({
                postId: (_a = post._id) === null || _a === void 0 ? void 0 : _a.toString(),
                postContent: post.content,
                date: post.date,
                title: title.name,
                titleId: title._id.toString(),
                pageId: pageId,
                username: user.username,
                userId: user._id.toString(),
            });
        }
        res.status(200).json({ result });
    }
    catch (err) {
        next(err);
    }
});
exports.getHomeContent = getHomeContent;
const putUpdatePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId, postContent } = req.body;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(422).json({ errors });
    }
    try {
        // Check if body parameters are given
        if (!postId || !postContent) {
            throw new customError_1.CustomError("Body parameters are not given");
        }
        // Check if given post exists
        const foundPost = yield posts_1.Post.findById(postId);
        // If given post not exist throw an error
        if (!foundPost) {
            throw new customError_1.CustomError("There is no post post with given id");
        }
        foundPost.content = postContent;
        const updatedPost = yield foundPost.save();
        res.status(201).json({ updatedPost });
    }
    catch (err) {
        next(err);
    }
});
exports.putUpdatePost = putUpdatePost;
const deletePost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { postId } = req.params;
    const { userId } = req;
    try {
        if (!postId) {
            throw new customError_1.CustomError("There is no postId parameter");
        }
        const user = yield users_1.User.findById(userId);
        if (!user) {
            throw new customError_1.CustomError("User does not exist!");
        }
        const foundPost = yield posts_1.Post.findById(postId);
        if (!foundPost) {
            throw new customError_1.CustomError("There is no post with the given id");
        }
        const titleOfPost = yield titles_1.Title.findById(foundPost === null || foundPost === void 0 ? void 0 : foundPost.titleId);
        if (!titleOfPost) {
            throw new Error("Post to be deleted has no title");
        }
        const newPosts = titleOfPost.posts.filter((post) => post._id.toString() !== foundPost._id.toString());
        if (newPosts.length === 0) {
            titleOfPost.delete();
        }
        else {
            //@ts-ignore
            titleOfPost.posts = newPosts;
            titleOfPost.save();
        }
        const newPostsUser = user.posts.filter((post) => post._id.toString() !== foundPost._id.toString());
        // @ts-ignore
        user.posts = newPostsUser;
        user.save();
        foundPost.delete();
        res.status(201).json({ success: "ok" });
    }
    catch (err) {
        next(err);
    }
});
exports.deletePost = deletePost;
const getAllBestTitles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const sortCategory = ["counter", "dayCounter", "weekCounter", "monthCounter"];
    try {
        const bestTitles = new Set();
        let tempTitle = null;
        for (let counter in sortCategory) {
            tempTitle = yield titles_1.Title.find()
                .sort("-" + sortCategory[counter])
                .select(`_id `)
                .limit(300);
            tempTitle.forEach((title) => {
                bestTitles.add(title._id.toString());
            });
        }
        // TODO: Return an array of ids, in each category max 300 and only first page
        res.json({ result: Array.from(bestTitles) });
    }
    catch (err) {
        next(err);
    }
});
exports.getAllBestTitles = getAllBestTitles;
const postTitleTextSearch = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { title } = req.body;
    try {
        const textResult = yield titles_1.Title.find({ $text: { $search: title } }, { score: { $meta: "textScore" } })
            .sort({ score: { $meta: "textScore" } })
            .limit(TEXT_SEARCH_RESULT_LIMIT)
            .select("name");
        res.status(200).json({ result: textResult });
    }
    catch (err) {
        next(err);
    }
});
exports.postTitleTextSearch = postTitleTextSearch;
const postPostTextSearch = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { post } = req.body;
    try {
        const textResult = yield posts_1.Post.find({ $text: { $search: post } }, { score: { $meta: "textScore" } })
            .sort({ score: { $meta: "textScore" } })
            .limit(TEXT_SEARCH_RESULT_LIMIT)
            .select("content titleId userId");
        res.status(200).json({ result: textResult });
    }
    catch (err) {
        next(err);
    }
});
exports.postPostTextSearch = postPostTextSearch;
const postUserTextSearch = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { user } = req.body;
    try {
        const textResult = yield users_1.User.find({ $text: { $search: user } }, { score: { $meta: "textScore" } })
            .sort({ score: { $meta: "textScore" } })
            .limit(TEXT_SEARCH_RESULT_LIMIT)
            .select("username");
        res.status(200).json({ result: textResult });
    }
    catch (err) {
        next(err);
    }
});
exports.postUserTextSearch = postUserTextSearch;
