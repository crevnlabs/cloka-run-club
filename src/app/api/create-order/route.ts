import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import Product from "@/models/Product";

// Initialize Razorpay with your key_id and key_secret
const razorpayConfig = {
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
};

// Only initialize Razorpay if credentials are available
let razorpay: Razorpay | null = null;
if (razorpayConfig.key_id && razorpayConfig.key_secret) {
  razorpay = new Razorpay(razorpayConfig);
}

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Check if Razorpay is properly initialized
    if (!razorpay) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "Razorpay not initialized. Using mock data for development."
        );
        // For development, return a mock response
        return NextResponse.json(
          {
            id: `order_dev_${Date.now()}`,
            entity: "order",
            amount: 10000,
            amount_paid: 0,
            amount_due: 10000,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            status: "created",
            success: true,
            orderId: `mock_order_${Date.now()}`,
          },
          { status: 201 }
        );
      } else {
        return NextResponse.json(
          { success: false, message: "Payment gateway not configured" },
          { status: 500 }
        );
      }
    }

    const body = await request.json();
    const {
      amount,
      currency = "INR",
      receipt,
      product_id,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
    } = body;

    // Validate required fields
    if (!amount || !product_id) {
      return NextResponse.json(
        { success: false, message: "Amount and product ID are required" },
        { status: 400 }
      );
    }

    // Verify product exists (optional)
    try {
      const product = await Product.findById(product_id);
      if (!product) {
        // If we're using mock data and don't have products in DB yet, skip this check
        console.log(
          "Product not found in database, but continuing with order creation"
        );
      }
    } catch (error) {
      console.log(
        "Error checking product, but continuing with order creation:",
        error
      );
    }

    // Create a new Razorpay order
    const options = {
      amount: amount * 100, // Razorpay expects amount in smallest currency unit (paise)
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        product_id: product_id,
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Store the order in our database
    const order = await Order.create({
      razorpayOrderId: razorpayOrder.id,
      amount: amount,
      currency: currency,
      status: "created",
      productId: product_id,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
    });

    return NextResponse.json(
      {
        ...razorpayOrder,
        success: true,
        orderId: order._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating Razorpay order:", error);

    return NextResponse.json(
      { success: false, message: "Failed to create order" },
      { status: 500 }
    );
  }
}
