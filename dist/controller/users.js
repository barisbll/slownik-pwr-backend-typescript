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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const users_1 = require("../model/users");
const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { username } = req.body;
    const { email } = req.body;
    const { password } = req.body;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(422).json({ errors });
    }
    try {
        const hashedPw = yield bcryptjs_1.default.hash(password, 12);
        const user = new users_1.User({
            username,
            email,
            password: hashedPw,
        });
        const newUser = yield user.save();
        res.status(201).json({
            username: newUser.username,
            email: newUser.email,
            _id: newUser._id,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.signup = signup;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const { password } = req.body;
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(422).json({ errors });
    }
    try {
        const user = yield users_1.User.findOne({ email });
        if (!user) {
            const err = new Error("A user with that mail does not exist");
            err.status = 401;
            throw err;
        }
        const isEqual = yield bcryptjs_1.default.compare(password, user.password);
        if (!isEqual) {
            const err = new Error("Wrong email or password");
            err.status = 401;
            throw err;
        }
        const token = jsonwebtoken_1.default.sign({
            email: user.email,
            userId: user._id.toString(),
        }, "secret", { expiresIn: "48h" });
        res.status(200).json({ token, userId: user._id.toString() });
    }
    catch (err) {
        next(err);
    }
});
exports.login = login;
