import User from "../Model/user.js";
import { createError } from "../utils/createError.js";
import bcrypt from "bcryptjs";
import {
  checkPassword,
  checkEmail,
  checkPhoneNumber,
  checkUsername,
  verifyAdmin,
  verifyToken,
} from "../utils/validate.js";
import RegExp from "regexp";

export const updateUser = async (req, res, next) => {
  try {
    let errors = [];

    if (!checkUsername(req.body.username)) {
      errors.push("User name is invalid");
    }

    if (!checkPhoneNumber(req.body.phone)) {
      errors.push("Phone number is invalid");
    }

    if (!checkEmail(req.body.email)) {
      errors.push("Email is invalid");
    }

    if (errors.length !== 0) {
      return res.status(400).json({
        message: "Input invalid",
        errors: errors,
      });
    }

    if (
      req.body.password ||
      req.body.confirmPassword ||
      req.body.isAdmin != null
    ) {
      return res.status(400).json("Can not update");
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    const { password, confirmPassword, isAdmin, ...otherDetails } =
      updatedUser._doc;
    res.status(200).json({
      message: "Update Success",
      details: { ...otherDetails },
    });
  } catch (err) {
    next(createError(404, "Can not update!"));
  }
};

export const getOne = async (req, res, next) => {
  //by id
  try {
    const userData = await User.findById(req.params.id);
    console.log(userData);
    const { password, confirmPassword, isAdmin, ...otherDetails } =
      userData._doc;
    res.status(200).json({ details: { ...otherDetails } });
  } catch (err) {
    next(err);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const userList = await User.find({});
    const len = userList.length;
    let result = [];
    for (let i = 0; i < len; i++) {
      console.log(userList[i]);
      const { password, confirmPassword, isAdmin, ...otherDetails } =
        userList[i]._doc;
      result.push({ ...otherDetails });
    }
    res.status(200).json({ size: len, results: result });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "User has been deleted.",
    });
  } catch (err) {
    next(err);
  }
};

export const findOneByName = async (req, res, next) => {
  try {
    const user = await User.findOne({
      username: req.params.username,
    });
    console.log(user);

    if (user !== null) {
      const { password, confirmPassword, isAdmin, ...otherDetails } = user._doc;
      res.status(200).json({ details: { ...otherDetails } });
    } else {
      res.status(404).json({
        message: "Input invalid",
        errors: ["User name is not found!"],
      });
    }
  } catch (err) {
    next(err);
  }
};

export const findByName = async (req, res, next) => {
  // search name like req.body.name
  // try{
  //     // const query=req.body.username;
  //     // const regex = new RegExp(query, 'i')
  //     // const user=await User.find({username: {$regex: regex}});
  //     // res.status(200).json({users: user})
  //     const query = { $text: { $search: req.body.username } };
  //     // Return only the `title` of each matched document
  //
  //     // find documents based on our query and projection
  //     const cursor =await  User.find(query);
  //     res.status(200).send(cursor)
  // }catch(err){
  //     next(err);
  // }
};

export const changePassword = async (req, res, next) => {
  const { userId, oldPassword, password, confirmPassword } = req.body;
  console.log(req.body);
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(req.body.password, salt);
  console.log(hash);
  try {
    const user = await User.findOne({ _id: userId });
    const isPasswordCorrect = await bcrypt.compare(oldPassword, user.password);
    if (!checkPassword(password)) {
      return res.status(400).json({
        message: "Input invalid",
        errors:
          ["Password must between 6 to 20 characters which contain at least one numeric digit, one uppercase and one lowercase letter"],
      });
    }
    if (!isPasswordCorrect)
      return res.status(404).json({
        message: "Input invalid",
        errors: ["Old password is not correct"],
      });
    if (password !== confirmPassword)
      return res.status("400").json({
        message: "Input invalid",
        errors: ["Password don't match"],
      });
    await User.findByIdAndUpdate(
      { _id: userId },
      {
        password: hash,
        confirmPassword: hash,
      }
    );
    res.status(200).json({
      message: "Change password successfully",
    });
  } catch (err) {
    next(err);
  }
};
