import mongoose from "mongoose";
import Room from "./room.js";

const HotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  distance: {
    //from center
    type: String,
  },
  photos: {
    type: [String],
  },
  title: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
  },
  amenities: {
    type: [String],
    required: true,
  },
  stars: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  countRate: [
    {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
  ],
  maxRoom: {
    type: Number,
    required: true,
  },
  rooms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
    },
  ],
  cheapestPrice: {
    type: Number,
    default: 0,
  },
  featured: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model("Hotel", HotelSchema);
