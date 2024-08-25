import appResponse from "../../lib/appResponse.js";
import {
  forgotPassword,
  loginUser,
  resendOtp,
  resetPassword,
  signUpUser,
  userOtpVerifcation,
} from "../../services/authentication/authServices.js";

export const signUpHandler = async (req, res) => {
  const { body } = req;
  const user = await signUpUser({ body });

  res.send(appResponse("new user onboarded successfully", user));
};

export const verifyOtpHandler = async (req, res) => {
  const { body } = req;
  const { email } = req.query;

  const verifyUser = await userOtpVerifcation({ body, email });

  res.send(
    appResponse(`User OTP verified succefully, you can now log in`, verifyUser)
  );
};

export const LoginHandler = async (req, res) => {
  const { body } = req;
  const loggedIn = await loginUser({ body });
  res.send(appResponse(`Logged in successfully`, loggedIn));
};

export const forgotPasswordHandler = async (req, res) => {
  const { body } = req;

  const updatePassword = await forgotPassword({ body });

  res.send(appResponse(`Reset Details successfully`, updatePassword));
};

export const resetPasswordHandler = async (req, res) => {
  const { email } = req.query;
  const { body } = req;

  const updatePassword = await resetPassword({ email, body });

  res.send(appResponse(`Password RESETED successfully`, updatePassword));
};

export const resendOtpHandler = async (req, res) => {
  const { body } = req;

  const data = await resendOtp({ body });

  res.send(appResponse(`OTP resent successfully`, data));
};
