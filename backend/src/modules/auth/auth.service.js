import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "../../config/prisma.js";
import { publishEmailJob } from "../../config/rabbitmq.js";
import { AppError } from "../../utils/AppError.js";
import { HTTP_STATUS } from "../../constants/index.js";

// Helper to remove passwordHash from user object
export const sanitizeUser = (user) => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

// Generate JWT token
export const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError("JWT secret is not configured", HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
  return jwt.sign({ userId, role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Helper: Generate secure 6-digit numeric OTP
const generateNumericOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

export const registerUser = async ({ name, email, phone, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Check for duplicate email in verified Users table
  const existingEmail = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existingEmail) {
    throw new AppError("An account with this email already exists", HTTP_STATUS.CONFLICT);
  }

  // 2. Check for duplicate phone if provided
  if (phone) {
    const existingPhone = await prisma.user.findUnique({
      where: { phone },
    });
    if (existingPhone) {
      throw new AppError("An account with this phone number already exists", HTTP_STATUS.CONFLICT);
    }
  }

  // 3. Generate 6-digit numeric OTP & hashes
  const rawOtp = generateNumericOtp();
  const passwordHash = await bcrypt.hash(password, 10);
  const otpHash = await bcrypt.hash(rawOtp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
  const resendAllowedAt = new Date(Date.now() + 60 * 1000); // 60 seconds cooldown

  // 4. Store or overwrite PendingRegistration
  await prisma.pendingRegistration.upsert({
    where: { email: normalizedEmail },
    update: {
      name,
      phone: phone || null,
      passwordHash,
      otpHash,
      expiresAt,
      attempts: 0,
      resendAllowedAt,
    },
    create: {
      email: normalizedEmail,
      name,
      phone: phone || null,
      passwordHash,
      otpHash,
      expiresAt,
      attempts: 0,
      resendAllowedAt,
    },
  });

  // 5. Publish email job to RabbitMQ queue
  try {
    await publishEmailJob({
      type: "EMAIL_OTP",
      to: normalizedEmail,
      name,
      otp: rawOtp,
      expiresInMinutes: 10,
    });
  } catch (error) {
    throw new AppError(
      error.message || "Failed to queue verification email. Email service is currently unavailable.",
      HTTP_STATUS.SERVICE_UNAVAILABLE
    );
  }

  return {
    email: normalizedEmail,
    expiresIn: 600,
  };
};

export const verifyRegisterOtp = async ({ email, otp }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Find PendingRegistration
  const pending = await prisma.pendingRegistration.findUnique({
    where: { email: normalizedEmail },
  });

  if (!pending) {
    throw new AppError(
      "No pending registration found for this email. Please register again.",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // 2. Check expiration
  if (pending.expiresAt < new Date()) {
    await prisma.pendingRegistration.delete({ where: { email: normalizedEmail } });
    throw new AppError(
      "Verification code has expired. Please register again to get a new code.",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // 3. Check attempts limit
  if (pending.attempts >= 5) {
    await prisma.pendingRegistration.delete({ where: { email: normalizedEmail } });
    throw new AppError(
      "Maximum verification attempts exceeded. Please register again.",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // 4. Verify OTP hash
  const isValid = await bcrypt.compare(otp, pending.otpHash);
  if (!isValid) {
    const updatedAttempts = pending.attempts + 1;
    if (updatedAttempts >= 5) {
      await prisma.pendingRegistration.delete({ where: { email: normalizedEmail } });
      throw new AppError(
        "Maximum verification attempts exceeded. Please register again.",
        HTTP_STATUS.BAD_REQUEST
      );
    } else {
      await prisma.pendingRegistration.update({
        where: { email: normalizedEmail },
        data: { attempts: updatedAttempts },
      });
      const remaining = 5 - updatedAttempts;
      throw new AppError(
        `Invalid verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  // 5. Atomic Transaction: Create User + Remove PendingRegistration
  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        name: pending.name,
        email: pending.email,
        phone: pending.phone,
        passwordHash: pending.passwordHash,
        role: "CUSTOMER", // Forced CUSTOMER role
        status: "ACTIVE",
      },
    });

    await tx.pendingRegistration.delete({
      where: { email: normalizedEmail },
    });

    return createdUser;
  });

  // 6. Generate JWT token
  const token = generateToken(user.id, user.role);

  return {
    token,
    user: sanitizeUser(user),
  };
};

export const resendRegisterOtp = async ({ email }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Find PendingRegistration
  const pending = await prisma.pendingRegistration.findUnique({
    where: { email: normalizedEmail },
  });

  if (!pending) {
    throw new AppError(
      "No pending registration found for this email.",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // 2. Enforce resend cooldown
  if (pending.resendAllowedAt && pending.resendAllowedAt > new Date()) {
    const secondsLeft = Math.ceil((pending.resendAllowedAt.getTime() - Date.now()) / 1000);
    throw new AppError(
      `Please wait ${secondsLeft} second${secondsLeft === 1 ? "" : "s"} before requesting a new code.`,
      429
    );
  }

  // 3. Generate new 6-digit OTP & hashes
  const rawOtp = generateNumericOtp();
  const otpHash = await bcrypt.hash(rawOtp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
  const resendAllowedAt = new Date(Date.now() + 60 * 1000); // 60 seconds cooldown

  // 4. Update PendingRegistration
  await prisma.pendingRegistration.update({
    where: { email: normalizedEmail },
    data: {
      otpHash,
      expiresAt,
      attempts: 0,
      resendAllowedAt,
    },
  });

  // 5. Publish email job to RabbitMQ queue
  try {
    await publishEmailJob({
      type: "EMAIL_OTP",
      to: normalizedEmail,
      name: pending.name,
      otp: rawOtp,
      expiresInMinutes: 10,
    });
  } catch (error) {
    throw new AppError(
      error.message || "Failed to queue verification email. Email service is currently unavailable.",
      HTTP_STATUS.SERVICE_UNAVAILABLE
    );
  }

  return {
    email: normalizedEmail,
    expiresIn: 600,
  };
};

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Find user by email
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new AppError("Invalid email or password", HTTP_STATUS.UNAUTHORIZED);
  }

  // 2. Compare password
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Invalid email or password", HTTP_STATUS.UNAUTHORIZED);
  }

  // 3. Check account status
  if (user.status === "SUSPENDED" || user.status === "DEACTIVATED") {
    throw new AppError(
      `Account is ${user.status.toLowerCase()}. Please contact support.`,
      HTTP_STATUS.FORBIDDEN
    );
  }

  // 4. Generate token
  const token = generateToken(user.id, user.role);

  return {
    token,
    user: sanitizeUser(user),
  };
};

export const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", HTTP_STATUS.NOT_FOUND);
  }

  if (user.status === "SUSPENDED" || user.status === "DEACTIVATED") {
    throw new AppError(
      `Account is ${user.status.toLowerCase()}`,
      HTTP_STATUS.FORBIDDEN
    );
  }

  return sanitizeUser(user);
};

export const forgotPassword = async ({ email }) => {
  const normalizedEmail = email.toLowerCase().trim();
  const genericResponse = {
    email: normalizedEmail,
    message: "If an account exists with this email, a password reset verification code has been sent.",
  };

  // 1. Find user by email
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  // Security Rule: Do not reveal whether email exists
  if (!user) {
    return genericResponse;
  }

  // 2. Generate 6-digit numeric OTP & hashes
  const rawOtp = crypto.randomInt(100000, 999999).toString();
  const otpHash = await bcrypt.hash(rawOtp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
  const resendAllowedAt = new Date(Date.now() + 60 * 1000); // 60 seconds cooldown

  // 3. Upsert PasswordResetToken record for this email
  await prisma.passwordResetToken.upsert({
    where: { email: normalizedEmail },
    update: {
      userId: user.id,
      otpHash,
      resetTokenHash: null,
      expiresAt,
      attempts: 0,
      usedAt: null,
      resendAllowedAt,
    },
    create: {
      userId: user.id,
      email: normalizedEmail,
      otpHash,
      expiresAt,
      attempts: 0,
      resendAllowedAt,
    },
  });

  // 4. Enqueue email job to RabbitMQ queue
  try {
    await publishEmailJob({
      type: "PASSWORD_RESET_OTP",
      to: normalizedEmail,
      name: user.name,
      otp: rawOtp,
      expiresInMinutes: 10,
    });
  } catch (error) {
    // Return generic response without failing user flow
  }

  return genericResponse;
};

export const verifyResetOtp = async ({ email, otp }) => {
  const normalizedEmail = email.toLowerCase().trim();

  // 1. Find PasswordResetToken
  const record = await prisma.passwordResetToken.findUnique({
    where: { email: normalizedEmail },
  });

  if (!record) {
    throw new AppError(
      "No pending password reset request found for this email. Please request a code again.",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // 2. Check expiration
  if (record.expiresAt < new Date()) {
    await prisma.passwordResetToken.delete({ where: { email: normalizedEmail } });
    throw new AppError(
      "Verification code has expired. Please request a new code.",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // 3. Check attempts limit
  if (record.attempts >= 5) {
    await prisma.passwordResetToken.delete({ where: { email: normalizedEmail } });
    throw new AppError(
      "Maximum verification attempts exceeded. Please request a new code.",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  // 4. Verify OTP hash
  const isValid = await bcrypt.compare(otp, record.otpHash);
  if (!isValid) {
    const updatedAttempts = record.attempts + 1;
    if (updatedAttempts >= 5) {
      await prisma.passwordResetToken.delete({ where: { email: normalizedEmail } });
      throw new AppError(
        "Maximum verification attempts exceeded. Please request a new code.",
        HTTP_STATUS.BAD_REQUEST
      );
    } else {
      await prisma.passwordResetToken.update({
        where: { email: normalizedEmail },
        data: { attempts: updatedAttempts },
      });
      const remaining = 5 - updatedAttempts;
      throw new AppError(
        `Invalid verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`,
        HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  // 5. Generate temporary reset token for step 3 (Password Reset Form)
  const rawResetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = crypto.createHash("sha256").update(rawResetToken).digest("hex");

  await prisma.passwordResetToken.update({
    where: { email: normalizedEmail },
    data: {
      resetTokenHash,
      attempts: 0,
    },
  });

  return {
    email: normalizedEmail,
    resetToken: rawResetToken,
    message: "Code verified successfully.",
  };
};

export const resetPassword = async ({ email, resetToken, password, confirmPassword }) => {
  if (password !== confirmPassword) {
    throw new AppError("Passwords do not match", HTTP_STATUS.BAD_REQUEST);
  }

  const normalizedEmail = email ? email.toLowerCase().trim() : "";
  if (!normalizedEmail || !resetToken) {
    throw new AppError(
      "Invalid password reset session. Please request a code again.",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
  const record = await prisma.passwordResetToken.findUnique({
    where: { email: normalizedEmail },
  });

  if (!record || record.resetTokenHash !== resetTokenHash || record.expiresAt < new Date()) {
    throw new AppError(
      "Password reset session has expired or is invalid. Please request a code again.",
      HTTP_STATUS.BAD_REQUEST
    );
  }

  const newPasswordHash = await bcrypt.hash(password, 10);

  // Transactionally update password and remove reset token
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: newPasswordHash },
    }),
    prisma.passwordResetToken.delete({
      where: { email: normalizedEmail },
    }),
  ]);

  return { message: "Password reset successfully." };
};
