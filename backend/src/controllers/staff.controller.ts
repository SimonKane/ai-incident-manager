import { Request, Response } from "express";
import { Staff } from "../models/staff.model";
import { sendSlackDm } from "../services/slack.service";

const notificationOptions = ["email", "phone", "sms", "slack"];

function normalizePreferredNotification(value: unknown) {
  if (!value) return ["email"];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value;
  return [];
}

function hasValidNotifications(value: string[]) {
  return (
    value.length > 0 &&
    value.every((notification) => notificationOptions.includes(notification))
  );
}

function getFallbackSlackUserId() {
  return process.env.SLACK_TEST_USER_ID || process.env.slackUserId;
}

function normalizeSlackUserId(value: string | undefined) {
  const slackUserId = value?.trim();
  return slackUserId || undefined;
}

export async function getAllStaff(_req: Request, res: Response) {
  try {
    const staff = await Staff.find({});
    if (staff.length === 0) return res.status(404).json("No staff in database");
    return res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
}

export async function createStaff(req: Request, res: Response) {
  try {
    const {
      name,
      email,
      phoneNumber,
      department,
      organization,
      preferredNotification,
      isOnVacation = false,
      slackUserId,
    } = req.body;

    if (!name || !email || !department || !organization) {
      return res.status(400).json({
        message: "name, email, department and organization are required",
      });
    }

    if (phoneNumber !== undefined && typeof phoneNumber !== "string") {
      return res.status(400).json({ message: "Invalid phoneNumber" });
    }

    if (typeof isOnVacation !== "boolean") {
      return res.status(400).json({ message: "Invalid isOnVacation" });
    }

    if (slackUserId !== undefined && typeof slackUserId !== "string") {
      return res.status(400).json({ message: "Invalid slackUserId" });
    }

    const notifications = normalizePreferredNotification(preferredNotification);

    if (!hasValidNotifications(notifications)) {
      return res.status(400).json({ message: "Invalid preferredNotification" });
    }

    const normalizedSlackUserId = normalizeSlackUserId(slackUserId);
    const normalizedPhoneNumber = phoneNumber?.trim();

    if (notifications.includes("slack") && !normalizedSlackUserId) {
      return res.status(400).json({
        message: "slackUserId is required when Slack is selected",
      });
    }

    if (notifications.includes("sms") && !normalizedPhoneNumber) {
      return res.status(400).json({
        message: "phoneNumber is required when SMS is selected",
      });
    }

    const staff = await Staff.create({
      name,
      email,
      phoneNumber: normalizedPhoneNumber,
      department,
      organization,
      preferredNotification: notifications,
      isOnVacation,
      slackUserId: normalizedSlackUserId,
    });

    return res.status(201).json(staff);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error });
  }
}

export async function updateStaff(req: Request, res: Response) {
  try {
    const {
      name,
      email,
      phoneNumber,
      department,
      organization,
      preferredNotification,
      isOnVacation,
      slackUserId,
    } = req.body;
    const updates: {
      name?: string;
      email?: string;
      phoneNumber?: string;
      department?: string;
      organization?: string;
      preferredNotification?: string[];
      isOnVacation?: boolean;
      slackUserId?: string;
    } = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ message: "Invalid name" });
      }

      updates.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== "string" || !email.trim()) {
        return res.status(400).json({ message: "Invalid email" });
      }

      updates.email = email.trim().toLowerCase();
    }

    if (phoneNumber !== undefined) {
      if (typeof phoneNumber !== "string") {
        return res.status(400).json({ message: "Invalid phoneNumber" });
      }

      updates.phoneNumber = phoneNumber.trim();
    }

    if (department !== undefined) {
      if (typeof department !== "string" || !department.trim()) {
        return res.status(400).json({ message: "Invalid department" });
      }

      updates.department = department.trim();
    }

    if (organization !== undefined) {
      if (typeof organization !== "string" || !organization.trim()) {
        return res.status(400).json({ message: "Invalid organization" });
      }

      updates.organization = organization.trim();
    }

    if (preferredNotification !== undefined) {
      const notifications = normalizePreferredNotification(
        preferredNotification,
      );

      if (!hasValidNotifications(notifications)) {
        return res
          .status(400)
          .json({ message: "Invalid preferredNotification" });
      }

      updates.preferredNotification = notifications;
    }

    if (isOnVacation !== undefined) {
      if (typeof isOnVacation !== "boolean") {
        return res.status(400).json({ message: "Invalid isOnVacation" });
      }

      updates.isOnVacation = isOnVacation;
    }

    if (slackUserId !== undefined) {
      if (typeof slackUserId !== "string") {
        return res.status(400).json({ message: "Invalid slackUserId" });
      }

      updates.slackUserId = normalizeSlackUserId(slackUserId);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No supported staff fields provided",
      });
    }

    const existingStaff = await Staff.findById(req.params.id);

    if (!existingStaff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    const nextNotifications =
      updates.preferredNotification || existingStaff.preferredNotification;
    const nextSlackUserId =
      updates.slackUserId !== undefined
        ? updates.slackUserId
        : existingStaff.slackUserId;
    const nextPhoneNumber =
      updates.phoneNumber !== undefined
        ? updates.phoneNumber
        : existingStaff.phoneNumber;

    if (nextNotifications.includes("slack") && !nextSlackUserId) {
      return res.status(400).json({
        message: "slackUserId is required when Slack is selected",
      });
    }

    if (nextNotifications.includes("sms") && !nextPhoneNumber) {
      return res.status(400).json({
        message: "phoneNumber is required when SMS is selected",
      });
    }

    const staff = await Staff.findByIdAndUpdate(req.params.id, updates, {
      returnDocument: "after",
      runValidators: true,
    });

    return res.status(200).json(staff);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error });
  }
}

export async function deleteStaff(req: Request, res: Response) {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);

    if (!staff) return res.status(404).json({ message: "Staff not found" });

    const slackUserId = staff.slackUserId || getFallbackSlackUserId();

    if (slackUserId) {
      try {
        await sendSlackDm(
          slackUserId,
          `Test from AI Incident Manager: ${staff.name} was deleted.`,
        );
      } catch (error) {
        console.error("Failed to send staff deletion Slack notification:", error);
      }
    }

    return res.status(204).send();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error });
  }
}

export async function testSlackNotification(req: Request, res: Response) {
  try {
    const { slackUserId, text } = req.body;

    if (slackUserId !== undefined && typeof slackUserId !== "string") {
      return res.status(400).json({ message: "Invalid slackUserId" });
    }

    if (text !== undefined && typeof text !== "string") {
      return res.status(400).json({ message: "Invalid text" });
    }

    const recipientSlackUserId = slackUserId || getFallbackSlackUserId();

    if (!recipientSlackUserId) {
      return res.status(400).json({
        message: "Missing slackUserId or SLACK_TEST_USER_ID",
      });
    }

    await sendSlackDm(
      recipientSlackUserId,
      text || "Test from AI Incident Manager",
    );

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
