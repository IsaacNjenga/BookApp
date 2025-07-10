import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const Connection = async () => {
  try {
    await mongoose.connect(process.env.URI);
    console.log("Database Connected!");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1); // Exit the process with failure
  }
};

Connection();
