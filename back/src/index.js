import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import bookRoutes from "./routes/book.js";
import "../config/db.js";
import cors from "cors";
import job from "../config/cron.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

job.start();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
