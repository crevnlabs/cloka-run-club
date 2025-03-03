import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    const body = await request.json();
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      shipping_details,
    } = body;

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Missing payment verification parameters" },
        { status: 400 }
      );
    }

    // Create a signature using the order_id and payment_id
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const secret = process.env.RAZORPAY_KEY_SECRET || "";

    // Generate the expected signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(text)
      .digest("hex");

    // Verify the signature
    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Find the order in our database
      const order = await Order.findOne({ razorpayOrderId: razorpay_order_id });

      if (!order) {
        return NextResponse.json(
          { success: false, message: "Order not found" },
          { status: 404 }
        );
      }

      // Update the order with payment details
      order.razorpayPaymentId = razorpay_payment_id;
      order.status = "paid";

      // Update shipping details if provided
      if (shipping_details) {
        if (shipping_details.name) order.customerName = shipping_details.name;
        if (shipping_details.email)
          order.customerEmail = shipping_details.email;
        if (shipping_details.phone)
          order.customerPhone = shipping_details.phone;
        if (shipping_details.address)
          order.shippingAddress = shipping_details.address;
      }

      await order.save();

      return NextResponse.json(
        {
          success: true,
          message: "Payment verified successfully",
          order: {
            id: order._id,
            status: order.status,
            amount: order.amount,
            productId: order.productId,
          },
        },
        { status: 200 }
      );
    } else {
      // If signature verification fails, update order status to failed
      try {
        const order = await Order.findOne({
          razorpayOrderId: razorpay_order_id,
        });
        if (order) {
          order.status = "failed";
          await order.save();
        }
      } catch (error) {
        console.error("Error updating order status to failed:", error);
      }

      return NextResponse.json(
        { success: false, message: "Payment verification failed" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying payment:", error);

    return NextResponse.json(
      { success: false, message: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
