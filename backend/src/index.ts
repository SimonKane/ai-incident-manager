import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { createServer } from "http";
import { Server } from "socket.io";

import cron from "node-cron";
import { sendAlert, alerts } from "./utils/scripts/ingestion";

import { connectDB } from "./config/database";
import { Analyzed } from "./models/analyzedIncident.model";
import { Incident } from "./models/incident.model";
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

function getInitialIncidentTemplate(index: number) {
  const templates = [
    {
      title: "API latency spike",
      description:
        "Production API latency is above threshold and needs investigation.",
      severity: "Critical",
      service: "user-service",
      environment: "production",
      status: "Pending",
      type: "performance",
      priority: "high",
      action: "Inspect API latency, upstream dependencies and recent deploys.",
      target: "user-service",
      recommendation:
        "Check API Gateway latency, service logs and rollback candidates.",
    },
    {
      title: "Unauthorized access pattern",
      description:
        "Suspicious IAM activity detected from an unexpected remote address.",
      severity: "Critical",
      service: "iam",
      environment: "production",
      status: "Escalated",
      type: "security",
      priority: "high",
      action: "Review the affected IAM user and rotate exposed credentials.",
      target: "deploy-bot",
      recommendation:
        "Disable suspicious sessions, rotate keys and inspect recent role assumptions.",
    },
    {
      title: "Payment processor crash loop",
      description:
        "Payment processor tasks are repeatedly exiting with OOM errors.",
      severity: "Critical",
      service: "payment-processor",
      environment: "production",
      status: "Pending",
      type: "availability",
      priority: "high",
      action: "Inspect memory usage and recent payment processor changes.",
      target: "payment-processor",
      recommendation:
        "Check task memory limits, container logs and recent deployment diffs.",
    },
  ];

  return templates[index % templates.length];
}

async function sendInitialAssignedAlerts() {
  const availableStaff = await Staff.find({ isOnVacation: false })
    .sort({ _id: 1 })
    .limit(3)
    .lean();

  if (availableStaff.length < 3) {
    console.log(
      `Skipping initial alerts: found ${availableStaff.length} available staff members`,
    );
    return;
  }

  for (const [index, staffMember] of availableStaff.entries()) {
    const template = getInitialIncidentTemplate(index);
    const timestamp = new Date(Date.now() + index * 1000);
    const incident = await Incident.create({
      title: template.title,
      description: template.description,
      severity: template.severity,
      service: template.service,
      environment: template.environment,
      timestamp,
      status: template.status,
      timeline: [
        {
          time: timestamp,
          title: "Initial demo incident generated",
          description: `Assigned to ${staffMember.name}`,
        },
      ],
    });
    const analyzed = await Analyzed.create({
      type: template.type,
      priority: template.priority,
      action: template.action,
      target: template.target,
      assignedTo: staffMember.name,
      recommendation: template.recommendation,
      incident: incident._id,
    });

    io.emit("incident:processed", {
      incident: {
        ...incident.toObject(),
        id: incident._id.toString(),
        analysis: {
          type: analyzed.type,
          priority: analyzed.priority,
          action: analyzed.action,
          target: analyzed.target,
          assignedTo: analyzed.assignedTo,
          assignedDepartment: staffMember.department ?? null,
          assignedStaffId: staffMember._id.toString(),
          assignedPhoneNumber: staffMember.phoneNumber ?? null,
          assignedNotificationMethods: staffMember.preferredNotification ?? [],
          recommendation: analyzed.recommendation,
        },
      },
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
