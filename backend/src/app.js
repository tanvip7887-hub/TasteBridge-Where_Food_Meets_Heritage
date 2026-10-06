import express from "express";
import cors from "cors";
import prisma from "./config/prisma.js";
import { getChannel } from "./config/rabbitmq.js";
import { isSmtpConfigured } from "./services/email.service.js";
import authRoutes from "./modules/auth/auth.routes.js";
import { sendSuccess } from "./utils/apiResponse.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { HTTP_STATUS } from "./constants/index.js";

const app = express();

// 1. CORS
app.use(cors());

// 2. Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. System Health Check Endpoint
app.get("/api/v1/health", async (req, res) => {
  let dbStatus = "disconnected";
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch (err) {
    dbStatus = "error";
  }

  let rabbitmqStatus = "disconnected";
  try {
    const channel = await getChannel();
    if (channel) rabbitmqStatus = "connected";
  } catch (err) {
    rabbitmqStatus = "disconnected";
  }

  const smtpStatus = isSmtpConfigured() ? "configured" : "unconfigured";

  return sendSuccess(res, HTTP_STATUS.OK, "TasteBridge API is healthy", {
    status: "UP",
    services: {
      database: dbStatus,
      rabbitmq: rabbitmqStatus,
      smtp: smtpStatus,
    },
    timestamp: new Date().toISOString(),
  });
});

// 4. Application Routes
app.use("/api/v1/auth", authRoutes);

// 5. 404 Unknown Route Handler
app.use(notFoundHandler);

// 6. Centralized Error Handler
app.use(errorHandler);

export default app;