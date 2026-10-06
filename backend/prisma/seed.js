import "dotenv/config";
import bcrypt from "bcrypt";
import prisma, { pool } from "../src/config/prisma.js";

async function main() {
  console.log("Starting database seed...");

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@tastebridge.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "AdminPassword123!";

  // 1. Seed Admin User
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "TasteBridge Admin",
      email: adminEmail,
      phone: "+910000000000",
      passwordHash: passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log(`Admin user seeded: ${admin.email} (ID: ${admin.id})`);

  // 2. Seed Default Platform Settings
  const settings = await prisma.platformSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      platformFeePercent: 10.0,
      deliveryFeeBase: 30.0,
    },
  });

  console.log(`Platform settings seeded: Fee ${settings.platformFeePercent}%, Delivery ${settings.deliveryFeeBase}`);

  console.log("Database seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
