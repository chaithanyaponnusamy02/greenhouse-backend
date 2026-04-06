require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers["x-access-token"];
  let token = null;

  if (authHeader) {
    if (typeof authHeader === "string" && authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.slice(7).trim();
    } else if (typeof authHeader === "string") {
      token = authHeader.trim();
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: "Server misconfiguration: JWT_SECRET is required" });
  }

  try {
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id);

    if (!user || user.status !== "active") {
      return res.status(401).json({ message: "Unauthorized: Invalid user" });
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: Invalid token", error: error.message });
  }
};

exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }
    next();
  };
};
