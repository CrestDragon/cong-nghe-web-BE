import mongoose from "mongoose";

const CitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  img: {
    type: String,
  },
  isPopular: {
    type: Boolean,
    required: true,
    default: false,
  },
});

export default mongoose.model("City", CitySchema);
