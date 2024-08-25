import { v2 as cloudinary } from "cloudinary";
import env from "../config/env.js";

cloudinary.config({
  cloud_name: env.cloud_name,
  api_key: env.api_key,
  api_secret: env.api_secret,
  secure: true,
});

export default cloudinary;
