import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";

import { User } from "../model/users";
import { CustomError } from "../util/interfaces";

export const signup: RequestHandler = async (req, res, next) => {
  const { username } = req.body as { username: string };
  const { email } = req.body as { email: string };
  const { password } = req.body as { password: string };

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(422).json({ errors });
  }

  try {
    const hashedPw = await bcrypt.hash(password, 12);

    const user = new User({
      username,
      email,
      password: hashedPw,
    });

    const newUser = await user.save();

    res.status(201).json({
      username: newUser.username,
      email: newUser.email,
      _id: newUser._id,
    });
  } catch (err) {
    next(err);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  const { email } = req.body as { email: string };
  const { password } = req.body as { password: string };

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(422).json({ errors });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      const err: CustomError = new Error(
        "A user with that mail does not exist"
      );
      err.status = 401;
      throw err;
    }

    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) {
      const err: CustomError = new Error("Wrong email or password");
      err.status = 401;
      throw err;
    }

    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      "secret",
      { expiresIn: "48h" }
    );

    res.status(200).json({ token, userId: user._id.toString() });
  } catch (err) {
    next(err);
  }
};
