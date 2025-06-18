import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../Axios/api";
import {
  FaChevronDown,
  FaImage,
  FaStore,
  FaArrowRight,
  FaLeaf,
  FaTags
} from "react-icons/fa";
import { toast } from "react-toastify";

const CategoryNavBar = ({ onCategorySelect, onSubcategorySelect }) => {
  const [categories, setCategories] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get("/categories?forNavbar=true");
      setCategories(res.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    if (onCategorySelect) {
      onCategorySelect(category);
    } else {
      // Default behavior - scroll to products section or navigate
      const productsSection = document.getElementById("products-section");
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleSubcategoryClick = (category, subcategory) => {
    if (onSubcategorySelect) {
      onSubcategorySelect(category, subcategory);
    } else {
      // Default behavior
      toast.info(`Showing products for ${subcategory.name}`);
    }
  };

  const handleMouseEnter = (index) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setHoveredIndex(null);
    }, 150); // Small delay to prevent flickering
    setHoverTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  if (loading) {
    return (
      <div className="bg-white shadow-sm border-t border-green-400 z-40">
        <div className="flex justify-center py-4">
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
            <span className="text-sm">Loading categories...</span>
          </div>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white shadow-sm border-t border-green-400 z-40">
        <div className="flex justify-center py-4">
          <div className="flex items-center space-x-2 text-gray-500">
            <FaStore className="text-lg" />
            <span className="text-sm">No categories available</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-navbar sticky top-16 bg-white shadow-sm border-t border-green-400 z-[100]">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-start px-4 space-x-1 py-3 overflow-x-auto scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-gray-100">
          {categories.map((category, index) => (
            <div
              key={category._id}
              className="category-item relative group flex-shrink-0"
              onMouseEnter={() => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              {/* Main Category Button */}
              <button
                onClick={() => handleCategoryClick(category)}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 whitespace-nowrap group"
              >
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <FaLeaf className="text-green-600" />
                )}
                <span>{category.name}</span>
                {category.subcategories?.length > 0 && (
                  <FaChevronDown className="text-xs transition-transform duration-200 group-hover:rotate-180" />
                )}
              </button>

              {/* Mega Menu Dropdown */}
              {hoveredIndex === index && category.subcategories?.length > 0 && (
                <div
                  className="category-dropdown"
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                    <div className="flex items-center space-x-2">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <FaTags className="text-green-600" />
                      )}
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {category.subcategories.length} items
                      </span>
                    </div>
                  </div>

                  {/* Subcategories Grid */}
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                      {category.subcategories.map((subcategory, subIndex) => (
                        <button
                          key={subIndex}
                          onClick={() => handleSubcategoryClick(category, subcategory)}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-green-50 hover:border-green-200 border border-transparent transition-all duration-200 text-left group"
                        >
                          <div className="flex-shrink-0">
                            {subcategory.image ? (
                              <img
                                src={subcategory.image}
                                alt={subcategory.name}
                                className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                                <FaImage className="text-green-600 text-sm" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate group-hover:text-green-700">
                              {subcategory.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              View products
                            </p>
                          </div>
                          <FaArrowRight className="text-xs text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all duration-200" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
                    <button
                      onClick={() => handleCategoryClick(category)}
                      className="w-full flex items-center justify-center space-x-2 text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      <span>View all {category.name} products</span>
                      <FaArrowRight className="text-xs" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryNavBar;
