import mongoose, { Schema, InferSchemaType, Types } from "mongoose";

const analyzedSchema = new Schema({
  type: { type: String, required: true },
  priority: { type: String, required: true },
  action: { type: String, required: true },
  target: { type: String, required: true },
  assignedTo: { type: String, required: true },
  recommendation: { type: String, required: true },
  incident: { type: Types.ObjectId, ref: "Incidents", required: true },
});

export type AnalyzedType = InferSchemaType<typeof analyzedSchema> & {
  _id: Types.ObjectId;
};
export const Analyzed = mongoose.model(
  "Analyzed",
  analyzedSchema,
  "analyzed_incidents",
);
