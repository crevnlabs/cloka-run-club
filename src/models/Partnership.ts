import mongoose, { Schema, Document } from "mongoose";

export interface IPartnership extends Document {
  name: string;
  organizationName: string;
  email: string;
  phone: string;
  links: string;
  cities: string;
  description: string;
  collaborationType: string;
  pastCollaboration?: string;
  collaborationReason?: string;
  additionalInfo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PartnershipSchema: Schema = new Schema({
  name: { type: String, required: true },
  organizationName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  links: { type: String, required: true },
  cities: { type: String, required: true },
  description: { type: String, required: true },
  collaborationType: { type: String, required: true },
  pastCollaboration: { type: String },
  collaborationReason: { type: String },
  additionalInfo: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Partnership ||
  mongoose.model<IPartnership>("Partnership", PartnershipSchema);
