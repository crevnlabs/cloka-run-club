import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  location: string;
  image?: string;
  registrationLink?: string;
  createdAt: Date;
}

const EventSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  image: { type: String },
  registrationLink: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Check if the model already exists to prevent overwriting during hot reloads
export default mongoose.models.Event ||
  mongoose.model<IEvent>("Event", EventSchema);
