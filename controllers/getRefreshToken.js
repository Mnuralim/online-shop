import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

export const getRefreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.sendStatus(401);

  const user = await User.findOne({ refreshToken });
  if (!user) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH, (err, decoded) => {
    if (err || user.id !== decoded.id) return res.sendStatus(403);

    const id = user.id;

    const token = jwt.sign({ id }, process.env.JWT, {
      expiresIn: "1d",
    });

    res.json({ token: token });
  });
};
