import express from "express";
import {
  createRoom,
  deleteRoom,
  getAllRoomsByFilter,
  getAllRoomsByHotelId,
  getRoomById,
  getRoomByPrice,
  updateRoom,
  // deleteRoom,
  // getRoom,
  // getRooms,
  // updateRoom,
  // updateRoomAvailability,
} from "../controllers/room.js";
import { verifyAdmin } from "../utils/validate.js";

const router = express.Router();
//CREATE
router.post("/create", verifyAdmin, createRoom);
router.put("/update/:id", verifyAdmin, updateRoom);
router.get("/get-room-by-price", getRoomByPrice); //by price
router.get("/get-room-by-id", getRoomById); //by id
router.get("/get-all-room/:hotelId", getAllRoomsByHotelId);
router.post("/get-room-filter/:hotelId", getAllRoomsByFilter);
router.delete("/delete", verifyAdmin, deleteRoom);

// //UPDATE
// router.put("/availability/:id", updateRoomAvailability);
// router.put("/:id", verifyAdmin, updateRoom);
//
// //DELETE
// router.delete("/:id/:hotelid", verifyAdmin, deleteRoom);
//
// //GET
// router.get("/:id", getRoom);
//
// //GET ALL
// router.get("/", getRooms);

export default router;
