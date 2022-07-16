"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-redeclare
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const body_parser_1 = require("body-parser");
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const secret_1 = __importDefault(require("./secret"));
const posts_1 = __importDefault(require("./routes/posts"));
const users_1 = __importDefault(require("./routes/users"));
const _404_1 = require("./controller/404");
const customError_1 = require("./util/customError");
const path_1 = require("path");
const fs_1 = require("fs");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, body_parser_1.json)());
app.use((0, helmet_1.default)());
// Routes
app.use("/posts", posts_1.default);
app.use("/auth", users_1.default);
const accessLogStream = (0, fs_1.createWriteStream)((0, path_1.join)(__dirname, "access.log"), {
    flags: "a",
});
app.use((0, morgan_1.default)("combined", { stream: accessLogStream }));
mongoose_1.default
    .connect(secret_1.default.mongodbSecret, { autoIndex: false })
    .then(() => {
    app.listen(8080);
})
    .catch((err) => {
    console.log(err);
});
// 404 page to catch invalid requests
app.use(_404_1.get404);
// express.js error handling middleware
const errorHandler = (err, req, res, 
// eslint-disable-next-line
next) => {
    let customError = err;
    if (!(err instanceof customError_1.CustomError)) {
        customError = new customError_1.CustomError(err.message);
    }
    res.status(customError.status).send(customError);
};
app.use(errorHandler);
