import Order from "../Model/order.js";
import Room from "../Model/room.js";
import moment from "moment";
import { createError } from "../utils/createError.js";
import Hotel from "../Model/hotel.js";

function validate(date) {
  // let dateformat = /^(0?[1-9]|1[0-2])[\/](0?[1-9]|[1-2][0-9]|3[01])[\/]\d{4}$/;
  let dateformat = /^(0?[1-9]|[1-2][0-9]|3[01])[\/](0?[1-9]|1[0-2])[\/]\d{4}$/;
  // Matching the date through regular expression
  if (date.match(dateformat)) {
    let operator = date.split("/");

    // Extract the string into month, date and year
    let datepart = [];
    if (operator.length > 1) {
      datepart = date.split("/");
    }
    let month = parseInt(datepart[1]);
    let day = parseInt(datepart[0]);
    let year = parseInt(datepart[2]);

    // Create a list of days of a month
    let ListofDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (month === 1 || month > 2) {
      if (day > ListofDays[month - 1]) {
        //to check if the date is out of range
        return false;
      }
    } else if (month === 2) {
      let leapYear = false;
      if ((!(year % 4) && year % 100) || !(year % 400)) leapYear = true;
      if (leapYear === false && day >= 29) return false;
      else if (leapYear === true && day > 29) {
        console.log("Invalid date format!");
        return false;
      }
    }
  } else {
    console.log("Invalid date format!");
    return false;
  }
  return true;
}

export const createOrder = async (req, res, next) => {
  try {
    const orderData = new Order({ ...req.body });
    let amountRoom = (await Room.findOne({ _id: req.body.roomId })).amountRoom;

    const orderList = await Order.find({
      $and: [
        {
          roomId: req.body.roomId,
        },
        {
          state: {
            $ne: "Decline",
          },
        },
        {
          $or: [
            {
              endDate: {
                $gt: orderData.startDate,
                $lte: orderData.endDate,
              },
            },
            {
              startDate: {
                $gte: orderData.startDate,
                $lt: orderData.endDate,
              },
            },
          ],
        },
        // {
        //     amountRoom: {
        //         $lte: roomId.amountRoom - orderData.amountRoom,
        //     }
        // }
      ],
    }).populate("roomId");

    if (orderList.length) {
      let flag = false;
      orderList.map((it) => {
        if (orderData.amountRoom > amountRoom - it.amountRoom) {
          flag = true;
        }
        amountRoom -= it.amountRoom;
      });
      console.log(flag);
      if (!flag) {
        const newOrder = await orderData.save();
        await Room.findByIdAndUpdate(
          { _id: newOrder.roomId },
          {
            $push: {
              roomOrder: newOrder._id,
            },
          }
        );
        return res.status(200).json(newOrder);
      } else {
        next(createError(405, "This room has been ordered!"));
        return res.status(405).json("This room has been ordered!");
      }
    } else {
      const newOrder = await orderData.save();
      await Room.findByIdAndUpdate(
        { _id: newOrder.roomId },
        {
          $push: {
            roomOrder: newOrder._id,
          },
        }
      );
      return res.status(200).json(newOrder);
    }
  } catch (err) {
    next(err);
  }
};

export const getOrder = async (req, res, next) => {
  try {
    const orderData = await Order.findById(req.params.orderId);

    if (!orderData) {
      return res.status(404).json("Order not found!");
    } else {
      return res.status(200).json(orderData);
    }
  } catch (err) {
    next(err);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const orderList = await Order.find({ userId: req.params.id }).populate(
      "roomId"
    );

    console.log(orderList);
    if (!orderList.length) {
      return res.status(405).json("This user order is empty!");
    } else {
      return res.status(200).json(orderList);
    }
  } catch (err) {
    next(err);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orderList = await Order.find();
    res.status(200).json(orderList);
  } catch (err) {
    next(err);
  }
};

export const updateOrder = async (req, res, next) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (err) {
    next(createError(404, "Can not update!"));
  }
};

export const deleteOrder = async (req, res, next) => {
  try {
    const delOrder = await Order.findByIdAndDelete(req.params.orderId);
    res.status(200).json("Order has been deleted.");

    const room = await Room.findById(delOrder.roomId);
    let roomOrder = [...room.roomOrder];
    roomOrder.splice(
      room.roomOrder.findIndex((it) => it === delOrder.roomId),
      1
    );
    await room.updateOne({
      $set: {
        roomOrder: roomOrder,
      },
    });
  } catch (err) {
    next(err);
  }
};
