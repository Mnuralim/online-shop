import express from "express";
import { addToWishlist, createProduct, deleteProduct, getAllProducts, getProduct, rating, updateProduct, uploadImages } from "../controllers/Product.js";
import { adminOnly, authMidleware } from "../middleware/AuthMidleware.js";
import { upload } from "../middleware/uploadImages.js";

const router = express.Router();

router.post("/create-product", authMidleware, adminOnly, createProduct);
router.get("/get-product/:id", getProduct);
router.get("/get-all-products/", getAllProducts);
router.put("/update-product/:id", authMidleware, adminOnly, updateProduct);
router.delete("/delete-product/:id", authMidleware, adminOnly, deleteProduct);

router.put("/add-wishlist", authMidleware, addToWishlist);

router.put("/ratings", authMidleware, rating);

router.put("/upload-images/:id", authMidleware, adminOnly, upload.array("images", 10), uploadImages);

export default router;
