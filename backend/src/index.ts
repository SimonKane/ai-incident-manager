import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { createServer } from "http";
import { Server } from "socket.io";

import cron from "node-cron";
import { sendAlert, alerts } from "./utils/scripts/ingestion";

import { connectDB } from "./config/database";
import staffRoutes from "./routes/staff.routes";
import incidentRoutes from "./routes/incidents.routes";

dotenv.config({ quiet: true });

const PORT = parseInt(process.env.PORT || "");
const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  },
});

io.on("connection", (socket) => {
  console.log("client connected:", socket.id);
});

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

app.use("/staff", staffRoutes);
app.use("/incidents", incidentRoutes);

app.get("/", (_req, res) => {
  res.send("Server running");
});

// Skickar slumpmässig alert från alerts[]
// i utils/scripts/ingestion.ts var 5e min.
// Byt 5 mot annan siffra för att ändra minutintervall
cron.schedule("*/5 * * * *", async () => {
  const alert = alerts[Math.floor(Math.random() * alerts.length)];
  await sendAlert(alert);
});

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

connectDB().catch(console.error);
