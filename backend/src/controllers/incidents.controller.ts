import { Request, Response } from "express";
import { Incident } from "../models/incident.model";

export async function getAllIncidents(req: Request, res: Response) {
  try {
    const incidents = await Incident.find({});
    if (incidents.length === 0)
      return res.status(404).json("No incidents in database");
    return res.status(200).json(incidents);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
}

export async function analyzeIncident(req: Request, res: Response) {
  try {
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
}
