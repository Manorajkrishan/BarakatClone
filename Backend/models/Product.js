const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
  },
  quantity: {
    type: Number,
    required: [true, "Product quantity is required"],
    min: 0,
  },
  price: {
    type: Number,
    required: [true, "Product price is required"],
    min: 0,
  },
  offer: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    required: [true, "Product description is required"],
  },
  mainCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  subcategory: {
    type: String,
    required: true,
  },
  images: {
    type: [String], // base64 strings
    required: true,
    validate: [(val) => val.length > 0, "At least one image is required"],
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("Product", productSchema);
