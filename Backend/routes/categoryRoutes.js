const express = require("express");
const router = express.Router();
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  getCategoriesForNavbar
} = require("../controllers/categoryController");

// Public routes
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

// Admin routes (these should be protected with admin middleware in production)
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.patch("/:id/toggle-status", toggleCategoryStatus);
router.delete("/:id", deleteCategory);

module.exports = router;
