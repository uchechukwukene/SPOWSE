import express from "express";
import { authentication, check } from "../../middlewares/authentication.js";
import {
  deleteUserProfileHandler,
  followUserHandler,
  getUserPointHandler,
  leaderBoardHandler,
  updateUserProfileHandler,
  viewConnectionHandler,
  viewUsereHandler,
  viewProfileHandler,
  searchHandler,
} from "../../controller/userController/userControllers.js";
const userServiceRoutes = express.Router();

const userRoute = () => {
  userServiceRoutes.get("/view", authentication, viewProfileHandler);
  userServiceRoutes.get("/view-user", viewUsereHandler);
  userServiceRoutes.get("/leader-board", check, leaderBoardHandler);
  userServiceRoutes.get("/search", searchHandler);
  userServiceRoutes.get("/point", authentication, getUserPointHandler);
  userServiceRoutes.get("/connection", authentication, viewConnectionHandler);
  userServiceRoutes.post("/follow", authentication, followUserHandler);
  userServiceRoutes.patch("/update", authentication, updateUserProfileHandler);
  userServiceRoutes.delete("/delete", authentication, deleteUserProfileHandler);
  return userServiceRoutes;
};

export default userRoute;
