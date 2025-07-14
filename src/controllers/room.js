// import Room from "../Model/room.js";
import Hotel from "../Model/hotel.js";
import Room from "../Model/room.js";
import Order from "../Model/order.js";
import { createError } from "../utils/createError.js";
import { json } from "express";
function validateRoom(req) {
  let errors = [];
  if (req.body.maxPeople <= 0 || !Number.isInteger(req.body.maxPeople)) {
    errors.push("Max people is invalid!");
  }
  if (req.body.price < 0) {
    errors.push("Price is invalid");
  }
  return errors;
}

export const createRoom = async (req, res, next) => {
  const hotelId = req.body.hotelId;
  const newRoom = new Room(req.body);
  let errors = validateRoom(req);
  if (errors.length !== 0) {
    return res.status(400).json({
      message: "Input invalid",
      errors: errors,
    });
  }
  try {
    const hotel = await Hotel.findById(hotelId);

    if (hotel.rooms.length >= hotel.maxRoom) {
      return res.status(400).json({
        message: "Invalid input",
        errors: ["Can't create room. Hotel is full!"],
      });
    }
    if (!newRoom.city) {
      newRoom.city = hotel.city;
    }
    const savedRoom = await newRoom.save();
    await Hotel.updateOne(
      { _id: hotelId },
      {
        $push: {
          rooms: savedRoom._id,
        },
      }
    );

    if (hotel.rooms.length === 0) {
      await Hotel.updateOne(
        { _id: hotelId },
        {
          cheapestPrice: savedRoom.price,
        }
      );
    } else if (savedRoom.price <= hotel.cheapestPrice) {
      await Hotel.updateOne(
        { _id: hotelId },
        {
          cheapestPrice: savedRoom.price,
        }
      );
    }

    res.status(200).json({
      message: "Success",
      details: savedRoom,
    });
  } catch (err) {
    next(createError(404, "Cannot create room."));
  }
};

export const updateRoom = async (req, res, next) => {
  try {
    const hotelId = req.body.hotelId;
    const hotel = await Hotel.findById(hotelId);
    if (hotel !== null) {
      let errors = validateRoom(req);
      if (errors.length !== 0) {
        return res.status(400).json({
          message: "error",
          errors: errors,
        });
      }
      const updatedRoom = await Room.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      if (req.body.price <= hotel.cheapestPrice) {
        await Hotel.updateOne(
          { _id: hotelId },
          {
            cheapestPrice: req.body.price,
          }
        );
      }
      res.status(200).json(updatedRoom);
    } else {
      return res.status(404).json({
        message: "error",
        errors: ["Hotel is not found"],
      });
    }
  } catch (err) {
    return res.status(404).json({
      message: "Invalid input!",
      errors: ["Room id is not found!"],
    });
  }
};

export const getRoomByPrice = async (req, res, next) => {
  // by min and max price
  const request = req.body;
  if (!request.lowestPrice) {
    request.lowestPrice = 0;
  }
  if (!request.highestPrice) {
    request.highestPrice = Number.POSITIVE_INFINITY;
  }
  if (!request.city) {
    request.city = "";
  }
  const lowPrice = request.lowestPrice;
  const highPrice = request.highestPrice;
  if (lowPrice < 0 || highPrice < 0 || lowPrice > highPrice) {
    return res.status(400).json({
      message: "Invalid input",
      errors: ["Price is invalid! Please try again!"],
    });
  }
  try {
    const getRooms = await Room.find({
      $and: [
        {
          price: {
            $gte: lowPrice,
            $lte: highPrice,
          },
        },
        {
          city: {
            $regex: request.city,
            $options: "i",
          },
        },
      ],
    });

    res.status(200).json({
      message: "success",
      result: getRooms.length,
      rooms: getRooms,
    });
  } catch (errors) {
    next(errors);
  }
};

