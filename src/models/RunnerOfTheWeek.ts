import mongoose, { Schema, Document } from "mongoose";

export interface IRunnerOfTheWeek extends Document {
  name: string;
  image: string;
  story: string;
  achievements: string;
  weekOf: Date;
  createdAt: Date;
}

const RunnerOfTheWeekSchema: Schema = new Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  story: { type: String, required: true },
  achievements: { type: String, required: true },
  weekOf: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Check if the model already exists to prevent overwriting during hot reloads
export default mongoose.models.RunnerOfTheWeek ||
  mongoose.model<IRunnerOfTheWeek>("RunnerOfTheWeek", RunnerOfTheWeekSchema);
