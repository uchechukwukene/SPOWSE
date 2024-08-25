import express from "express";
import {
  LoginHandler,
  forgotPasswordHandler,
  resendOtpHandler,
  resetPasswordHandler,
  signUpHandler,
  verifyOtpHandler,
} from "../../controller/authentication/authControllers.js";
import Validate from "../../validators/index.js";
import {
  otpCodeSchema,
  signUpSchema,
  validateForgotPassword,
  validateLoginUserSchema,
  validateResetForgotPassword,
} from "../../validators/authValidators.js";

const userAuthRoutes = express.Router();

const authRoute = () => {
  userAuthRoutes.post("/signup", Validate(signUpSchema), signUpHandler);
  userAuthRoutes.post(
    "/otp-verification",
    Validate(otpCodeSchema),
    verifyOtpHandler
  );
  userAuthRoutes.post(
    "/login",
    Validate(validateLoginUserSchema),
    LoginHandler
  );
  userAuthRoutes.post(
    "/forgot_password",
    Validate(validateForgotPassword),
    forgotPasswordHandler
  );
  userAuthRoutes.patch(
    "/reset_password",
    Validate(validateResetForgotPassword),
    resetPasswordHandler
  );
  userAuthRoutes.post(
    "/resend-otp",
    Validate(validateForgotPassword),
    resendOtpHandler
  );

  return userAuthRoutes;
};

export default authRoute;
