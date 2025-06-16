import React from "react";

const ProductsPage = () => {
  return (
    <div className="bg-gray-100 min-h-screen p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Our Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sample Product Cards */}
        <div className="border p-4 rounded-lg shadow-md bg-white">
          <h2 className="text-xl font-semibold">Fresh Apples</h2>
          <p className="text-gray-600">Crisp, sweet, and juicy apples straight from the orchard.</p>
          <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Buy Now
          </button>
        </div>
        <div className="border p-4 rounded-lg shadow-md bg-white">
          <h2 className="text-xl font-semibold">Organic Tomatoes</h2>
          <p className="text-gray-600">Ripe, organic tomatoes perfect for your recipes.</p>
          <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Buy Now
          </button>
        </div>
        {/* Add more products */}
      </div>
    </div>
  );
};

export default ProductsPage;
