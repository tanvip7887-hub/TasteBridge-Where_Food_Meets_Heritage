import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { HTTP_STATUS } from "../constants/index.js";

// Authenticate JWT middleware
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication required. Please log in.", HTTP_STATUS.UNAUTHORIZED);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new AppError("Authentication required. Invalid token format.", HTTP_STATUS.UNAUTHORIZED);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw new AppError("Authentication token expired. Please log in again.", HTTP_STATUS.UNAUTHORIZED);
      }
      throw new AppError("Invalid authentication token.", HTTP_STATUS.UNAUTHORIZED);
    }

    // Load actual user from PostgreSQL database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new AppError("User account no longer exists.", HTTP_STATUS.UNAUTHORIZED);
    }

    if (user.status === "SUSPENDED" || user.status === "DEACTIVATED") {
      throw new AppError(`Account is ${user.status.toLowerCase()}.`, HTTP_STATUS.FORBIDDEN);
    }

    // Attach safe user object to request
    const { passwordHash, ...safeUser } = user;
    req.user = safeUser;

    next();
  } catch (error) {
    next(error);
  }
};

// Role-based Access Control (RBAC) middleware
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError("Authentication required.", HTTP_STATUS.UNAUTHORIZED)
      );
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access denied. Requires one of the following roles: ${allowedRoles.join(", ")}`,
          HTTP_STATUS.FORBIDDEN
        )
      );
    }

    next();
  };
};
