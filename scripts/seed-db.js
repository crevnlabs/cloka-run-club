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

const RunnerOfTheWeekSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  story: { type: String, required: true },
  achievements: { type: String, required: true },
  weekOf: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  secret: { type: String },
  exactLocation: { type: String },
});

// Create models
const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);
const RunnerOfTheWeek =
  mongoose.models.RunnerOfTheWeek ||
  mongoose.model("RunnerOfTheWeek", RunnerOfTheWeekSchema);
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

const runnerOfTheWeek = {
  name: "Rahul Sharma",
  image: "/images/runner-of-the-week.jpg",
  story:
    "Rahul has been running with Cloka for over 2 years. He started as a beginner and now completes half marathons regularly.",
  achievements:
    "Completed 3 half marathons and improved his 10K time by 15 minutes in the last year.",
  weekOf: new Date(),
};

const sampleEvents = [
  {
    title: "Morning Run Club",
    description:
      "Join us for a refreshing morning run through the city. All levels welcome!",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    location: "Central Park",
    secret: "morningrun2023",
    exactLocation: "https://maps.app.goo.gl/example1",
  },
  {
    title: "Evening Trail Run",
    description:
      "Experience the beauty of nature with our evening trail run. Bring headlamps!",
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    location: "Mountain Trails",
    secret: "trailrun2023",
    exactLocation: "https://maps.app.goo.gl/example2",
  },
  {
    title: "Weekend Marathon Training",
    description:
      "Prepare for upcoming marathons with our structured training session.",
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
    location: "City Stadium",
    secret: "marathon2023",
    exactLocation: "https://maps.app.goo.gl/example3",
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
    await RunnerOfTheWeek.deleteMany({});
    await Event.deleteMany({});
    console.log("Cleared existing data");

    // Insert new data
    await Product.insertMany(products);
    console.log("Products seeded");

    await RunnerOfTheWeek.create(runnerOfTheWeek);
    console.log("Runner of the Week seeded");

    await Event.insertMany(sampleEvents);
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
