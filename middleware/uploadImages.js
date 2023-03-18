import multer from "multer";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./cek");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + ".tmp");
  },
});

export const upload = multer({
  storage: diskStorage,
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
