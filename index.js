import express from "express";
import dotenv from "dotenv";
import { db } from "./config/Database.js";
import AuthRoute from "./routes/AuthRoute.js";
import ProductRoute from "./routes/ProductRoute.js";
import CouponRoute from "./routes/CouponRoute.js";
import cookieParser from "cookie-parser";
import morgan from "morgan";

dotenv.config();
db();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use(AuthRoute);
app.use("/products", ProductRoute);
app.use("/coupon", CouponRoute);

app.listen(process.env.PORT, () => console.log("server is running..."));
