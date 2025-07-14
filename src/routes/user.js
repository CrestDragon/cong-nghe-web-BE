import express from "express";
import {
  updateUser,
  getOne,
  getAll,
  deleteUser,
  changePassword,
  findOneByName,
  findByName,
} from "../controllers/user.js";
import { verifyUser, verifyAdmin, verifyToken } from "../utils/validate.js";

const router = express.Router();

router.put("/:id", verifyUser, updateUser);
router.get("/:id", verifyUser, getOne);
router.get("/", verifyAdmin, getAll);
router.get("/v1/:username", findOneByName);
router.get("/v1/find/by-name", findByName); // search username like username
router.delete("/:id", verifyAdmin, deleteUser);
router.put("/v1/change-password", verifyToken, changePassword);

export default router;
