import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-green-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">
          BarakatFresh
        </Link>
        <div className="flex space-x-4">
          {/* Existing Tabs */}
          <Link
            to="/products"
            className="text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            Products
          </Link>
          <Link
            to="/about"
            className="text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            About Us
          </Link>
          <Link
            to="/contact"
            className="text-white px-4 py-2 rounded hover:bg-green-600 transition"
          >
            Contact
          </Link>

          {/* New Login and Register Tabs */}
          <Link
            to="/login"
            className="text-white px-4 py-2 rounded bg-green-600 hover:bg-green-700 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="text-white px-4 py-2 rounded bg-green-600 hover:bg-green-700 transition"
          >
            Register
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
