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
  FaChevronRight,
  FaChevronDown,
  FaImage,
} from "react-icons/fa";

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [showMegaMenu, setShowMegaMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState(null);
  const [showCategoriesModal, setShowCategoriesModal] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchCategories(), fetchProducts()]);
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
      console.error("Error fetching categories:", error);
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
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    }
  };



  const getProductsBySubcategory = (subcategoryName) =>
    products.filter(
      (product) =>
        product.subcategory?.toLowerCase() === subcategoryName?.toLowerCase()
    );

  const getProductsByCategory = (categoryName) =>
    products.filter(
      (product) =>
        product.category?.toLowerCase() === categoryName?.toLowerCase()
    );

  // Handle category selection from navbar
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);

    // Scroll to products section
    setTimeout(() => {
      const productsSection = document.getElementById("products-section");
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  // Handle subcategory selection from navbar
  const handleSubcategorySelect = (category, subcategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);

    // Scroll to products section
    setTimeout(() => {
      const productsSection = document.getElementById("products-section");
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <NavBar />
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-16">
              <div className="loading-spinner w-8 h-8"></div>
            </div>
          </div>
        </div>
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
    <div className="relative">
      {/* Sticky Top Nav */}
      <div className="sticky top-0 z-50 bg-white shadow-md">
        <NavBar />

        {/* Category Mega Menu */}
        <div
          className="relative bg-white border-t border-green-400"
          onMouseLeave={() => {
            setHoveredCategoryIndex(null);
            setShowCategoriesModal(false);
          }}
        >
          <div className="flex justify-start px-4 space-x-6 py-3 overflow-x-auto text-sm font-semibold text-gray-800">
            {categories.map((cat, index) => (
              <div
                key={cat._id}
                className="relative group"
                onMouseEnter={() => {
                  setHoveredCategoryIndex(index);
                  setShowCategoriesModal(true);
                }}
              >
                <button
                  onClick={() => handleCategorySelect(cat)}
                  className="hover:text-green-600 whitespace-nowrap px-2 py-1 transition-colors"
                >
                  {cat.name}
                  {cat.subcategories?.length > 0 && (
                    <span className="ml-1 text-xs">▾</span>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Mega Dropdown Modal */}
          {showCategoriesModal &&
            hoveredCategoryIndex !== null &&
            categories[hoveredCategoryIndex]?.subcategories?.length > 0 && (
              <div className="absolute w-full left-0 bg-gray-50 border-t border-green-300 shadow-lg z-40">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-6 max-h-72 overflow-y-auto">
                  {categories[hoveredCategoryIndex].subcategories.map(
                    (subcat, subIndex) => {
                      const subcatName =
                        typeof subcat === "string" ? subcat : subcat.name;
                      const subcatImage =
                        typeof subcat === "object" ? subcat.image : "";

                      return (
                        <button
                          key={subIndex}
                          onClick={() =>
                            handleSubcategorySelect(
                              categories[hoveredCategoryIndex],
                              subcat
                            )
                          }
                          className="flex flex-col items-center justify-center text-center bg-white rounded-lg shadow hover:shadow-md hover:bg-green-50 cursor-pointer p-4 transition-all duration-200 group"
                        >
                          {subcatImage && (
                            <img
                              src={subcatImage}
                              alt={subcatName}
                              className="w-8 h-8 object-cover rounded-lg border border-gray-200 mb-2"
                            />
                          )}
                          <span className="text-sm text-gray-700 font-medium group-hover:text-green-600">
                            {subcatName}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            {getProductsBySubcategory(subcatName).length} items
                          </span>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}
        </div>
      </div>



      {/* Hero Section */}
      <div className="px-4 py-8">
        <HeroSlider />
      </div>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: FaShippingFast,
                title: "Free Delivery",
                desc: "On orders over AED 100",
                color: "text-blue-600",
              },
              {
                icon: FaShieldAlt,
                title: "Quality Guarantee",
                desc: "100% fresh products",
                color: "text-green-600",
              },
              {
                icon: FaHeadset,
                title: "24/7 Support",
                desc: "Always here to help",
                color: "text-purple-600",
              },
              {
                icon: FaLeaf,
                title: "Organic Certified",
                desc: "Naturally grown",
                color: "text-emerald-600",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="card p-6 text-center card-hover animate-fade-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-4">
                  <item.icon
                    className={`text-4xl ${item.color} mx-auto group-hover:scale-110 transition-transform duration-200`}
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
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
                  document
                    .getElementById("products-section")
                    .scrollIntoView({ behavior: "smooth" });
                }}
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <FaLeaf className="text-2xl text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>
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
              onClick={() => toast.info("View all products page coming soon!")}
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
              onClick={() => toast.info("View all products page coming soon!")}
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
                  {selectedSubcategory
                    ? `${selectedSubcategory.name} Products`
                    : `${selectedCategory.name} Products`
                  }
                </h2>
                <p className="text-xl text-gray-600">
                  {selectedSubcategory
                    ? `Explore our ${selectedSubcategory.name.toLowerCase()} collection`
                    : `Discover our ${selectedCategory.name.toLowerCase()} collection`
                  }
                </p>
                {selectedSubcategory && (
                  <button
                    onClick={() => setSelectedSubcategory(null)}
                    className="mt-4 text-green-600 hover:text-green-700 text-sm font-medium flex items-center justify-center mx-auto"
                  >
                    ← Back to all {selectedCategory.name} products
                  </button>
                )}
              </div>

              {selectedSubcategory ? (
                // Show products for specific subcategory
                <div>
                  {(() => {
                    const filteredProducts = getProductsBySubcategory(selectedSubcategory.name);
                    if (filteredProducts.length === 0) {
                      return (
                        <div className="text-center py-16">
                          <FaGift className="text-6xl text-gray-300 mx-auto mb-6" />
                          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                            No Products Found
                          </h3>
                          <p className="text-gray-600 mb-8">
                            We don't have any products in {selectedSubcategory.name} yet.
                          </p>
                          <button
                            onClick={() => setSelectedSubcategory(null)}
                            className="btn btn-secondary"
                          >
                            Browse Other Subcategories
                          </button>
                        </div>
                      );
                    }

                    return (
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
                    );
                  })()}
                </div>
              ) : (
                // Show all subcategories for the selected category
                <div>
                  {selectedCategory.subcategories?.map((subcat, index) => {
                    const subcategoryName = typeof subcat === 'string' ? subcat : subcat.name;
                    const filteredProducts = getProductsBySubcategory(subcategoryName);
                    if (filteredProducts.length === 0) return null;

                    return (
                      <div key={index} className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                          <button
                            onClick={() => setSelectedSubcategory(subcat)}
                            className="flex items-center space-x-3 group hover:bg-green-50 p-2 rounded-lg transition-colors"
                          >
                            {typeof subcat === 'object' && subcat.image ? (
                              <img
                                src={subcat.image}
                                alt={subcat.name}
                                className="w-8 h-8 rounded-lg object-cover"
                              />
                            ) : (
                              <FaTag className="text-green-600" />
                            )}
                            <h3 className="text-2xl font-semibold text-gray-900 group-hover:text-green-700">
                              {subcategoryName}
                            </h3>
                            <FaChevronRight className="text-green-600 group-hover:translate-x-1 transition-transform" />
                          </button>
                          <span className="text-sm text-gray-500">
                            {filteredProducts.length} products
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {filteredProducts.slice(0, 4).map((product, productIndex) => (
                            <div
                              key={product._id}
                              className="animate-fade-in"
                              style={{ animationDelay: `${productIndex * 0.05}s` }}
                            >
                              <ProductCard product={product} />
                            </div>
                          ))}
                        </div>

                        {filteredProducts.length > 4 && (
                          <div className="text-center mt-6">
                            <button
                              onClick={() => setSelectedSubcategory(subcat)}
                              className="btn btn-secondary"
                            >
                              View all {filteredProducts.length} {subcategoryName} products
                              <FaArrowRight className="ml-2" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <FaGift className="text-6xl text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Select a Category
              </h3>
              <p className="text-gray-600 mb-8">
                Choose a category from the navigation above to explore our products
              </p>
              <button
                className="btn btn-primary"
                onClick={() =>
                  document
                    .getElementById("featured-products")
                    .scrollIntoView({ behavior: "smooth" })
                }
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
              Get the latest updates on new products, special offers, and
              seasonal deals
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-300 focus:outline-none"
              />
              <button
                className="btn btn-secondary"
                onClick={() =>
                  toast.success("Newsletter subscription coming soon!")
                }
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
