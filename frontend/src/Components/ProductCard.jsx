import React, { useState } from "react";
import { FaPlus, FaMinus, FaShoppingCart } from "react-icons/fa";

const ProductCard = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);

    // Create cart item
    const cartItem = {
      _id: product._id,
      name: product.name,
      quantity: quantity,
      price: product.price,
      image: product.images?.[0] || null
    };

    // Get existing cart or create empty array
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");

    // Find if item already exists
    const existingIndex = cart.findIndex(item => item._id === product._id);

    if (existingIndex >= 0) {
      // Update existing item quantity
      cart[existingIndex].quantity += quantity;
    } else {
      // Add new item
      cart.push(cartItem);
    }

    // Save to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    // Update cart count in navbar
    updateCartCount();

    // Show success message
    alert(`${product.name} added to cart!`);

    // Reset quantity
    setQuantity(1);

    // Reset adding state
    setTimeout(() => {
      setIsAdding(false);
    }, 500);
  };

  // Function to update cart count
  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

    // Dispatch custom event to update navbar
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: totalItems }));
  };

  const imageUrl =
    product.images?.[0]?.startsWith("data:image")
      ? product.images[0]
      : `data:image/jpeg;base64,${product.images?.[0]}`;

  const finalPrice = product.price - (product.price * (product.discount || 0)) / 100;

  return (
    <div className="bg-white shadow rounded-lg p-4 hover:shadow-md transition w-full min-w-[220px] max-w-[250px] flex flex-col justify-between relative">
      {/* Discount badge */}
      {product.discount > 0 && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
          {product.discount}% OFF
        </div>
      )}

      <img
        src={imageUrl}
        alt={product.name}
        className="w-full h-40 object-contain mb-2"
        onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
      />

      <h3 className="text-sm font-semibold text-gray-800 mb-1">{product.name}</h3>

      {/* Price Display */}
      <div className="mb-2">
        <div className="text-lg font-bold text-green-600">
          AED {finalPrice.toFixed(2)}
        </div>

        {product.discount > 0 && (
          <div className="text-sm text-gray-400 line-through">
            AED {product.price.toFixed(2)}
          </div>
        )}

        {product.unit && (
          <div className="mt-1 text-sm text-gray-600">
            {product.unit}
            {product.remarks && <span className="text-xs"> ~{product.remarks}</span>}
          </div>
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center justify-center mb-3 bg-gray-50 rounded-lg p-2">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="bg-white border border-gray-300 p-1 rounded-full hover:bg-gray-100 transition-colors"
          disabled={quantity <= 1}
        >
          <FaMinus className="text-xs text-gray-600" />
        </button>
        <span className="mx-4 font-semibold text-lg min-w-[30px] text-center">{quantity}</span>
        <button
          onClick={() => setQuantity((q) => Math.min(10, q + 1))}
          className="bg-white border border-gray-300 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <FaPlus className="text-xs text-gray-600" />
        </button>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={isAdding}
        className={`mt-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
          isAdding
            ? 'bg-green-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 hover:shadow-md'
        } text-white`}
      >
        <FaShoppingCart className="text-sm" />
        {isAdding ? 'Adding...' : 'Add to Cart'}
      </button>
    </div>
  );
};

export default ProductCard;
