import Coupon from "../models/CouponModel.js";

export const createCoupon = async (req, res) => {
  try {
    const data = await Coupon.create(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const getAllCoupon = async (req, res) => {
  try {
    const data = await Coupon.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const updateCoupon = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Coupon.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json({
      msg: "update successfully",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const deleteCoupon = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await Coupon.findByIdAndDelete(id);
    res.json({
      msg: "delete successfully",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
