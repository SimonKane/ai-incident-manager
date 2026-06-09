import mongoose, { Schema, InferSchemaType, Types } from "mongoose";

const incidentSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  severity: { type: String, required: true },
  service: { type: String, required: true },
  environment: { type: String, required: true },
  timestamp: { type: Date, required: true },
  status: { type: String, required: true },
  timeline: [{ time: Date, title: String, description: String }],
});

export type IncidentType = InferSchemaType<typeof incidentSchema> & {
  _id: Types.ObjectId;
};
export const Incident = mongoose.model("Incidents", incidentSchema);
