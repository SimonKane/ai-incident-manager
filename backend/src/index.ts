import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { createServer } from "http";
import { Server } from "socket.io";

import cron from "node-cron";
import { sendAlert, alerts } from "./utils/scripts/ingestion";

import { connectDB } from "./config/database";
import { Staff } from "./models/staff.model";
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

async function sendInitialAssignedAlerts() {
  const availableStaff = await Staff.find({ isOnVacation: false })
    .sort({ name: 1 })
    .limit(3)
    .lean();

  if (availableStaff.length < 3) {
    console.log(
      `Skipping initial alerts: found ${availableStaff.length} available staff members`,
    );
    return;
  }

  for (const [index, staffMember] of availableStaff.entries()) {
    await sendAlert({
      ...alerts[index],
      assignedTo: staffMember.name,
    });
  }
}

function scheduleRecurringAlerts() {
  // Skickar slumpmässig alert från alerts[]
  // i utils/scripts/ingestion.ts var 5e min.
  // Byt 5 mot annan siffra för att ändra minutintervall
  cron.schedule("*/5 * * * *", async () => {
    const alert = alerts[Math.floor(Math.random() * alerts.length)];
    await sendAlert(alert);
  });
}

async function startServer() {
  await connectDB();

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    scheduleRecurringAlerts();
    void sendInitialAssignedAlerts();
  });
}

startServer().catch((error) => {
  console.error(error);
  process.exit(1);
});
