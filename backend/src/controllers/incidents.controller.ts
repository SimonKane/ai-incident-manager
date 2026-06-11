import { Request, Response } from "express";
import { Analyzed } from "../models/analyzedIncident.model";
import { Staff } from "../models/staff.model";
import { analyze } from "../services/agent";

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
    console.log("req.body:", req.body);
    const { inData } = req.body;
    const incident = await analyze(inData);

    if (!incident) throw new Error("Failed to run analysis");

    res.status(201).json(incident);
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error });
  }
}
