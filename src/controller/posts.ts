import { validationResult } from "express-validator";
// eslint-disable-next-line @typescript-eslint/no-redeclare
import { NextFunction, RequestHandler, Request, Response } from "express";

import { Title } from "../model/titles";
import { Post } from "../model/posts";
import { User } from "../model/users";
import { CustomError } from "../util/customError";

const POSTS_PER_PAGE = 7;
const BEST_TITLES_LIMIT = 20;
const TEXT_SEARCH_RESULT_LIMIT = 5;

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
      date: new Date(),
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
    // const savedTitle = await title.save();
    await title.save();

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
  } catch (err) {
    next(err);
  }
};

export const getTitle: RequestHandler = async (req, res, next) => {
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

    const paginationHelperFunction = async (post: any) => {
      const foundPost = await Post.findOne({
        _id: post.toString(),
      })
        .populate("userId", "username")
        .select("content userId date ")!;

      return foundPost;
    };

    // Calling each of the posts with the helper function
    const paginatedPostsArray = [];
    let tempPaginatedPost;
    for (let each in paginatedPosts) {
      tempPaginatedPost = await paginationHelperFunction([
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
  } catch (err) {
    next(err);
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
      .limit(BEST_TITLES_LIMIT);

    res.json({ bestTitles });
  } catch (err) {
    next(err);
  }
};

export const putUpdatePost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { postId, postContent } = req.body as unknown as {
    postId: string;
    postContent: string;
  };

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(422).json({ errors });
  }

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

    foundPost.content = postContent;
    const updatedPost = await foundPost.save();

    res.status(201).json({ updatedPost });
  } catch (err) {
    next(err);
  }
};

export const deletePost: RequestHandler = async (req, res, next) => {
  const { postId } = req.params as { postId: string };
  const { userId } = req;

  try {
    if (!postId) {
      throw new CustomError("There is no postId parameter");
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new CustomError("User does not exist!");
    }

    const foundPost = await Post.findById(postId);

    if (!foundPost) {
      throw new CustomError("There is no post with the given id");
    }

    const titleOfPost = await Title.findById(foundPost?.titleId);

    if (!titleOfPost) {
      throw new Error("Post to be deleted has no title");
    }

    const newPosts = titleOfPost.posts.filter(
      (post) => post._id.toString() !== foundPost._id.toString()
    );

    if (newPosts.length === 0) {
      titleOfPost.delete();
    } else {
      //@ts-ignore
      titleOfPost.posts = newPosts;
      titleOfPost.save();
    }

    const newPostsUser = user.posts.filter(
      (post) => post._id.toString() !== foundPost._id.toString()
    );
    // @ts-ignore
    user.posts = newPostsUser;
    user.save();

    foundPost.delete();

    res.status(201).json({ success: "ok" });
  } catch (err) {
    next(err);
  }
};

export const getAllBestTitles: RequestHandler = async (req, res, next) => {
  const sortCategory = ["counter", "dayCounter", "weekCounter", "monthCounter"];

  try {
    const bestTitles = new Set();

    let tempTitle: any = null;
    for (let counter in sortCategory) {
      tempTitle = await Title.find()
        .sort("-" + sortCategory[counter])
        .select(`_id `)
        .limit(300);

      tempTitle.forEach((title: any) => {
        bestTitles.add(title._id.toString());
      });
    }

    // TODO: Return an array of ids, in each category max 300 and only first page

    res.json({ result: Array.from(bestTitles) });
  } catch (err) {
    next(err);
  }
};

export const postTitleTextSearch: RequestHandler = async (req, res, next) => {
  const { title } = req.body as { title: string };

  try {
    const textResult = await Title.find(
      { $text: { $search: title } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(TEXT_SEARCH_RESULT_LIMIT)
      .select("name");

    res.status(200).json({ result: textResult });
  } catch (err) {
    next(err);
  }
};

export const postPostTextSearch: RequestHandler = async (req, res, next) => {
  const { post } = req.body as { post: string };

  try {
    const textResult = await Post.find(
      { $text: { $search: post } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(TEXT_SEARCH_RESULT_LIMIT)
      .select("content titleId userId");

    res.status(200).json({ result: textResult });
  } catch (err) {
    next(err);
  }
};

export const postUserTextSearch: RequestHandler = async (req, res, next) => {
  const { user } = req.body as { user: string };

  try {
    const textResult = await User.find(
      { $text: { $search: user } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(TEXT_SEARCH_RESULT_LIMIT)
      .select("username");

    res.status(200).json({ result: textResult });
  } catch (err) {
    next(err);
  }
};
