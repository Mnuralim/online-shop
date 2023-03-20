import multer from "multer";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "cloudinary";

import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// const diskStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "./public");
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + "-" + uniqueSuffix);
//   },
// });

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: "coba",
    allowed_formats: ["jpg", "png"],
  },
});

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50000000,
  },
});

export const productImageResizer = async (req, res, next) => {
  if (!req.files) return next();

  await Promise.all(
    req.files.map(async (file) => {
      await sharp(file.path).resize(300, 300).toFormat("jpeg").toBuffer();
    })
  );
  next();
};
