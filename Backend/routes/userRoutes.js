const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Test route
router.get("/test", (req, res) => {
  console.log("User routes test hit!");
  res.json({ message: "User routes are working!" });
});

// Get all users (Admin only)
router.get("/admin/all", async (req, res) => {
  try {
    console.log("Admin all users route hit!");
    const users = await User.find()
      .select('-password') // Exclude password field
      .sort({ createdAt: -1 });
    
    console.log("Found users:", users.length);
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error fetching users" });
  }
});

// Get user statistics
router.get("/admin/stats", async (req, res) => {
  try {
    console.log("Getting user statistics...");
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = await User.countDocuments({ role: 'user' });
    
    // Get recent users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({ 
      createdAt: { $gte: thirtyDaysAgo } 
    });
    
    const stats = {
      totalUsers,
      adminUsers,
      regularUsers,
      recentUsers
    };
    
    console.log("User stats:", stats);
    res.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ message: "Server error fetching user statistics" });
  }
});

// Get user by ID
router.get("/admin/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error fetching user" });
  }
});

// Update user role
router.put("/admin/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;
    
    const validRoles = ['user', 'admin'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "User role updated", user });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Server error updating user" });
  }
});

// Delete user
router.delete("/admin/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error deleting user" });
  }
});

// Create test users
router.get("/create-test-users", async (req, res) => {
  try {
    console.log("Creating test users...");
    
    const testUsers = [
      {
        name: "Ahmed Al-Rashid",
        email: "ahmed.rashid@example.com",
        password: "$2b$10$example", // This would be hashed in real scenario
        role: "user"
      },
      {
        name: "Fatima Hassan",
        email: "fatima.hassan@example.com", 
        password: "$2b$10$example",
        role: "user"
      },
      {
        name: "Mohammed Ali",
        email: "mohammed.ali@example.com",
        password: "$2b$10$example", 
        role: "user"
      },
      {
        name: "Sarah Abdullah",
        email: "sarah.abdullah@example.com",
        password: "$2b$10$example",
        role: "admin"
      },
      {
        name: "Omar Khalil",
        email: "omar.khalil@example.com",
        password: "$2b$10$example",
        role: "user"
      }
    ];

    const createdUsers = [];
    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        createdUsers.push(user);
      }
    }

    console.log("Test users created:", createdUsers.length);
    res.json({ 
      message: `${createdUsers.length} test users created successfully`, 
      users: createdUsers.map(u => ({ name: u.name, email: u.email, role: u.role }))
    });
  } catch (error) {
    console.error("Error creating test users:", error);
    res.status(500).json({ message: "Error creating test users" });
  }
});

module.exports = router;
