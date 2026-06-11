import { Request, Response } from "express";
import { Incident } from "../models/incident.model";
import { analyze } from "../services/agent";

export async function getAllIncidents(_req: Request, res: Response) {
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
    console.log("req.body:", req.body);
    const { inData } = req.body;
    const incident = await analyze(inData);

    if (!incident) throw new Error("Failed to run analysis");

    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
}
