"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const isAuth = (req, res, next) => {
    const authHeader = req.get("Authorization");
    try {
        if (!authHeader) {
            const err = new Error("Not authenticated");
            err.status = 401;
            throw err;
        }
        const token = authHeader.split(" ")[1];
        const decodedToken = jsonwebtoken_1.default.verify(token, "secret");
        if (!decodedToken) {
            const err = new Error("Not authenticated");
            err.status = 401;
            throw err;
        }
        req.userId = decodedToken.userId;
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.default = isAuth;
