import jwt from "jsonwebtoken";
import User from "../Model/user.js";
import { createError } from "./createError.js";
import XRegExp from "xregexp";

export const verifyToken = (req, res, next) => {
  console.log(1);
  const token = req.cookies.token;
  if (!token) {
    console.log(132);
    return next(createError(401, "You are not authenticated!"));
  }

  console.log(12, token);
  jwt.verify(token, process.env.JWT, (err, user) => {
    if (err) {
      return next(createError(402, "Token is not valid!"));
    }
    console.log(2);
    console.log(user);
    req.user = user;
    next();
  });
};

export const verifyUser = (req, res, next) => {
  verifyToken(req, res, () => {
    if (
      req.user?.id === req.params?.id ||
      req.user?.isAdmin ||
      !req.user?.isAdmin
    ) {
      next();
    } else {
      return next(createError(403, "You are not authorized!"));
    }
  });
};

export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    // console.log(1, req);
    if (req.user?.isAdmin) {
      next();
    } else {
      return next(createError(403, "You are not authorized!"));
    }
  });
};

export const checkEmail = (email) => {
  const emailReg =
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/;
  return XRegExp.test(email, emailReg);
};

export const checkUsername = (username) => {
  const userNameReg = /^[a-zA-Z]([._-](?![._-])|[a-zA-Z0-9]){3,18}[a-zA-Z0-9]$/;
  return XRegExp.test(username, userNameReg);
};

export const checkPhoneNumber = (phoneNumber) => {
  const phoneReg = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  return XRegExp.test(phoneNumber, phoneReg);
};

export const checkPassword = (password) => {
  const passwordReg = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,20}$/;
  return XRegExp.test(password, passwordReg);
};
