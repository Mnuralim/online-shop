import express, { Router } from "express";
import { createCoupon, deleteCoupon, getAllCoupon, updateCoupon } from "../controllers/Coupon.js";
import { adminOnly, authMidleware } from "../middleware/AuthMidleware.js";

const router = express.Router();

router.post("/", authMidleware, adminOnly, createCoupon);
router.get("/", authMidleware, adminOnly, getAllCoupon);
router.put("/:id", authMidleware, adminOnly, updateCoupon);
router.delete("/:id", authMidleware, adminOnly, deleteCoupon);

export default router;
