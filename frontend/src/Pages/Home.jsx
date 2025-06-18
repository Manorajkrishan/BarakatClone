import React, { useEffect, useState } from "react";
import NavBar from "../Components/Nav";
import HeroSlider from "../Components/HeroSlider";
import api from "../../Axios/api";
import { toast } from "react-toastify";
import ProductCard from "../Components/ProductCard";
import {
  FaLeaf,
  FaShippingFast,
  FaShieldAlt,
  FaHeadset,
  FaStar,
  FaArrowRight,
  FaTag,
  FaFire,
  FaGift,
  FaChevronRight
} from "react-icons/fa";

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchCategories(),
          fetchProducts()
        ]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error("Failed to load categories");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
      // Set featured products (first 8 products for demo)
      setFeaturedProducts(res.data.slice(0, 8));
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error("Failed to load products");
    }
  };

  const getProductsBySubcategory = (subcategoryName) =>
    products.filter(
      (product) =>
        product.subcategory?.toLowerCase() === subcategoryName?.toLowerCase()
    );



  if (loading) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="loading-spinner w-12 h-12 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading amazing products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <NavBar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="gradient-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-white animate-slide-in-left">
                <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Fresh Products
                  <br />
                  <span className="text-green-200">Delivered Daily</span>
                </h1>
                <p className="text-xl mb-8 text-green-100 leading-relaxed">
                  Discover the finest selection of fresh, organic products delivered straight to your doorstep.
                  Quality you can trust, freshness you can taste.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    className="btn btn-secondary btn-lg group"
                    onClick={() => document.getElementById('featured-products').scrollIntoView({ behavior: 'smooth' })}
                  >
                    Shop Now
                    <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    className="btn btn-ghost btn-lg text-white border-white hover:bg-white hover:text-green-600"
                    onClick={() => toast.info('Learn more section coming soon!')}
                  >
                    Learn More
                  </button>
                </div>
              </div>

              <div className="relative animate-slide-in-right">
                <div className="relative z-10">
                  <img
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Fresh Products"
                    className="rounded-2xl shadow-2xl"
                  />
                </div>
                <div className="absolute -top-4 -right-4 w-72 h-72 bg-green-400 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-4 -left-4 w-48 h-48 bg-green-300 rounded-full opacity-30 animate-bounce"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Stats */}
        <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: FaShippingFast, title: "Free Delivery", desc: "On orders over AED 100" },
                { icon: FaShieldAlt, title: "Quality Guarantee", desc: "100% fresh products" },
                { icon: FaHeadset, title: "24/7 Support", desc: "Always here to help" },
                { icon: FaLeaf, title: "Organic Certified", desc: "Naturally grown" }
              ].map((item, index) => (
                <div key={index} className="card p-6 text-center card-hover animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <item.icon className="text-3xl text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Spacer for floating stats */}
      <div className="h-32"></div>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our wide range of fresh products organized by categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div
                key={category._id}
                className="card p-6 text-center card-hover cursor-pointer group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => {
                  setSelectedCategory(category);
                  document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <FaLeaf className="text-2xl text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {category.subcategories?.length || 0} subcategories
                </p>
                <div className="flex items-center justify-center text-green-600 group-hover:text-green-700">
                  <span className="text-sm font-medium">Explore</span>
                  <FaChevronRight className="ml-1 text-xs group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="featured-products" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                <FaFire className="inline text-orange-500 mr-3" />
                Featured Products
              </h2>
              <p className="text-xl text-gray-600">
                Handpicked products that our customers love the most
              </p>
            </div>
            <button
              className="btn btn-secondary hidden md:flex"
              onClick={() => toast.info('View all products page coming soon!')}
            >
              View All
              <FaArrowRight className="ml-2" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <div
                key={product._id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <button
              className="btn btn-secondary"
              onClick={() => toast.info('View all products page coming soon!')}
            >
              View All Products
              <FaArrowRight className="ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Products by Category Section */}
      <section id="products-section" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {selectedCategory ? (
            <div>
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  {selectedCategory.name} Products
                </h2>
                <p className="text-xl text-gray-600">
                  Discover our {selectedCategory.name.toLowerCase()} collection
                </p>
              </div>

              {selectedCategory.subcategories?.map((subcat, index) => {
                const filteredProducts = getProductsBySubcategory(subcat);
                if (filteredProducts.length === 0) return null;

                return (
                  <div key={index} className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-semibold text-gray-900 flex items-center">
                        <FaTag className="text-green-600 mr-3" />
                        {subcat}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {filteredProducts.length} products
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {filteredProducts.map((product, productIndex) => (
                        <div
                          key={product._id}
                          className="animate-fade-in"
                          style={{ animationDelay: `${productIndex * 0.05}s` }}
                        >
                          <ProductCard product={product} />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <FaGift className="text-6xl text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Select a Category
              </h3>
              <p className="text-gray-600 mb-8">
                Choose a category above to explore our products
              </p>
              <button
                className="btn btn-primary"
                onClick={() => document.getElementById('featured-products').scrollIntoView({ behavior: 'smooth' })}
              >
                View Featured Products
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 gradient-bg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-white">
            <h2 className="text-4xl font-bold mb-4">Stay Updated</h2>
            <p className="text-xl text-green-100 mb-8">
              Get the latest updates on new products, special offers, and seasonal deals
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-300 focus:outline-none"
              />
              <button
                className="btn btn-secondary"
                onClick={() => toast.success('Newsletter subscription coming soon!')}
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;