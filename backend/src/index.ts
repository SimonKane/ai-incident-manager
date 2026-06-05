import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { connectDB } from "./config/database";

dotenv.config({ quiet: true });

const PORT = parseInt(process.env.PORT || "");
const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Server running");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

connectDB().catch(console.error);
