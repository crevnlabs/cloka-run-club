import mongoose, { Schema, Document } from "mongoose";

export interface IVolunteerApplication extends Document {
  userId: mongoose.Types.ObjectId;
  availability: string;
  interests: string;
  experience: string;
  motivation: string;
  skills?: string;
  languages?: string;
  additionalInfo?: string;
  location: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const VolunteerApplicationSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  availability: { type: String, required: true },
  interests: { type: String, required: true },
  experience: { type: String, required: true },
  motivation: { type: String, required: true },
  location: { type: String, required: true },
  skills: { type: String },
  languages: { type: String },
  additionalInfo: { type: String },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create a compound index to ensure a user can only have one pending application
VolunteerApplicationSchema.index(
  { userId: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } }
);

export default mongoose.models.VolunteerApplication ||
  mongoose.model<IVolunteerApplication>(
    "VolunteerApplication",
    VolunteerApplicationSchema
  );
