import mongoose, { Schema, InferSchemaType, Types } from "mongoose";

const staffSchema = new Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: { type: String, required: false, trim: true },
    department: { type: String, required: true },
    organization: { type: String, required: true },
    preferredNotification: {
      type: [String],
      enum: ["email", "phone", "sms", "slack"],
      default: ["email"],
      required: true,
    },
    isOnVacation: { type: Boolean, default: false, required: true },
    slackUserId: { type: String, required: false, trim: true },
  },
  { timestamps: false, collection: "staff" },
);

export type StaffType = InferSchemaType<typeof staffSchema> & {
  _id: Types.ObjectId;
};
export const Staff = mongoose.model("Staff", staffSchema);
