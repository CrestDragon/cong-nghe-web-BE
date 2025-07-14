import express from "express";
import {
  createOrder,
  getOrder,
  getUserOrders,
  getAllOrders,
  deleteOrder,
  updateOrder,
} from "../controllers/order.js";
import { verifyUser, verifyAdmin } from "../utils/validate.js";

const router = express.Router();

router.post("/create", verifyUser, createOrder);
router.get("/:orderId", verifyUser, getOrder); //orderID
router.get("/list/:id", verifyUser, getUserOrders); //userID
router.get("/", verifyAdmin, getAllOrders);
router.delete("/:orderId", verifyUser, deleteOrder); //orderID
router.put("/:orderId", verifyAdmin, updateOrder); //orderID

export default router;
