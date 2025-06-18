import React, { useEffect, useState } from "react";
import api from "../../Axios/api"; // Adjust this path as needed

const CategoryNavBar = () => {
  const [categories, setCategories] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/categories"); // Must return main categories with subcategories
        setCategories(res.data);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="relative bg-white shadow-sm border-t border-green-400 z-50">
      <div className="flex justify-start px-4 space-x-6 py-3 overflow-x-auto text-sm font-semibold text-gray-800 scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-gray-100">
        {categories.map((cat, index) => (
          <div
            key={cat.id}
            className="relative group"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Main Category Button */}
            <button className="hover:text-green-600 whitespace-nowrap px-2 py-1">
              {cat.name}
              {cat.subcategories?.length > 0 && (
                <span className="ml-1 text-xs">▾</span>
              )}
            </button>

            {/* Subcategory Dropdown - ABOVE the navbar */}
            {hoveredIndex === index && cat.subcategories?.length > 0 && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 max-h-64 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg z-50">
                <ul className="py-2">
                  {cat.subcategories.map((subcat, subIndex) => (
                    <li
                      key={subIndex}
                      className="px-4 py-2 hover:bg-green-100 text-sm text-gray-700 cursor-pointer whitespace-nowrap"
                    >
                      {subcat}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryNavBar;
