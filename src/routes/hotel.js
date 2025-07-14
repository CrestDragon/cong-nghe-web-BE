import express from "express";
import {
  createHotel,
  updateHotel,
  getById,
  getAll,
  deleteById,
  rate,
  getByAll,
} from "../controllers/hotel.js";
import Hotel from "../Model/hotel.js";
import { verifyUser, verifyAdmin, verifyToken } from "../utils/validate.js";
const router = express.Router();

//CREATE
router.post("/", verifyAdmin, createHotel);

//UPDATE
router.put("/update/:id", verifyAdmin, updateHotel);
// //DELETE
router.delete("/:id", verifyAdmin, deleteById);
//GET BY ID
router.get("/find/:id", getById);

// router.get("/by-city",getByCity)
//GET ALL
router.get("/", getAll);

//GET BY MULTIPLE CONDITIONS
router.post("/find", getByAll);

// //GET BY PRICE
// router.get("/by-price",getHotelByPrice);
// //GET BY STAR
// router.get("/by-stars",getByStars)
router.post("/rating", verifyToken, rate);

export default router;
