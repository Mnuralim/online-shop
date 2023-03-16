import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

export const authMidleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  //token validation
  if (token == null) return res.status(401).json({ msg: "There is no token" });

  jwt.verify(token, process.env.JWT, async (err, decoded) => {
    if (err) return res.status(403).json({ msg: "access forbidden, Login Please" });

    const user = await User.findById(decoded.id);
    req.user = user;
    next();
  });
};

export const adminOnly = async (req, res, next) => {
  const email = req.user.email;
  const findAdmin = await User.findOne({ email });
  if (!findAdmin) return res.status(404).json({ msg: "Data not found" });

  if (findAdmin.role !== "admin") return res.status(403).json({ msg: "Access forbiden" });
  next();
};
