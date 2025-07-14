import User from "../Model/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { checkPassword } from "../utils/validate.js";

export const register = async (req, res, next) => {
  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);
    const hashConfirm = bcrypt.hashSync(req.body.confirmPassword, salt);
    let error = [];

    if (!checkPassword(req.body.password)) {
      error.push(
        "Password must between 6 to 20 characters which contain at least one numeric digit, one uppercase and one lowercase letter"
      );
    }

    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).json({
        message: "Password don't match",
        errors: ["Password don't match"],
      });
    }

    if (error.length !== 0) {
      return res.status(400).json({
        message: "Input invalid",
        errors: error,
      });
    }

    const newUser = new User({
      ...req.body,
      password: hash,
      confirmPassword: hashConfirm,
    });

    try {
      await newUser.save()
    } catch(e) {
        return res.status(400).json({
          message: "Input invalid",
          errors: Object.keys(e.errors).map(key => e.errors[key].message),
        });
      };
      
    res.status(200).json({
      message: "User has been created.",
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        errors: ["User not found"],
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Wrong password or username!",
        errors: ["Wrong password or username!"],
      });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT
    );
    const { password, confirmPassword, isAdmin, ...otherDetails } = user._doc;
    res
      .cookie("token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({
        ...(isAdmin ? { isAdmin } : false),
        details: { ...otherDetails },
      });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.clearCookie("token");
    res.status(200).json({
      message: "Logout succesfully",
    });
  } catch (err) {
    next(err);
  }
};
