import mongoose, { Schema, Document } from "mongoose";

export interface IRegistration extends Document {
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: "male" | "female" | "other";
  joinCrew: boolean;
  acceptTerms: boolean;
  emergencyContact: string;
  instagramUsername?: string;
  eventId?: string;
  approved: boolean | null;
  createdAt: Date;
}

const RegistrationSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  age: { type: Number, required: true },
  gender: {
    type: String,
    required: true,
    enum: ["male", "female", "other"],
  },
  joinCrew: {
    type: Boolean,
    default: false,
  },
  acceptTerms: {
    type: Boolean,
    required: true,
    default: true,
  },
  emergencyContact: { type: String, required: true },
  instagramUsername: { type: String },
  eventId: { type: Schema.Types.ObjectId, ref: "Event" },
  approved: { type: Boolean, default: null },
  createdAt: { type: Date, default: Date.now },
});

// Check if the model already exists to prevent overwriting during hot reloads
export default mongoose.models.Registration ||
  mongoose.model<IRegistration>("Registration", RegistrationSchema);
