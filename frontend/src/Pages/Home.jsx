import React from "react";

const HomePage = () => {
  return (
    <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to BarakatFresh</h1>
      <p className="text-lg text-gray-600 mb-6 text-center">
        Explore our range of fresh fruits, vegetables, and organic products delivered straight to your door!
      </p>
      <a
        href="/products"
        className="bg-green-500 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-green-600 transition"
      >
        Shop Now
      </a>
    </div>
  );
};

export default HomePage;
