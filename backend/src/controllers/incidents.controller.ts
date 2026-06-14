import { Request, Response } from "express";
import { Analyzed } from "../models/analyzedIncident.model";
import { Incident } from "../models/incident.model";
import { Staff } from "../models/staff.model";
import { analyze } from "../services/agent.service";
import { sendSms } from "../services/sms.service";
import { sendSlackDm } from "../services/slack.service";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getIncidentNotificationMessage(incident: any, recommendation: string) {
  return `AI Incident Manager: ${incident.title} (${incident.severity}) on ${incident.service}. ${recommendation}`;
}

function getIncidentSmsMessage(incident: any) {
  return `Detta behöver du se över: ${incident.title} (${incident.severity}) i ${incident.service}.`;
}

export async function getAllIncidents(_req: Request, res: Response) {
  try {
    const [analyzedIncidents, staff] = await Promise.all([
      Analyzed.find({}).populate("incident").lean(),
      Staff.find({}).lean(),
    ]);

    const staffByName = new Map(
      staff.map((staffMember) => [
        staffMember.name.trim().toLowerCase(),
        staffMember,
      ]),
    );

    const incidents = analyzedIncidents
      .filter(
        (analysis) =>
          analysis.incident &&
          typeof analysis.incident === "object" &&
          "title" in analysis.incident,
      )
      .map((analysis) => {
        const incident = analysis.incident as any;
        const assignedStaff = staffByName.get(
          analysis.assignedTo.trim().toLowerCase(),
        );

        return {
          ...incident,
          id: incident._id.toString(),
          analysis: {
            type: analysis.type,
            priority: analysis.priority,
            action: analysis.action,
            target: analysis.target,
            assignedTo: analysis.assignedTo,
            assignedDepartment: assignedStaff?.department ?? null,
            assignedStaffId: assignedStaff?._id?.toString() ?? null,
            assignedPhoneNumber: assignedStaff?.phoneNumber ?? null,
            assignedNotificationMethods:
              assignedStaff?.preferredNotification ?? [],
            recommendation: analysis.recommendation,
          },
        };
      })
      .sort(
        (firstIncident, secondIncident) =>
          new Date(secondIncident.timestamp).getTime() -
          new Date(firstIncident.timestamp).getTime(),
      );

    return res.status(200).json(incidents);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
}

export async function analyzeIncident(req: Request, res: Response) {
  try {
    const incident = await analyze(req.body);

    if (!incident) throw new Error("Failed to run analysis");

    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
}

export async function notifyAssignedStaff(req: Request, res: Response) {
  try {
    const [incident, analysis] = await Promise.all([
      Incident.findById(req.params.id).lean(),
      Analyzed.findOne({ incident: req.params.id }).lean(),
    ]);

    if (!incident || !analysis) {
      return res.status(404).json({ message: "Incident analysis not found" });
    }

    const assignedStaff = await Staff.findOne({
      name: new RegExp(`^${escapeRegExp(analysis.assignedTo.trim())}$`, "i"),
    }).lean();

    if (!assignedStaff) {
      return res.status(404).json({ message: "Assigned technician not found" });
    }

    const customMessage = req.body?.message;

    if (customMessage !== undefined && typeof customMessage !== "string") {
      return res.status(400).json({ message: "Invalid message" });
    }

    const message =
      customMessage?.trim() ||
      getIncidentNotificationMessage(incident, analysis.recommendation);
    const smsMessage =
      customMessage?.trim() || getIncidentSmsMessage(incident);
    const notificationMethods = assignedStaff.preferredNotification || [];
    const results: Array<{
      method: string;
      status: "sent" | "skipped" | "failed";
      detail?: unknown;
      reason?: string;
    }> = [];

    for (const method of notificationMethods) {
      if (method === "sms") {
        if (!assignedStaff.phoneNumber) {
          results.push({
            method,
            status: "skipped",
            reason: "Missing phone number",
          });
          continue;
        }

        try {
          const sms = await sendSms(assignedStaff.phoneNumber, smsMessage);
          results.push({ method, status: "sent", detail: sms });
        } catch (error) {
          results.push({
            method,
            status: "failed",
            reason:
              error instanceof Error ? error.message : "Could not send SMS",
          });
        }
        continue;
      }

      if (method === "slack") {
        if (!assignedStaff.slackUserId) {
          results.push({
            method,
            status: "skipped",
            reason: "Missing Slack user ID",
          });
          continue;
        }

        try {
          const slack = await sendSlackDm(assignedStaff.slackUserId, message);
          results.push({ method, status: "sent", detail: slack });
        } catch (error) {
          results.push({
            method,
            status: "failed",
            reason:
              error instanceof Error ? error.message : "Could not send Slack",
          });
        }
        continue;
      }

      results.push({
        method,
        status: "skipped",
        reason: "No sender configured for this method",
      });
    }

    const sentMethods = results
      .filter((result) => result.status === "sent")
      .map((result) => result.method);
    const failedMethods = results
      .filter((result) => result.status === "failed")
      .map((result) => ({
        method: result.method,
        reason: result.reason,
      }));

    if (sentMethods.length === 0) {
      return res.status(400).json({
        message: "No configured notification channel could be used",
        assignedTo: assignedStaff.name,
        results,
      });
    }

    return res.status(200).json({
      ok: true,
      assignedTo: assignedStaff.name,
      sentMethods,
      failedMethods,
      results,
    });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