export const getAllRoomsByHotelId = async (req, res, next) => {
  try {
    const hotel = await Hotel.findById(req.params.hotelId);
    const roomsHotel = hotel.rooms;
    let result = [];
    if (roomsHotel.length !== 0) {
      for (let i = 0; i < roomsHotel.length; i++) {
        const room = await Room.findById(roomsHotel[i]);
        result.push({ room });
      }
    } else {
      return res.status(200).json({
        message: "Success",
        "Hotel name": hotel.name,
        details: "The hotel has no room!",
      });
    }

    res.status(200).json({
      message: "Success",
      "Hotel name": hotel.name,
      "Number of rooms": roomsHotel.length,
      details: result,
    });
  } catch (err) {
    return res.status(404).json({
      message: "errors",
      errors: ["Hotel id is not found!"],
    });
  }
};

export const getAllRoomsByFilter = async (req, res, next) => {
  try {
    const request = req.body;
    const hotel = await Hotel.findById(req.params.hotelId);
    const roomsHotel = hotel.rooms;
    let result = [];
    if (roomsHotel.length !== 0) {
      for (let i = 0; i < roomsHotel.length; i++) {
        const room = await Room.findById(roomsHotel[i]).populate("roomOrder");
        if (room.maxPeople >= request.amount) {
          let flag = false;

          if (request.room > room.amountRoom) {
            flag = true;
          }

          if (room.roomOrder.length > 0) {
            let available = room.amountRoom;
            room.roomOrder.map((it) => {
              if (
                (it.endDate >= request.endDate &&
                  it.startDate < request.endDate) ||
                (it.endDate > request.startDate &&
                  it.startDate <= request.startDate)
              ) {
                if (request.room > available - it.amountRoom) {
                  flag = true;
                } else {
                  available -= it.amountRoom;
                }
              }
            });
          }
          if (!flag) {
            result.push({ room });
          }
        }
      }
    } else {
      return res.status(200).json({
        message: "Success",
        "Hotel name": hotel.name,
        details: [],
      });
    }

    res.status(200).json({
      message: "Success",
      "Hotel name": hotel.name,
      "Number of rooms": roomsHotel.length,
      details: result,
    });
  } catch (err) {
    return res.status(404).json({
      message: "errors",
      errors: ["Hotel id is not found!"],
    });
  }
};

export const getRoomById = async (req, res, next) => {
  const id = req.body.id;
  try {
    const roomDetails = await Room.findById(id);
    res.status(200).json({
      status: "success",
      roomDetails: roomDetails,
    });
  } catch (err) {
    next(res.status(400).json("Room is not found"));
  }
};

//   export const updateRoomAvailability = async (req, res, next) => {
//     try {
//       await Room.updateOne(
//         { "roomNumbers._id": req.params.id },
//         {
//           $push: {
//             "roomNumbers.$.unavailableDates": req.body.dates
//           },
//         }
//       );
//       res.status(200).json("Room status has been updated.");
//     } catch (err) {
//       next(err);
//     }
//   };
//
export const deleteRoom = async (req, res, next) => {
  const hotelId = req.body.hotelId;
  try {
    const hotel = await Hotel.findById(req.body.hotelId);
    if (hotel !== null) {
    } else {
      return res.status(404).json("Hotel is not found");
    }
    const room = await Room.findById(req.body.id);
    if (room !== null) {
      await Room.findByIdAndDelete(req.body.id);
    } else {
      return res.status(404).json("Room is not found");
    }

    try {
      await Hotel.findByIdAndUpdate(hotelId, {
        $pull: { rooms: req.body.id },
      });
    } catch (err) {
      next(err);
    }
    res.status(200).json("Room has been deleted.");
  } catch (err) {
    next(err);
  }
};
//
//   export const getRoom = async (req, res, next) => {
//     try {
//       const room = await Room.findById(req.params.id);
//       res.status(200).json(room);
//     } catch (err) {
//       next(err);
//     }
//   };
//   export const getRooms = async (req, res, next) => {
//     try {
//       const rooms = await Room.find();
//       res.status(200).json(rooms);
//     } catch (err) {
//       next(err);
//     }
//   };
