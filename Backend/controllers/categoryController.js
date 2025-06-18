const Category = require("../models/Category");

// Create Category ✅
exports.createCategory = async (req, res) => {
  try {
    const { name, subcategories } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Category name is required" });
    }

    if (!Array.isArray(subcategories) || subcategories.length < 1 || subcategories.length > 10) {
      return res.status(400).json({ error: "Subcategories must be between 1 and 10" });
    }

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ error: "Category already exists" });
    }

    const category = new Category({
      name: name.trim(),
      subcategories: subcategories.map(s => s.trim()),
    });

    await category.save();
    res.status(201).json({ message: "Category created successfully", category });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Categories ✅
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get One Category by ID 🔍
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update Category ✏️
exports.updateCategory = async (req, res) => {
  try {
    const { name, subcategories } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Category name is required" });
    }

    if (!Array.isArray(subcategories) || subcategories.length < 1 || subcategories.length > 10) {
      return res.status(400).json({ error: "Subcategories must be between 1 and 10" });
    }

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        subcategories: subcategories.map(s => s.trim()),
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Category not found" });

    res.json({ message: "Category updated", category: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Category ❌
exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Category not found" });
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
