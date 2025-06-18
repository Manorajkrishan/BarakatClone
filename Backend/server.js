const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Route Imports
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const orderRoutes = require("./routes/orderRoutes"); // ✅ newly added
const userRoutes = require("./routes/userRoutes"); // ✅ user management

const app = express();

// Middleware
app.use(cors());

// ✅ Support large JSON and URL-encoded bodies (for base64 image data)
app.use(express.json({ limit: "1000mb" }));
app.use(express.urlencoded({ extended: true, limit: "1000mb" }));

// Optional: serve uploaded images if needed in future
app.use("/uploads", express.static("uploads"));

// API Routes
app.use("/api/auth", authRoutes);             // Login/Register
app.use("/api/products", productRoutes);      // Product CRUD
app.use("/api/categories", categoryRoutes);   // Category CRUD
app.use("/api/orders", orderRoutes);          // ✅ Order endpoint
app.use("/api/users", userRoutes);            // ✅ User management

// Health check route
app.get("/", (req, res) => {
  res.send("✅ Barakat API is running.");
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB connected");
  app.listen(process.env.PORT || 5000, () =>
    console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
  );
})
.catch((err) => {
  console.error("❌ MongoDB connection failed:", err.message);
});
