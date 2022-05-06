import { ObjectId } from "mongoose";
import { validationResult } from "express-validator";
// eslint-disable-next-line @typescript-eslint/no-redeclare
import { NextFunction, RequestHandler, Request, Response } from "express";

import { Title } from "../model/titles";
import { Post } from "../model/posts";
import { User } from "../model/users";
import { CustomError } from "../util/customError";

const POSTS_PER_PAGE = 7;

export const createTitle: RequestHandler = async (req, res, next) => {
  const { title, post } = req.body as { title: string; post: string };
  const { userId } = req;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(500).json({ errors });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new CustomError("User does not exist!");
    }

    const existingTitle = await Title.findOne({ name: title });

    if (existingTitle) {
      throw new CustomError("Title already exists!");
    }

    const titleObject = new Title({
      name: title,
      counter: 1,
      dayCounter: 1,
      weekCounter: 1,
      monthCounter: 1,
      posts: [],
    });

    const savedTitle = await titleObject.save();

    const postObject = new Post({
      content: post,
      titleId: savedTitle._id,
      userId: user._id,
    });

    const savedPost = await postObject.save();

    user.posts.push(savedPost._id);
    user.save();

    savedTitle.posts.push(savedPost._id);
    const result = await savedTitle.save();

    res.status(201).json({ result });
  } catch (err) {
    next(err);
  }
};

export const createPost: RequestHandler = async (req, res, next) => {
  const { titleId, post } = req.body as { titleId: string; post: string };
  const { userId } = req;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(422).json({ errors });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new CustomError("User does not exist!");
    }

    const title = await Title.findById(titleId);

    if (!title) {
      throw new CustomError("Title id does not exist!");
    }

    const postObject = new Post({
      content: post,
      titleId: title._id,
      userId: user._id,
      date: new Date(),
    });

    const savedPost = await postObject.save();

    user.posts.push(savedPost._id);
    user.save();

    title.counter += 1;
    title.dayCounter += 1;
    title.weekCounter += 1;
    title.monthCounter += 1;
    title.posts.push(savedPost._id);
    const savedTitle = await title.save();

    res.status(201).json({ savedTitle });
  } catch (err) {
    next(err);
  }
};

export const getTitle: RequestHandler = async (req, res) => {
  const { titleId } = req.params as { titleId: string };
  const { pId = "1" } = req.query as { pId: string };
  try {
    // Check if the title exists
    const foundTitle = await Title.findById(titleId);

    if (!foundTitle) {
      throw new CustomError("Title Id Does Not Exist!");
    }

    // Pagination boundaries for quick filtering
    const paginationStart = (+pId - 1) * POSTS_PER_PAGE;
    const paginationEnds = (+pId - 1) * POSTS_PER_PAGE + POSTS_PER_PAGE;

    // Filter for POST_PER_PAGE limit
    const paginatedPosts = foundTitle.posts.filter(
      (_, idx) => idx >= paginationStart && idx < paginationEnds
    );

    if (paginatedPosts.length === 0) {
      throw new CustomError("There is no post in that page");
    }

    // Result array's type
    type FoundPost = {
      content: string;
      userId: ObjectId;
    };

    // Array to return in response
    const arr: FoundPost[] = [];

    const paginationHelperFunction = async (post: any) => {
      const foundPost = (await Post.findOne({
        _id: post.toString(),
      }).select("content userId date -_id")!) as unknown as FoundPost;

      arr.push(foundPost);

      // If it found all the posts in that page return
      if (arr.length === paginatedPosts.length) {
        return res.status(200).json({ arr });
      }

      return foundPost;
    };

    return paginatedPosts.map(paginationHelperFunction);
  } catch ({ message }: unknown) {
    res.status(500).json({ err: message });
  }
};

enum Filter {
  ALL_TIME,
  DAY,
  WEEK,
  MONTH,
}

// Gets the most popular titles based on filter
// filter : 0 -> counter
// filter : 1 -> dayCounter ...
export const getTitles: RequestHandler = async (req, res, next) => {
  const { filter } = req.params as unknown as { filter: number };

  let sortCategory: string;

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
    const bestTitles = await Title.find()
      .sort("-" + sortCategory)
      .select(`name ${sortCategory}`)
      .limit(POSTS_PER_PAGE);

    res.json({ bestTitles });
  } catch (err) {
    next(err);
  }
};

export const updatePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { postId, postContent } = req.body as unknown as {
    postId: string;
    postContent: string;
  };
  try {
    // Check if body parameters are given
    if (!postId || !postContent) {
      throw new CustomError("Body parameters are not given");
    }

    // Check if given post exists
    const foundPost = await Post.findById(postId);

    // If given post not exist throw an error
    if (!foundPost) {
      throw new CustomError("There is no post post with given id");
    }

    res.json({ postId });
  } catch (err) {
    console.log("test1");
    // console.log(err);
    next(err);
  }
};

export const deletePost: RequestHandler = async (req, res, next) => {
  try {
  } catch (err) {
    next(err);
  }
};
