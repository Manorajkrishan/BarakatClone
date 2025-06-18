const Category = require("../models/Category");

// Helper function to validate base64 image
const validateBase64Image = (base64String) => {
  if (!base64String) return true; // Allow empty
  return /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(base64String);
};

// Helper function to validate subcategories
const validateSubcategories = (subcategories) => {
  if (!Array.isArray(subcategories)) {
    return { isValid: false, message: "Subcategories must be an array" };
  }

  if (subcategories.length > 15) {
    return { isValid: false, message: "Maximum 15 subcategories allowed" };
  }

  for (let i = 0; i < subcategories.length; i++) {
    const subcat = subcategories[i];

    // Handle both string format (legacy) and object format (new)
    if (typeof subcat === 'string') {
      if (!subcat.trim()) {
        return { isValid: false, message: `Subcategory at index ${i} cannot be empty` };
      }
    } else if (typeof subcat === 'object' && subcat !== null) {
      if (!subcat.name || typeof subcat.name !== 'string' || !subcat.name.trim()) {
        return { isValid: false, message: `Subcategory at index ${i} must have a valid name` };
      }
      if (subcat.image && !validateBase64Image(subcat.image)) {
        return { isValid: false, message: `Subcategory at index ${i} has invalid image format` };
      }
    } else {
      return { isValid: false, message: `Subcategory at index ${i} must be a string or object` };
    }
  }

  return { isValid: true };
};

// Create Category ✅
exports.createCategory = async (req, res) => {
  try {
    const { name, image, subcategories = [], isActive = true } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Category name is required" });
    }

    // Validate main category image
    if (image && !validateBase64Image(image)) {
      return res.status(400).json({ error: "Invalid image format. Must be base64 encoded image (jpeg, jpg, png, gif, webp)" });
    }

    // Validate subcategories
    const subcatValidation = validateSubcategories(subcategories);
    if (!subcatValidation.isValid) {
      return res.status(400).json({ error: subcatValidation.message });
    }

    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ error: "Category already exists" });
    }

    // Process subcategories - convert strings to objects for backward compatibility
    const processedSubcategories = subcategories.map(subcat => {
      if (typeof subcat === 'string') {
        return { name: subcat.trim(), image: null };
      }
      return {
        name: subcat.name.trim(),
        image: subcat.image || null
      };
    });

    const category = new Category({
      name: name.trim(),
      image: image || null,
      subcategories: processedSubcategories,
      isActive
    });

    await category.save();
    res.status(201).json({ message: "Category created successfully", category });

  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// Get All Categories ✅
exports.getAllCategories = async (req, res) => {
  try {
    const { includeInactive = false, forNavbar = false } = req.query;

    // Special handling for navbar request
    if (forNavbar === 'true') {
      console.log('🔍 getAllCategories called for navbar'); // Debug log
      const categories = await Category.find({
        isActive: true,
        'subcategories.0': { $exists: true } // Only categories with at least one subcategory
      }).select('name image subcategories').sort({ name: 1 });

      console.log('📊 Found categories for navbar:', categories.length); // Debug log
      return res.status(200).json(categories);
    }

    // Regular category listing
    const filter = includeInactive === 'true' ? {} : { isActive: true };
    const categories = await Category.find(filter).sort({ name: 1 });
    res.status(200).json(categories);
  } catch (err) {
    console.error('❌ Error in getAllCategories:', err.message); // Debug log
    res.status(500).json({ error: err.message });
  }
};

// Get One Category by ID 🔍
exports.getCategoryById = async (req, res) => {
  try {
    console.log('🔍 getCategoryById called with ID:', req.params.id); // Debug log
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json(category);
  } catch (err) {
    console.error('❌ Error in getCategoryById:', err.message); // Debug log
    res.status(500).json({ error: err.message });
  }
};

// Update Category ✏️
exports.updateCategory = async (req, res) => {
  try {
    const { name, image, subcategories = [], isActive } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({ error: "Category name is required" });
    }

    // Validate main category image
    if (image && !validateBase64Image(image)) {
      return res.status(400).json({ error: "Invalid image format. Must be base64 encoded image (jpeg, jpg, png, gif, webp)" });
    }

    // Validate subcategories
    const subcatValidation = validateSubcategories(subcategories);
    if (!subcatValidation.isValid) {
      return res.status(400).json({ error: subcatValidation.message });
    }

    // Check if name is being changed and if new name already exists
    const existingCategory = await Category.findById(req.params.id);
    if (!existingCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    if (name.trim() !== existingCategory.name) {
      const nameExists = await Category.findOne({
        name: name.trim(),
        _id: { $ne: req.params.id }
      });
      if (nameExists) {
        return res.status(400).json({ error: "Category name already exists" });
      }
    }

    // Process subcategories - convert strings to objects for backward compatibility
    const processedSubcategories = subcategories.map(subcat => {
      if (typeof subcat === 'string') {
        return { name: subcat.trim(), image: null };
      }
      return {
        name: subcat.name.trim(),
        image: subcat.image || null
      };
    });

    const updateData = {
      name: name.trim(),
      subcategories: processedSubcategories,
    };

    // Only update image if provided
    if (image !== undefined) {
      updateData.image = image;
    }

    // Only update isActive if provided
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({ message: "Category updated successfully", category: updated });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// Delete Category ❌
exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Category not found" });
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle Category Status
exports.toggleCategoryStatus = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    category.isActive = !category.isActive;
    await category.save();

    res.json({
      message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
      category
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Categories for Navbar (only active categories with subcategories)
exports.getCategoriesForNavbar = async (req, res) => {
  try {
    console.log('🔍 getCategoriesForNavbar called'); // Debug log
    const categories = await Category.find({
      isActive: true,
      'subcategories.0': { $exists: true } // Only categories with at least one subcategory
    }).select('name image subcategories').sort({ name: 1 });

    console.log('📊 Found categories for navbar:', categories.length); // Debug log
    res.status(200).json(categories);
  } catch (err) {
    console.error('❌ Error in getCategoriesForNavbar:', err.message); // Debug log
    res.status(500).json({ error: err.message });
  }
};
