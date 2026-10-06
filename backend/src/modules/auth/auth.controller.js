import {
  registerUser,
  verifyRegisterOtp,
  resendRegisterOtp,
  loginUser,
  getUserById,
  forgotPassword as forgotPasswordService,
  verifyResetOtp as verifyResetOtpService,
  resetPassword as resetPasswordService,
} from "./auth.service.js";
import { sendSuccess } from "../../utils/apiResponse.js";
import { HTTP_STATUS } from "../../constants/index.js";

export const register = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);
    return sendSuccess(
      res,
      HTTP_STATUS.OK,
      "Verification code sent to your email.",
      result
    );
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const result = await verifyRegisterOtp(req.body);
    return sendSuccess(
      res,
      HTTP_STATUS.CREATED,
      "Account created successfully.",
      result
    );
  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const result = await resendRegisterOtp(req.body);
    return sendSuccess(
      res,
      HTTP_STATUS.OK,
      "New verification code sent to your email.",
      result
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    return sendSuccess(
      res,
      HTTP_STATUS.OK,
      "Login successful",
      result
    );
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await getUserById(req.user.id);
    return sendSuccess(
      res,
      HTTP_STATUS.OK,
      "Current user profile retrieved",
      user
    );
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const result = await forgotPasswordService(req.body);
    return sendSuccess(
      res,
      HTTP_STATUS.OK,
      result.message,
      result
    );
  } catch (error) {
    next(error);
  }
};

export const verifyResetOtp = async (req, res, next) => {
  try {
    const result = await verifyResetOtpService(req.body);
    return sendSuccess(
      res,
      HTTP_STATUS.OK,
      result.message,
      result
    );
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const result = await resetPasswordService(req.body);
    return sendSuccess(
      res,
      HTTP_STATUS.OK,
      result.message,
      null
    );
  } catch (error) {
    next(error);
  }
};
