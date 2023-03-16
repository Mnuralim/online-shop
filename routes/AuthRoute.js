import express from "express";
import { getRefreshToken } from "../controllers/getRefreshToken.js";
import {
  addAddress,
  addToCart,
  applyCoupon,
  blockUser,
  createOrder,
  deleteUser,
  emptyCart,
  forgotPassword,
  getAllUsers,
  getOrders,
  getUserById,
  getUserCart,
  getWishlist,
  LoginUser,
  Logout,
  register,
  resetPassword,
  unBlockUser,
  updateOrderStatus,
  updatePassword,
  updateUser,
} from "../controllers/User.js";
import { adminOnly, authMidleware } from "../middleware/AuthMidleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login-user", LoginUser);
router.delete("/logout", Logout);
router.get("/users/:id", authMidleware, adminOnly, getUserById);
router.get("/users", getAllUsers);
router.put("/users/update-user/", authMidleware, updateUser);
router.delete("/users/delete-user/:id", deleteUser);

router.get("/get-refreshtoken", getRefreshToken);

router.put("/block-user/:id", authMidleware, adminOnly, blockUser);
router.put("/unblock-user/:id", authMidleware, adminOnly, unBlockUser);

router.put("/update-password", authMidleware, updatePassword);
router.put("/forgot-password", authMidleware, forgotPassword);
router.put("/reset-password/:token", authMidleware, resetPassword);

router.get("/get-wishlist", authMidleware, getWishlist);

router.put("/save-address", authMidleware, addAddress);

router.post("/cart", authMidleware, addToCart);
router.get("/cart", authMidleware, getUserCart);
router.delete("/cart", authMidleware, emptyCart);

router.put("/cart/apply-coupon", authMidleware, applyCoupon);
router.post("/cart/cash-order", authMidleware, createOrder);
router.get("/get-orders", authMidleware, getOrders);
router.put("/update-order-status/:id", authMidleware, adminOnly, updateOrderStatus);

export default router;
