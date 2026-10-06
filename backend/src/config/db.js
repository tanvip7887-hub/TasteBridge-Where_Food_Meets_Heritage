import prisma from "./prisma.js";

export const connectDB = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("PostgreSQL Database connected successfully via Prisma");
  } catch (error) {
    console.error("Database connection error:", error.message);
    process.exit(1);
  }
};
