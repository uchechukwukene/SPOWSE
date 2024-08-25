import express from "express";
import { upload } from "../utils/multer.js";
import cloudinary from "../utils/cloudinary.js";
const uploadServiceRoutes = express.Router();

const uploadRoute = async () => {
  uploadServiceRoutes.post("/", upload.array("image"), async function (req, res) {
    const uploadedImages = [];

    try {
      // Loop through uploaded files
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        uploadedImages.push(result.secure_url);
      }

      res.status(200).json({
        success: true,
        message: "Images uploaded!",
        data: uploadedImages,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Error uploading images",
      });
    }
  });

  return uploadServiceRoutes;
};


export default uploadRoute;
