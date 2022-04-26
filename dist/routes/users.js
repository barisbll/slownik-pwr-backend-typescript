"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const users_1 = require("../controller/users");
const users_2 = require("../model/users");
const router = (0, express_1.Router)();
router.post("/signup", [
    // Username validators
    (0, express_validator_1.body)("username")
        .isAlphanumeric()
        .withMessage("The username can only contains numbers and characters")
        .isLength({ min: 4, max: 15 })
        .withMessage("The username's length must be between 4 - 15 characters"),
    // Email validators
    (0, express_validator_1.body)("email")
        .normalizeEmail()
        .isEmail()
        .withMessage("Please enter a valid email under either 'student.pwr.edu.pl' or 'pwr.edu.pl' domains")
        .custom((value) => users_2.User.findOne({ email: value }).then((result) => {
        if (result) {
            return Promise.reject(new Error("There is a user with that email, please pick another one"));
        }
        return true;
    }))
        .custom((value) => {
        if (value.split("@").at(-1) !== "student.pwr.edu.pl" &&
            value.split("@").at(-1) !== "pwr.edu.pl") {
            return Promise.reject(new Error("Email must be registered under either 'student.pwr.edu.pl' or 'pwr.edu.pl' domains "));
        }
        return true;
    }),
    // Password validators
    (0, express_validator_1.body)("password", "Password must be between 5 - 40 characters").isLength({
        min: 5,
        max: 40,
    }),
    // Confirm password validators
    (0, express_validator_1.body)("confirmPassword").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Confirm password must be equal to the password");
        }
        return true;
    }),
    // body("confirmPassword")
    //   .equals(req.body.password)
    //   .withMessage("Confirm password must be equal to the password"),
], users_1.signup);
router.post("/login", [
    // Email validators
    (0, express_validator_1.body)("email")
        .normalizeEmail()
        .isEmail()
        .withMessage("Please enter a valid email under either 'student.pwr.edu.pl' or 'pwr.edu.pl' domains")
        .custom((value) => users_2.User.findOne({ email: value }).then((result) => {
        if (!result) {
            return Promise.reject(new Error("There isn't user with that email, please write a signed up user"));
        }
        return true;
    }))
        .custom((value) => {
        if (value.split("@").at(-1) !== "student.pwr.edu.pl" &&
            value.split("@").at(-1) !== "pwr.edu.pl") {
            return Promise.reject(new Error("Email must be registered under either 'student.pwr.edu.pl' or 'pwr.edu.pl' domains "));
        }
        return true;
    }),
    // Password validators
    (0, express_validator_1.body)("password", "Password must be between 5 - 40 characters").isLength({
        min: 5,
        max: 40,
    }),
], users_1.login);
exports.default = router;
