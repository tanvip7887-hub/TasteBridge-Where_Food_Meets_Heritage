import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env file relative to backend root directory
const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

export const env = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  // Feature Flags
  EMAIL_ENABLED: process.env.EMAIL_ENABLED !== "false",
  RABBITMQ_ENABLED: process.env.RABBITMQ_ENABLED !== "false",

  // SMTP Settings
  SMTP_HOST: process.env.SMTP_HOST || "smtp.gmail.com",
  SMTP_PORT: parseInt(process.env.SMTP_PORT || "587", 10),
  SMTP_SECURE: process.env.SMTP_SECURE === "true",
  SMTP_USER: process.env.SMTP_USER || "",
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || "",
  SMTP_FROM:
    process.env.SMTP_FROM ||
    process.env.EMAIL_FROM ||
    '"TasteBridge" <no-reply@tastebridge.com>',

  // RabbitMQ Settings
  RABBITMQ_URL: process.env.RABBITMQ_URL || "amqp://localhost:5672",
  RABBITMQ_EMAIL_QUEUE: process.env.RABBITMQ_EMAIL_QUEUE || "tastebridge.email",
};

export default env;
