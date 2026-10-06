import { HTTP_STATUS, ENVIRONMENT, API_MESSAGES } from "../constants/index.js";
import { logger } from "../utils/logger.js";

const TECHNICAL_ERROR_PATTERNS = [
  "ECONNREFUSED",
  "ECONNRESET",
  "ENOTFOUND",
  "RabbitMQ",
  "SMTP",
  "AMQP",
  "channel closed",
  "socket hang up",
  "Nodemailer",
  "Invalid login",
  "connection is unavailable",
];

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let rawMessage = err.message || API_MESSAGES.INTERNAL_ERROR;
  let errors = err.errors || null;

  const isDev = process.env.NODE_ENV === ENVIRONMENT.DEVELOPMENT;

  // Log raw technical error server-side
  logger.error(`[${req.method} ${req.originalUrl}] ${rawMessage}`, {
    statusCode,
    ...(err.stack ? { stack: err.stack } : {}),
  });

  // Check if raw error contains infrastructure technical details that should be sanitized
  const isTechnicalError = TECHNICAL_ERROR_PATTERNS.some((pattern) =>
    rawMessage.includes(pattern)
  );

  let clientMessage = rawMessage;

  if (isTechnicalError || (!err.isOperational && !isDev)) {
    statusCode = statusCode === 400 ? HTTP_STATUS.SERVICE_UNAVAILABLE : statusCode;
    clientMessage = "We couldn't send the verification email right now. Please try again in a moment.";
    errors = null;
  }

  const response = {
    success: false,
    message: clientMessage,
  };

  if (errors !== null) {
    response.errors = errors;
  }

  // Never expose stack trace or raw socket errors to clients
  if (isDev && err.stack && !isTechnicalError) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

export default errorHandler;
