import express from "express";
import { json } from "body-parser";
import cors from "cors";

import secret from "./secret";
import postRoutes from "./routes/posts";

const app = express();

app.use(cors);
app.use(json());

app.use("/posts", postRoutes);
