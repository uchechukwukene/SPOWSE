// import memberRoutes from "./signUp.js";
import uploadRoute from "../uploads/uploadImg.js";
import authRoute from "./authentication/authRoutes.js";
import notificationRoot from "./notification/notificationRooute.js";
import postRoute from "./postRoutes/postRoutes.js";
import userRoute from "./userServices/userServicesRoutes.js";
const upload = await uploadRoute(); // Call the async function to get the router

export default (router) => {
  router.use("/auth", authRoute());
  router.use("/profile", userRoute());
  router.use("/post", postRoute());
  router.use("/upload", upload);
  router.use('/notification', notificationRoot());

  return router;
};