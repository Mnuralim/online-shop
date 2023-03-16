import cloudinary from "cloudinary";

import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export const cloudinaryUploadImage = async (fileUpload) => {
  try {
    const result = await cloudinary.v2.uploader.upload(fileUpload, {
      resource_type: "auto",
    });
    return { url: result.secure_url };
  } catch (error) {
    throw new Error(error);
  }
};
