const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Category name is required"],
    unique: true,
    trim: true,
  },
  subcategories: {
    type: [String],
    default: [], // ✅ ensures the field exists
    validate: [
      (arr) => arr.length >= 0 && arr.length <= 10,
      "Must have 1 to 10 subcategories"
    ]
  }
});

module.exports = mongoose.model("Category", categorySchema);
