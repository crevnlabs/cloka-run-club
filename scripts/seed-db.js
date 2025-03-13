import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

// MongoDB connection
const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error(
    "Please define the MONGO_URI environment variable inside .env.local"
  );
  process.exit(1);
}

// Define schemas
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  inStock: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  exactLocation: { type: String },
});

// Create models
const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

const Event = mongoose.models.Event || mongoose.model("Event", EventSchema);

// Sample data
const products = [
  {
    name: "Cloka Running T-Shirt",
    description:
      "Premium quality running t-shirt with moisture-wicking technology.",
    price: 1200,
    image: "/images/product-1.jpg",
    category: "Apparel",
    inStock: true,
  },
  {
    name: "Cloka Running Shorts",
    description:
      "Lightweight running shorts with inner lining for maximum comfort.",
    price: 900,
    image: "/images/product-2.jpg",
    category: "Apparel",
    inStock: true,
  },
  {
    name: "Cloka Water Bottle",
    description:
      "Insulated water bottle that keeps your drinks cold for hours.",
    price: 600,
    image: "/images/product-3.jpg",
    category: "Accessories",
    inStock: true,
  },
  {
    name: "Cloka Running Cap",
    description: "Breathable running cap with UV protection.",
    price: 500,
    image: "/images/product-4.jpg",
    category: "Accessories",
    inStock: true,
  },
  {
    name: "Cloka Reflective Vest",
    description:
      "High visibility reflective vest for early morning or evening runs.",
    price: 800,
    image: "/images/product-5.jpg",
    category: "Accessories",
    inStock: true,
  },
  {
    name: "Cloka Running Socks",
    description: "Anti-blister running socks with arch support.",
    price: 300,
    image: "/images/product-6.jpg",
    category: "Apparel",
    inStock: true,
  },
  {
    name: "Cloka Arm Band",
    description: "Comfortable arm band for carrying your phone during runs.",
    price: 400,
    image: "/images/product-7.jpg",
    category: "Accessories",
    inStock: true,
  },
  {
    name: "Cloka Hoodie",
    description: "Warm and comfortable hoodie for post-run recovery.",
    price: 1500,
    image: "/images/product-8.jpg",
    category: "Apparel",
    inStock: true,
  },
  {
    name: "Cloka Running Gloves",
    description: "Touchscreen compatible running gloves for cold weather.",
    price: 450,
    image: "/images/product-9.jpg",
    category: "Accessories",
    inStock: true,
  },
];

// Create sample events
const events = [
  {
    title: "Morning Run",
    description:
      "Join us for a refreshing morning run through the city. All levels welcome!",
    date: new Date("2023-12-15T08:00:00Z"),
    location: "Downtown Miami",
    exactLocation: "https://maps.app.goo.gl/example1",
    createdAt: new Date(),
  },
  {
    title: "Trail Running Adventure",
    description:
      "Explore the beautiful trails outside the city. Intermediate level recommended.",
    date: new Date("2023-12-22T09:00:00Z"),
    location: "Oleta River State Park",
    exactLocation: "https://maps.app.goo.gl/example2",
    createdAt: new Date(),
  },
  {
    title: "Marathon Training",
    description:
      "Preparing for the upcoming marathon? Join our training session!",
    date: new Date("2023-12-29T07:30:00Z"),
    location: "South Beach",
    exactLocation: "https://maps.app.goo.gl/example3",
    createdAt: new Date(),
  },
];

// Seed function
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await Product.deleteMany({});
    await Event.deleteMany({});
    console.log("Cleared existing data");

    // Insert new data
    await Product.insertMany(products);
    console.log("Products seeded");

    await Event.insertMany(events);
    console.log("Events seeded");

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
