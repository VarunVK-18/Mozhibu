const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey123";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      // We included `user.id` in payload
      req.user = await User.findById(decoded.user.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ msg: "Not authorized, user not found" });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ msg: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ msg: "Not authorized, no token" });
  }
};

const protectOptional = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.user.id).select("-password");
    } catch (error) {
      console.error("Optional auth failed:", error);
    }
  }
  next();
};

const superadmin = (req, res, next) => {
  if (req.user && req.user.role === "superadmin") {
    next();
  } else {
    res.status(403).json({ msg: "Forbidden, superadmin only" });
  }
};

const author = (req, res, next) => {
  if (
    req.user &&
    (req.user.role === "writer" || req.user.role === "superadmin")
  ) {
    next();
  } else {
    res.status(403).json({ msg: "Forbidden, author only" });
  }
};

module.exports = { protect, protectOptional, superadmin, author };
