import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";

import authRoute from "./src/routes/auth.js";
import userRoute from "./src/routes/user.js";
import orderRoute from "./src/routes/order.js";
import hotelRoute from "./src/routes/hotel.js";
import roomRoute from "./src/routes/room.js";

const app = express();
app.use(
  cors({
    origin: true,
    credentials: true, //included credentials as true
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
dotenv.config();

const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to MongoDB");
  } catch (error) {
    throw error;
  }
};
mongoose.set("strictQuery", false);
mongoose.connection.on("disconnected", () => {
  console.log("DB Disconnected");
});
mongoose.connection.on("connected", () => {
  console.log("DB Connected");
});

app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/order", orderRoute);
app.use("/api/hotel", hotelRoute);
app.use("/api/room", roomRoute);

app.listen(process.env.PORT, () => {
  connect();
  console.log("Connected to backend! - Port: ", process.env.PORT);
});
