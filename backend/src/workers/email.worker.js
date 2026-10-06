import env from "../config/env.js";
import { connectRabbitMQ, QUEUES } from "../config/rabbitmq.js";
import {
  verifySmtpConnection,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordResetOtpEmail,
} from "../services/email.service.js";
import { logger } from "../utils/logger.js";

const MAX_RETRIES = 3;

const startEmailWorker = async () => {
  console.log("=================================================");
  console.log("   TASTEBRIDGE EMAIL WORKER SERVICE INITIALIZING  ");
  console.log("=================================================");

  logger.info("[Email Worker] Starting...");
  logger.info(`[Email Worker] SMTP Host: ${env.SMTP_HOST}`);
  logger.info(`[Email Worker] SMTP Port: ${env.SMTP_PORT}`);
  logger.info(`[Email Worker] SMTP User Configured: ${Boolean(env.SMTP_USER)}`);
  logger.info(`[Email Worker] SMTP Password Configured: ${Boolean(env.SMTP_PASSWORD)}`);

  // 1. Verify SMTP Connection
  const smtpCheck = await verifySmtpConnection();
  if (smtpCheck.success) {
    logger.info("[Email Worker] SMTP connection verified successfully.");
  } else {
    logger.warn(`[Email Worker] SMTP verification warning: ${smtpCheck.reason}`);
  }

  // 2. Connect to RabbitMQ
  const rabbit = await connectRabbitMQ();
  if (!rabbit || !rabbit.channel) {
    logger.error(
      "[Email Worker] Unable to connect to RabbitMQ. Worker cannot listen for queue jobs."
    );
    process.exit(1);
  }

  const { channel } = rabbit;

  // Set prefetch to process 1 message at a time
  await channel.prefetch(1);

  const queueName = env.RABBITMQ_EMAIL_QUEUE || QUEUES.EMAIL;
  logger.info(`[Email Worker] RabbitMQ connected successfully.`);
  logger.info(`[Email Worker] Listening on '${queueName}'...`);

  // 3. Consume messages safely
  channel.consume(queueName, async (msg) => {
    if (!msg) return;

    let jobData;
    try {
      jobData = JSON.parse(msg.content.toString());
    } catch (parseError) {
      logger.error(`[Email Worker] Malformed message payload. Discarding message.`);
      channel.ack(msg);
      return;
    }

    const headers = msg.properties.headers || {};
    const retryCount = headers["x-retry-count"] || 0;

    try {
      logger.info(
        `[Email Worker] Processing job '${jobData.type || "EMAIL_OTP"}' for recipient: ${jobData.to}`
      );

      if (jobData.type === "EMAIL_OTP" || jobData.type === "VERIFICATION_OTP") {
        await sendVerificationEmail({
          to: jobData.to,
          name: jobData.name,
          otp: jobData.otp,
          expiresInMinutes: jobData.expiresInMinutes || 10,
        });

        // Acknowledge message on successful delivery
        channel.ack(msg);
        logger.info(
          `[Email Worker] Successfully delivered OTP email to ${jobData.to}`
        );
      } else if (jobData.type === "PASSWORD_RESET_OTP") {
        await sendPasswordResetOtpEmail({
          to: jobData.to,
          name: jobData.name,
          otp: jobData.otp,
          expiresInMinutes: jobData.expiresInMinutes || 10,
        });

        // Acknowledge message on successful delivery
        channel.ack(msg);
        logger.info(
          `[Email Worker] Successfully delivered password reset OTP email to ${jobData.to}`
        );
      } else if (jobData.type === "PASSWORD_RESET") {
        await sendPasswordResetEmail({
          to: jobData.to,
          name: jobData.name,
          resetUrl: jobData.resetUrl,
          expiresInMinutes: jobData.expiresInMinutes || 15,
        });

        // Acknowledge message on successful delivery
        channel.ack(msg);
        logger.info(
          `[Email Worker] Successfully delivered password reset email to ${jobData.to}`
        );
      } else {
        logger.warn(
          `[Email Worker] Unknown email job type: ${jobData.type}. Discarding message.`
        );
        channel.ack(msg);
      }
    } catch (error) {
      logger.error(
        `[Email Worker] Error processing email job for ${jobData.to}: ${error.message}`
      );

      if (retryCount < MAX_RETRIES) {
        const nextRetry = retryCount + 1;
        logger.warn(
          `[Email Worker] Retrying email job for ${jobData.to} (Attempt ${nextRetry}/${MAX_RETRIES})...`
        );

        // Re-publish message with updated retry header
        channel.sendToQueue(
          queueName,
          Buffer.from(JSON.stringify(jobData)),
          {
            persistent: true,
            headers: {
              ...headers,
              "x-retry-count": nextRetry,
            },
          }
        );

        // Acknowledge original message to remove it from front of queue
        channel.ack(msg);
      } else {
        logger.error(
          `[Email Worker] Max retries (${MAX_RETRIES}) reached for ${jobData.to}. Job marked permanently failed.`
        );
        // Acknowledge to remove unrecoverable message after handling
        channel.ack(msg);
      }
    }
  });
};

// Global error handlers so worker process never crashes silently
process.on("uncaughtException", (err) => {
  logger.error(`[Email Worker] Uncaught Exception: ${err.message}`);
});

process.on("unhandledRejection", (reason) => {
  logger.error(`[Email Worker] Unhandled Rejection: ${reason}`);
});

process.on("SIGINT", async () => {
  logger.info("[Email Worker] Worker shutting down gracefully...");
  process.exit(0);
});

startEmailWorker();
