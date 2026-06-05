import { Request, Response } from "express";
import { Staff } from "../models/staff.model";

export async function getAllStaff(_req: Request, res: Response) {
  try {
    const staff = await Staff.find({});
    if (staff.length === 0) return res.status(404).json("No staff in database");
    return res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
}
