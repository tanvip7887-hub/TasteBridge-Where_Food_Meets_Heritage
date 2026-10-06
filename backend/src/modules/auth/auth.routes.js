import { Router } from "express";
import {
  register,
  verifyOtp,
  resendOtp,
  login,
  getMe,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} from "./auth.controller.js";
import {
  registerSchema,
  verifyOtpSchema,
  resendOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
} from "./auth.validation.js";
import { validate } from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/auth.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/register/verify-otp", validate(verifyOtpSchema), verifyOtp);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);
router.post("/register/resend-otp", validate(resendOtpSchema), resendOtp);
router.post("/resend-otp", validate(resendOtpSchema), resendOtp);
router.post("/login", validate(loginSchema), login);
router.get("/me", authenticate, getMe);

// Password Reset Routes (Publicly accessible)
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/verify-reset-otp", validate(verifyResetOtpSchema), verifyResetOtp);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

export default router;
