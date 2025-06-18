const mongoose = require("mongoose");

// Subcategory schema with image support
const subcategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Subcategory name is required"],
    trim: true,
  },
  image: {
    type: String, // Base64 encoded image
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow null/empty
        // Check if it's a valid base64 image string
        return /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(v);
      },
      message: "Image must be a valid base64 encoded image (jpeg, jpg, png, gif, webp)"
    }
  }
}, { _id: false }); // Don't create separate _id for subcategories

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Category name is required"],
    unique: true,
    trim: true,
  },
  image: {
    type: String, // Base64 encoded image for main category
    default: null,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow null/empty
        // Check if it's a valid base64 image string
        return /^data:image\/(jpeg|jpg|png|gif|webp);base64,/.test(v);
      },
      message: "Image must be a valid base64 encoded image (jpeg, jpg, png, gif, webp)"
    }
  },
  subcategories: {
    type: [subcategorySchema],
    default: [],
    validate: [
      (arr) => arr.length >= 0 && arr.length <= 15,
      "Must have 0 to 15 subcategories"
    ]
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true // Add createdAt and updatedAt
});

// Index for better performance
categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1 });

module.exports = mongoose.model("Category", categorySchema);
