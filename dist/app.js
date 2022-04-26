"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const secret_1 = __importDefault(require("./secret"));
const posts_1 = __importDefault(require("./routes/posts"));
const users_1 = __importDefault(require("./routes/users"));
const _404_1 = require("./controller/404");
const users_2 = require("./model/users");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((0, body_parser_1.json)());
app.use((req, res, next) => {
    users_2.User.findById("6263f69f49ed0b9f655a29b7")
        .then((user) => {
        req.user = user;
        next();
    })
        .catch((err) => console.log(err));
});
// Routes
app.use("/posts", posts_1.default);
app.use("/auth", users_1.default);
mongoose_1.default
    .connect(secret_1.default.mongodbSecret)
    .then(() => {
    users_2.User.findOne().then((user) => {
        if (!user) {
            const user = new users_2.User({
                name: "Baris",
                email: "baris@test.com",
                password: "baris",
                posts: [],
            });
            user.save();
        }
    });
    app.listen(8080);
})
    .catch((err) => {
    console.log(err);
});
// mongoose
//   .connect(secret.mongodbSecret)
//   .then(() => {
//     app.listen(8080);
//   })
//   .catch((err) => {
//     console.log(err);
//   });
// 404 page to catch invalid requests
app.use(_404_1.get404);
// express.js error handling middleware
app.use((error, req, res) => {
    console.log("Im here");
    console.log(error);
    if (!error.status)
        error.status = 500;
    res.status(error.status).json({ error: error.message });
});
