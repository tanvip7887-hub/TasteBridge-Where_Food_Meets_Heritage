import nodemailer from "nodemailer";
import env from "../config/env.js";
import { logger } from "../utils/logger.js";

// Helper to check if SMTP configuration is provided
export const isSmtpConfigured = () => {
  return !!(
    env.SMTP_HOST &&
    env.SMTP_USER &&
    env.SMTP_PASSWORD
  );
};

// Create Nodemailer Transporter
export const createTransporter = () => {
  if (!isSmtpConfigured()) {
    return null;
  }

  const host = env.SMTP_HOST;
  const port = env.SMTP_PORT;
  const isSecure = env.SMTP_SECURE || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Verify SMTP connection (without sending test email)
export const verifySmtpConnection = async () => {
  if (!isSmtpConfigured()) {
    logger.warn(
      "[SMTP] SMTP configuration is unconfigured or incomplete in environment variables (SMTP_HOST, SMTP_USER, SMTP_PASSWORD required)."
    );
    return { success: false, reason: "SMTP credentials missing in configuration." };
  }

  try {
    const transporter = createTransporter();
    await transporter.verify();
    logger.info("[SMTP] SMTP connection verified successfully.");
    return { success: true };
  } catch (error) {
    logger.error(`[SMTP] SMTP connection failed: ${error.message}`);
    return { success: false, reason: error.message };
  }
};

// Send Verification OTP Email
export const sendVerificationEmail = async ({
  to,
  name,
  otp,
  expiresInMinutes = 10,
}) => {
  if (!isSmtpConfigured()) {
    const errMsg = "SMTP configuration is missing. Cannot deliver email.";
    logger.error(`[Email Service] ${errMsg}`);
    throw new Error(errMsg);
  }

  const transporter = createTransporter();
  const from = env.SMTP_FROM;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 0; }
          .container { max-width: 560px; margin: 30px auto; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: #dc2626; color: #ffffff; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.5px; }
          .header p { margin: 4px 0 0 0; font-size: 13px; opacity: 0.9; font-style: italic; }
          .content { padding: 32px 24px; color: #374151; line-height: 1.6; }
          .greeting { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 12px; }
          .otp-box { background: #f3f4f6; border-radius: 8px; border: 1px dashed #d1d5db; padding: 20px; text-align: center; margin: 24px 0; }
          .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #dc2626; margin: 0; }
          .warning { font-size: 13px; color: #6b7280; margin-top: 24px; padding-top: 16px; border-top: 1px solid #f3f4f6; }
          .footer { background: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>TasteBridge</h1>
            <p>Where Food Meets Heritage</p>
          </div>
          <div class="content">
            <div class="greeting">Hello ${name || "Food Explorer"},</div>
            <p>Your verification code for TasteBridge is:</p>
            
            <div class="otp-box">
              <div class="otp-code">${otp}</div>
            </div>

            <p>This OTP expires in <strong>${expiresInMinutes} minutes</strong>.</p>
            
            <div class="warning">
              If you did not request this verification, you can safely ignore this email.
            </div>
          </div>
          <div class="footer">
            TasteBridge &bull; Where Food Meets Heritage
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `TasteBridge\nWhere Food Meets Heritage\n\nYour verification code:\n${otp}\n\nThis OTP expires in ${expiresInMinutes} minutes.\n\nIf you did not request this verification, you can safely ignore this email.\n\nTasteBridge\nWhere Food Meets Heritage`;

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject: "TasteBridge — Your Verification Code",
      text: textContent,
      html: htmlContent,
    });

    logger.info(`[Email Service] Verification email sent to ${to} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`[Email Service] Failed to send email to ${to}: ${error.message}`);
    throw error;
  }
};

export default {
  isSmtpConfigured,
  verifySmtpConnection,
  sendVerificationEmail,
};
