import { Request, Response } from "express";
import { Staff } from "../models/staff.model";

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
    const { name, email, department, organization, preferredNotification } =
      req.body;

    if (!name || !email || !department || !organization) {
      return res.status(400).json({
        message: "name, email, department and organization are required",
      });
    }

    const notifications = normalizePreferredNotification(preferredNotification);

    if (!hasValidNotifications(notifications)) {
      return res.status(400).json({ message: "Invalid preferredNotification" });
    }

    const staff = await Staff.create({
      name,
      email,
      department,
      organization,
      preferredNotification: notifications,
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
    const { preferredNotification } = req.body;
    const notifications = normalizePreferredNotification(preferredNotification);

    if (!hasValidNotifications(notifications)) {
      return res.status(400).json({ message: "Invalid preferredNotification" });
    }

    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { preferredNotification: notifications },
      { returnDocument: "after", runValidators: true },
    );

    if (!staff) return res.status(404).json({ message: "Staff not found" });

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

    return res.status(204).send();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error });
  }
}
