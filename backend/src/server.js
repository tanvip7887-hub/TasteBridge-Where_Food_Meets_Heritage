import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { verifySmtpConnection } from "./services/email.service.js";
import { connectRabbitMQ } from "./config/rabbitmq.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  console.log("=================================================");
  console.log("       TASTEBRIDGE BACKEND SERVER STARTUP        ");
  console.log("=================================================");

  // 1. Connect PostgreSQL DB
  await connectDB();

  // 2. Verify SMTP settings (safe startup verification without sending test emails)
  await verifySmtpConnection();

  // 3. Connect to RabbitMQ Queue
  await connectRabbitMQ();

  // 4. Start Express HTTP Server
  app.listen(PORT, () => {
    console.log(`TasteBridge server running on port ${PORT}`);
  });
};

startServer();