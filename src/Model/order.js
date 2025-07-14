import mongoose from "mongoose";
import User from "./user.js";
import Room from "./room.js";

const OrderSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: false,
    },
    fullname: {
      type: String,
      require: true,
    },
    phone: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    amountRoom: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Number,
      required: true,
    },
    endDate: {
      type: Number,
      required: true,
    },
    state: {
      type: String,
      default: "Waiting",
      require: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", OrderSchema);
