import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

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

// MongoDB connection options
const mongooseOptions = {
  bufferCommands: false,
  dbName: process.env.NODE_ENV === "production" ? "cloka" : "cloka-staging",
};

// Define schemas
const RegistrationSchema = new mongoose.Schema({
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
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  approved: { type: Boolean, default: null },
  createdAt: { type: Date, default: Date.now },
  password: { type: String },
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  age: { type: Number },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },
  emergencyContact: { type: String },
  instagramUsername: { type: String },
  joinCrew: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const UserEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  approved: {
    type: Boolean,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a compound index to ensure a user can only register once for an event
UserEventSchema.index({ userId: 1, eventId: 1 }, { unique: true });

// Create models
const Registration =
  mongoose.models.Registration ||
  mongoose.model("Registration", RegistrationSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);
const UserEvent =
  mongoose.models.UserEvent || mongoose.model("UserEvent", UserEventSchema);

// Migration function
async function migrateUsers() {
  try {
    // Connect to MongoDB with options
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log(`Connected to MongoDB (${mongooseOptions.dbName})`);

    // Get all registrations
    const registrations = await Registration.find({});
    console.log(`Found ${registrations.length} registrations to migrate`);

    // Track statistics
    let createdUsers = 0;
    let createdUserEvents = 0;
    let skippedUsers = 0;
    let errors = 0;

    // Process each registration
    for (const registration of registrations) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: registration.email });

        if (existingUser) {
          console.log(
            `User with email ${registration.email} already exists, skipping creation`
          );
          skippedUsers++;

          // If this registration has an eventId, create a UserEvent record
          if (registration.eventId) {
            const existingUserEvent = await UserEvent.findOne({
              userId: existingUser._id,
              eventId: registration.eventId,
            });

            if (!existingUserEvent) {
              await UserEvent.create({
                userId: existingUser._id,
                eventId: registration.eventId,
                approved: registration.approved,
                createdAt: registration.createdAt,
              });
              createdUserEvents++;
              console.log(
                `Created UserEvent for existing user ${existingUser.email} and event ${registration.eventId}`
              );
            }
          }

          continue;
        }

        // Create new user
        const newUser = await User.create({
          name: registration.name,
          email: registration.email,
          password: bcrypt.hashSync(registration.phone, 10),
          phone: registration.phone,
          age: registration.age,
          gender: registration.gender,
          emergencyContact: registration.emergencyContact,
          instagramUsername: registration.instagramUsername,
          joinCrew: registration.joinCrew,
          role: "user",
          createdAt: registration.createdAt,
          updatedAt: new Date(),
        });

        createdUsers++;
        console.log(`Created user: ${newUser.email}`);

        // If this registration has an eventId, create a UserEvent record
        if (registration.eventId) {
          await UserEvent.create({
            userId: newUser._id,
            eventId: registration.eventId,
            approved: registration.approved,
            createdAt: registration.createdAt,
          });
          createdUserEvents++;
          console.log(
            `Created UserEvent for user ${newUser.email} and event ${registration.eventId}`
          );
        }
      } catch (error) {
        console.error(
          `Error processing registration ${registration.email}:`,
          error
        );
        errors++;
      }
    }

    // Print summary
    console.log("\n--- Migration Summary ---");
    console.log(`Total registrations processed: ${registrations.length}`);
    console.log(`Users created: ${createdUsers}`);
    console.log(`UserEvents created: ${createdUserEvents}`);
    console.log(`Users skipped (already exist): ${skippedUsers}`);
    console.log(`Errors: ${errors}`);
    console.log("------------------------\n");

    console.log("Migration completed!");
    process.exit(0);
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  }
}

// Run the migration
migrateUsers();
