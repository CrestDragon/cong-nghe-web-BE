import express from "express";
import {
  register,
  login,
  logout,
} from "../controllers/auth.js";

const router = express.Router();
import { verifyToken } from "../utils/validate.js";

router.post("/register", register);
router.post("/login", login);
router.post("/logout", verifyToken, logout);

export default router;
