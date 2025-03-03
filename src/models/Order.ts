import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  amount: number;
  currency: string;
  status: "created" | "paid" | "failed";
  productId: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema({
  razorpayOrderId: { type: String, required: true, unique: true },
  razorpayPaymentId: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, required: true, default: "INR" },
  status: {
    type: String,
    required: true,
    enum: ["created", "paid", "failed"],
    default: "created",
  },
  productId: { type: String, required: true },
  customerName: { type: String },
  customerEmail: { type: String },
  customerPhone: { type: String },
  shippingAddress: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field on save
OrderSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Check if the model already exists to prevent overwriting during hot reloads
export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);
