const jwt = require("jsonwebtoken");
const User = require("../models/User");

const adminAuth = async (req, res, next) => {
  try {
    console.log("AdminAuth middleware called");
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Token received:", token ? "Yes" : "No");

    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded:", decoded);

    const user = await User.findById(decoded.id);
    console.log("User found:", user ? user.role : "No user");

    if (!user) {
      console.log("User not found in database");
      return res.status(401).json({ message: "Invalid token. User not found." });
    }

    if (user.role !== 'admin') {
      console.log("User is not admin, role:", user.role);
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }

    console.log("Admin auth successful");
    req.user = user;
    next();
  } catch (error) {
    console.error("Admin auth error:", error);
    res.status(401).json({ message: "Invalid token." });
  }
};

module.exports = adminAuth;
