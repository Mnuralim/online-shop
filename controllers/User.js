import User from "../models/UserModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto, { randomUUID } from "crypto";
import { getEmail } from "./email.js";
import Cart from "../models/CartModel.js";
import Product from "../models/ProductModel.js";
import Coupon from "../models/CouponModel.js";
import Order from "../models/OrderModel.js";

export const register = async (req, res) => {
  const { firstname, lastname, email, password, mobile, role } = req.body;
  const findUser = await User.findOne({ email: email });
  if (findUser) return res.status(400).json({ msg: "User Already exists" });

  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt);

  try {
    const data = await User.create({
      firstname: firstname,
      lastname: lastname,
      email: email,
      password: hashPassword,
      mobile: mobile,
      role: role,
    });
    res.status(200).json({
      msg: "Register Sucessfully ",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const LoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const findUser = await User.findOne({ email });
    //find user
    if (!findUser) return res.status(404).json({ msg: "User not found!" });

    //matching password
    const match = await bcrypt.compare(password, findUser.password);
    if (!match) return res.status(400).json({ msg: "wrong password" });

    //generate token
    const id = findUser.id;
    const token = jwt.sign({ id }, process.env.JWT, {
      expiresIn: "1d",
    });
    const refreshToken = jwt.sign({ id }, process.env.REFRESH, {
      expiresIn: "3d",
    });

    await User.findByIdAndUpdate(
      id,
      {
        refreshToken: refreshToken,
      },
      {
        new: true,
      }
    );

    res.cookie("refreshToken", refreshToken, {
      maxAge: 72 * 60 * 60 * 60,
      httpOnly: true,
    });

    res.json({
      msg: "success login",
      data: {
        id: findUser?.id,
        firstname: findUser?.firstname,
        lastname: findUser?.lastname,
        email: findUser?.email,
        mobile: findUser?.mobile,
        token: token,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const Logout = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.sendStatus(204);

  const user = await User.findOneAndUpdate(
    { refreshToken },
    {
      refreshToken: "",
    }
  );
  res.clearCookie("refreshToken");
  res.sendStatus(200);
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await User.findById(id);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const data = await User.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.user;
  const { firstname, lastname, email, mobile } = req.body;

  try {
    const updateUser = await User.findByIdAndUpdate(
      id,
      {
        firstname: firstname,
        lastname: lastname,
        email: email,
        mobile: mobile,
      },
      {
        new: true,
      }
    );
    res.status(201).json({
      msg: "User Updated",
      data: updateUser,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const deleteUser = await User.findByIdAndDelete(id);
    res.status(201).json({
      msg: "User deleted",
      data: deleteUser,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const blockUser = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: true,
      },
      {
        new: true,
      }
    );
    res.status(200).json({
      msg: "user blocked",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const unBlockUser = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await User.findByIdAndUpdate(
      id,
      {
        isBlocked: false,
      },
      {
        new: true,
      }
    );
    res.status(200).json({
      msg: "user unblocked",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const updatePassword = async (req, res) => {
  const { password } = req.body;
  const { id } = req.user;
  const user = await User.findById(id);
  if (!user) return res.status(404).json({ msg: "User not found" });

  //generate reset token
  const token = crypto.randomBytes(32).toString("hex");
  const passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");

  //set expires date
  const passwordResetExpires = Date.now() + 10 * 60 * 1000;
  const passwordChangedAt = Date.now();
  //hash password
  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt);

  let newPassword;
  if (password) {
    newPassword = hashPassword;
  } else {
    newPassword = user.password;
  }

  try {
    const data = await User.findByIdAndUpdate(
      id,
      {
        password: newPassword,
        passwordChangedAt: passwordChangedAt,
        passwordResetToken: passwordResetToken,
        passwordResetExpires: passwordResetExpires,
      },
      {
        new: true,
      }
    );
    res.status(200).json({
      msg: "success updated password",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ msg: "User not found" });

  try {
    const token = crypto.randomBytes(32).toString("hex");
    const passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");

    //set expires date
    const passwordResetExpires = Date.now() + 10 * 60 * 1000;
    const passwordChangedAt = Date.now();

    await User.findByIdAndUpdate(user.id, {
      passwordChangedAt: passwordChangedAt,
      passwordResetExpires: passwordResetExpires,
      passwordResetToken: passwordResetToken,
    });

    const resetUrl = `Follow this link to reset your password. link will expires in 10 minutes. <a href="http://localhost:5000/reset-password/${passwordResetToken}">Click Me </a>`;

    const data = {
      to: email,
      subject: "Reset Password",
      text: `hey ${email}`,
      html: resetUrl,
    };
    getEmail(data);

    res.json({
      msg: "email sent",
      token: passwordResetToken,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const resetPassword = async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;

  try {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(404).json({ msg: "user not found" });

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    user.password = hashPassword;
    user.passwordResetToken = "";
    user.passwordResetExpires = "";
    user.passwordChangedAt = Date.now();
    await user.save();

    return res.status(200).json({
      msg: user,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getWishlist = async (req, res) => {
  const { id } = req.user;
  try {
    const data = await User.findById(id).populate("wishlist");
    res.json(data);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const addAddress = async (req, res) => {
  const { id } = req.user;

  try {
    const data = await User.findByIdAndUpdate(
      id,
      {
        address: req.body.address,
      },
      {
        new: true,
      }
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const addToCart = async (req, res) => {
  const { id } = req.user;
  const { cart } = req.body;
  console.log(id);
  try {
    const products = [];

    const user = await User.findById(id);
    const alreadyAdd = await Cart.findOne({ orderby: id });
    console.log(alreadyAdd);
    if (alreadyAdd) {
      alreadyAdd.remove();
    }
    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i].id;
      object.count = cart[i].count;
      object.color = cart[i].color;
      let getPrice = await Product.findById(cart[i].id).select("price").exec();
      object.price = getPrice.price;
      products.push(object);
    }

    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      cartTotal = cartTotal + products[i].count * products[i].price;
    }

    let newCart = await new Cart({
      products: products,
      cartTotal: cartTotal,
      orderby: user.id,
    }).save();

    const getData = await Cart.findOne({ orderby: user.id });

    res.json(getData);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getUserCart = async (req, res) => {
  const { id } = req.user;
  try {
    const data = await Cart.findOne({ orderby: id }).populate("products.product");
    res.json(data);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const emptyCart = async (req, res) => {
  const { id } = req.user;
  try {
    const data = await Cart.findOneAndRemove({ orderby: id });
    res.json({
      msg: "success",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const applyCoupon = async (req, res) => {
  const { id } = req.user;
  const { coupon } = req.body;
  try {
    const validCoupon = await Coupon.findOne({ name: coupon });
    if (validCoupon == null) return res.status(404).json({ msg: "invalid coupon" });

    const user = await User.findById(id);
    const getCart = await Cart.findOne({ orderby: user.id });
    const cartTotal = getCart.cartTotal;

    const totalAfterDiscount = cartTotal - (cartTotal * validCoupon.discount) / 100;

    const updateCart = await Cart.findOneAndUpdate(
      { orderby: user.id },
      {
        totalAfterDiscount: totalAfterDiscount,
      },
      {
        new: true,
      }
    );
    res.json(updateCart.totalAfterDiscount);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createOrder = async (req, res) => {
  const { COD, couponApplied } = req.body;
  const { id } = req.user;

  try {
    const user = await User.findById(id);
    if (!COD) return res.status(400).json({ msg: "COD failed" });

    const userCart = await Cart.findOne({ orderby: user.id });

    let finalAmount = 0;
    if (couponApplied && userCart.totalAfterDiscount) {
      finalAmount = userCart.totalAfterDiscount;
    } else {
      finalAmount = userCart.cartTotal;
    }

    const newOrder = await new Order({
      products: userCart.products,
      paymentIntent: {
        id: randomUUID(),
        method: "COD",
        amount: finalAmount,
        status: "Cash On Delivery",
        created: Date.now(),
        currency: "USD",
      },
      orderStatus: "Cash On Delivery",
      orderby: user.id,
    }).save();

    const updated = userCart.products.map((item) => {
      return {
        updateOne: {
          filter: { _id: item.product._id },
          update: { $inc: { quantity: -item.count, sold: +item.count } },
        },
      };
    });

    const updateProduct = await Product.bulkWrite(updated);

    res.json({
      msg: "success order",
      data: newOrder,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getOrders = async (req, res) => {
  const { id } = req.user;
  try {
    const data = await Order.findOne({ orderby: id });
    res.json(data);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const data = await Order.findByIdAndUpdate(
      id,
      {
        orderStatus: status,
        paymentIntent: {
          status: status,
        },
      },
      {
        new: true,
      }
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
