import mongoose, { Schema, InferSchemaType, Types } from "mongoose";

const incidentSchema = new mongoose.Schema({
  type: { type: String },
});
