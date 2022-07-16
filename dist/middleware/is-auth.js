"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const customError_1 = require("../util/customError");
const isAuth = (req, res, next) => {
    const authHeader = req.get("Authorization");
    try {
        if (!authHeader) {
            throw new customError_1.CustomError("Not authenticated", 401);
        }
        const token = authHeader.split(" ")[1];
        const decodedToken = jsonwebtoken_1.default.verify(token, "secret");
        if (!decodedToken) {
            throw new customError_1.CustomError("Not authenticated", 401);
        }
        req.userId = decodedToken.userId;
        next();
    }
    catch (err) {
        next(err);
    }
};
exports.default = isAuth;
