import mongoose from "mongoose";
import dotenv from "dotenv";
import { hash } from "bcryptjs";

// Load environment variables
dotenv.config({ path: ".env.local" });

// Define interfaces for the models
interface IRegistration {
  _id: mongoose.Types.ObjectId;
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
  password?: string;
}

interface IUser {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string;
  age?: number;
  gender?: "male" | "female" | "other";
  emergencyContact?: string;
  instagramUsername?: string;
  joinCrew?: boolean;
  role: "user" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

interface IUserEvent {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  approved: boolean | null;
  createdAt: Date;
}

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

async function main() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");

    // Define models
    const Registration = mongoose.model<IRegistration>(
      "Registration",
      RegistrationSchema
    );
    const User = mongoose.model<IUser>("User", UserSchema);
    const UserEvent = mongoose.model<IUserEvent>("UserEvent", UserEventSchema);

    // Get all registrations
    const registrations = await Registration.find({});
    console.log(`Found ${registrations.length} registrations to migrate`);

    // Process each registration
    for (const registration of registrations) {
      console.log(`Processing registration for ${registration.email}`);

      // Check if user already exists
      let user = await User.findOne({ email: registration.email });

      if (!user) {
        // Create a new user
        const hashedPassword = registration.password
          ? registration.password // If password is already hashed
          : await hash("tempPassword123", 10); // Create a temporary password

        user = await User.create({
          name: registration.name,
          email: registration.email,
          password: hashedPassword,
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

        console.log(`Created new user: ${user.email}`);
      } else {
        console.log(`User already exists: ${user.email}`);
      }

      // If the registration has an eventId, create a UserEvent
      if (registration.eventId) {
        // Check if UserEvent already exists
        const existingUserEvent = await UserEvent.findOne({
          userId: user._id,
          eventId: registration.eventId,
        });

        if (!existingUserEvent) {
          // Create a new UserEvent
          await UserEvent.create({
            userId: user._id,
            eventId: registration.eventId,
            approved: registration.approved,
            createdAt: registration.createdAt,
          });

          console.log(
            `Created UserEvent for user ${user.email} and event ${registration.eventId}`
          );
        } else {
          console.log(
            `UserEvent already exists for user ${user.email} and event ${registration.eventId}`
          );
        }
      } else {
        console.log(
          `Registration for ${registration.email} has no eventId, skipping UserEvent creation`
        );
      }
    }

    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    // Close the MongoDB connection
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the migration
main();
