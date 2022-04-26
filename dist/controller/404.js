"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.get404 = void 0;
const get404 = (_, res) => {
    res.status(404).json({ error: "Not found" });
};
exports.get404 = get404;
