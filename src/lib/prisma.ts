import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Check if MONGODB_URI is set
if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is not set!");
  console.error("Please create a .env.local file with your MongoDB connection string:");
  console.error("MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eventbook?retryWrites=true&w=majority");
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["warn", "error"],
    datasources: {
      db: {
        url: process.env.MONGODB_URI,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Test connection on startup
prisma.$connect()
  .then(() => {
    console.log("✅ Database connected successfully");
  })
  .catch((error) => {
    console.error("❌ Database connection failed:", error.message);
    if (!process.env.MONGODB_URI) {
      console.error("Make sure to set MONGODB_URI in your .env.local file");
    } else {
      console.error("Check your MongoDB connection string and network access settings");
    }
  });
