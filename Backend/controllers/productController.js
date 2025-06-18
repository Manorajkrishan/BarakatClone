const Product = require("../models/Product");
const Category = require("../models/Category");

// ✅ Create Product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      quantity,
      price,
      offer,
      description,
      mainCategoryId,
      subcategoryId,
      images
    } = req.body;

    if (!name || !quantity || !price || !description || !mainCategoryId || !subcategoryId) {
      return res.status(400).json({ message: "All fields except offer are required" });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    const category = await Category.findById(mainCategoryId);
    if (!category || !category.subcategories.includes(subcategoryId)) {
      return res.status(400).json({ message: "Invalid main category or subcategory" });
    }

    const product = new Product({
      name: name.trim(),
      quantity,
      price,
      offer: offer?.trim() || "",
      description: description.trim(),
      mainCategoryId,
      subcategory: subcategoryId,
      images,
    });

    await product.save();
    res.status(201).json({ message: "Product created", product });
  } catch (error) {
    console.error("❌ Error creating product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

// ✅ Update Product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      quantity,
      price,
      offer,
      description,
      mainCategoryId,
      subcategoryId,
      images
    } = req.body;

    if (!name || !quantity || !price || !description || !mainCategoryId || !subcategoryId) {
      return res.status(400).json({ message: "All fields except offer are required" });
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: "At least one image is required" });
    }

    const category = await Category.findById(mainCategoryId);
    if (!category || !category.subcategories.includes(subcategoryId)) {
      return res.status(400).json({ message: "Invalid main category or subcategory" });
    }

    const updated = await Product.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        quantity,
        price,
        offer: offer?.trim() || "",
        description: description.trim(),
        mainCategoryId,
        subcategory: subcategoryId,
        images,
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product updated", product: updated });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
