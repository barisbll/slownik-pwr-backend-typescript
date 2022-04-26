import { RequestHandler } from "express";

export const get404: RequestHandler = (_, res) => {
  res.status(404).json({ error: "Not found" });
};
