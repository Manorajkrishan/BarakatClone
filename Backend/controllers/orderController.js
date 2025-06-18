const jwt = require("jsonwebtoken");
const Order = require("../models/Order");
const User = require("../models/User");

// Get all orders (Admin only)
exports.getAllOrders = async (req, res) => {
  try {
    console.log("getAllOrders controller called");
    const orders = await Order.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    console.log("Found orders:", orders.length);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error fetching orders" });
  }
};

// Get order by ID (Admin only)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ message: "Server error fetching order" });
  }
};

// Update order status (Admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order status updated", order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server error updating order" });
  }
};

// Delete order (Admin only)
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Server error deleting order" });
  }
};

exports.placeOrder = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { items, total, userInfo, paymentMethod } = req.body;

    // Validation
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart items are required" });
    }

    if (!total || total <= 0) {
      return res.status(400).json({ message: "Invalid total amount" });
    }

    if (!userInfo || !userInfo.name || !userInfo.address || !userInfo.phone) {
      return res.status(400).json({ message: "Complete delivery information is required" });
    }

    // Create order with additional information
    const order = new Order({
      userId,
      items: items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      })),
      total,
      userInfo: {
        name: userInfo.name,
        address: userInfo.address,
        phone: userInfo.phone
      },
      paymentMethod: paymentMethod || 'cod',
      status: 'pending'
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
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: "Server error placing order" });
  }
};
