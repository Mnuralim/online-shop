import mongoose from "mongoose";

export const db = () => {
  try {
    mongoose.set("strictQuery", false);
    mongoose.connect(process.env.DATABASE_URL);
    console.log("Database Connected...");
  } catch (error) {
    console.log(error);
  }
};
