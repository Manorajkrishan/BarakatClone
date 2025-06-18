const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Order = require("../models/Order");
const User = require("../models/User");
const adminAuth = require("../middleware/adminAuth"); // ✅ Middleware for admin routes

// 🔹 Test route (optional)
router.get("/test", (req, res) => {
  res.json({ message: "Order routes are working!" });
});

// 🔹 Create test orders
router.get("/create-test-orders", async (req, res) => {
  try {
    const testOrders = [
      {
        userId: null,
        items: [
          { name: "Fresh Apples", quantity: 2, price: 15.99 },
          { name: "Organic Bananas", quantity: 3, price: 8.5 }
        ],
        total: 40.48,
        userInfo: {
          name: "Ahmed Al-Rashid",
          address: "123 Sheikh Zayed Road, Dubai",
          phone: "+971501234567"
        },
        paymentMethod: "cod",
        status: "pending"
      },
      {
        userId: null,
        items: [
          { name: "Premium Dates", quantity: 1, price: 45.0 },
          { name: "Fresh Milk", quantity: 2, price: 12.99 }
        ],
        total: 70.98,
        userInfo: {
          name: "Fatima Hassan",
          address: "456 Al Wasl Road, Dubai",
          phone: "+971509876543"
        },
        paymentMethod: "card",
        status: "confirmed"
      },
      {
        userId: null,
        items: [
          { name: "Chicken Breast", quantity: 1, price: 28.5 },
          { name: "Rice Basmati", quantity: 2, price: 18.99 }
        ],
        total: 66.48,
        userInfo: {
          name: "Mohammed Ali",
          address: "789 Jumeirah Beach Road, Dubai",
          phone: "+971551234567"
        },
        paymentMethod: "cod",
        status: "processing"
      }
    ];

    const createdOrders = [];
    for (const data of testOrders) {
      const order = new Order(data);
      await order.save();
      createdOrders.push(order);
    }

    res.json({
      message: `${createdOrders.length} test orders created`,
      orders: createdOrders
    });
  } catch (error) {
    console.error("Error creating test orders:", error);
    res.status(500).json({ message: "Error creating test orders" });
  }
});

// 🔹 User: Get user's own orders (authenticated users)
router.get("/my-orders", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    console.log("Fetching orders for user:", userId);
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 });

    console.log("Found user orders:", orders.length);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: "Server error fetching orders" });
  }
});

// 🔹 Admin: Get all orders
router.get("/admin/all", adminAuth, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error fetching orders" });
  }
});

// 🔹 Admin: Update order status
router.put("/admin/:id/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("userId", "name email");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order status updated", order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server error updating order" });
  }
});

// 🔹 Admin: Delete an order
router.delete("/admin/:id", adminAuth, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Server error deleting order" });
  }
});

// 🔹 Public (Authenticated Users): Place new order
router.post("/", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const { items, total, userInfo, paymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0)
      return res.status(400).json({ message: "Cart items required" });

    if (!total || total <= 0)
      return res.status(400).json({ message: "Invalid total amount" });

    if (!userInfo?.name || !userInfo?.address || !userInfo?.phone)
      return res.status(400).json({ message: "Complete delivery info required" });

    const order = new Order({
      userId,
      items: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      total,
      userInfo,
      paymentMethod: paymentMethod || "cod",
      status: "pending"
    });

    await order.save();

    res.status(201).json({
      message: "Order placed successfully",
      order: {
        _id: order._id,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt
      }
    });
  } catch (err) {
    console.error("Order Error:", err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: "Server error placing order" });
  }
});

module.exports = router;
