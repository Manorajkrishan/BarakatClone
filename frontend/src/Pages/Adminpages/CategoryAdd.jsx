import React, { useEffect, useState } from "react";
import api from "../../../Axios/api";
import { Dialog } from "@headlessui/react";
import { PlusIcon, TrashIcon, PencilIcon, EyeIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    image: "",
    subcategories: [{ name: "", image: "" }],
    isActive: true
  });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewCategory, setViewCategory] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories?includeInactive=true");
      if (Array.isArray(res.data)) {
        setCategories(res.data);
      } else {
        throw new Error("Invalid category data received");
      }
    } catch (err) {
      toast.error("Failed to fetch categories");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openModal = (category = null) => {
    if (category) {
      setEditingId(category._id);

      // Process subcategories - handle both old string format and new object format
      const processedSubcategories = Array.isArray(category.subcategories)
        ? category.subcategories.map(sub =>
            typeof sub === 'string'
              ? { name: sub, image: "" }
              : { name: sub.name || "", image: sub.image || "" }
          )
        : [{ name: "", image: "" }];

      setForm({
        name: category.name || "",
        image: category.image || "",
        subcategories: processedSubcategories,
        isActive: category.isActive !== undefined ? category.isActive : true
      });
    } else {
      setEditingId(null);
      setForm({
        name: "",
        image: "",
        subcategories: [{ name: "", image: "" }],
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  // Helper function to convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Handle image upload for category or subcategory
  const handleImageUpload = async (e, type, idx = null) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size should be less than 2MB');
      return;
    }

    try {
      const base64 = await convertToBase64(file);

      if (type === 'category') {
        setForm({ ...form, image: base64 });
      } else if (type === 'subcategory' && idx !== null) {
        const updated = [...form.subcategories];
        updated[idx] = { ...updated[idx], image: base64 };
        setForm({ ...form, subcategories: updated });
      }

      toast.success('Image uploaded successfully');
    } catch (error) {
      toast.error('Failed to upload image');
      console.error(error);
    }
  };

  const handleFormChange = (e, idx = null, field = null) => {
    const { name, value, type, checked } = e.target;

    if (name === "name") {
      setForm({ ...form, name: value });
    } else if (name === "isActive") {
      setForm({ ...form, isActive: checked });
    } else if (field === "subcategory-name" && idx !== null) {
      const updated = [...form.subcategories];
      updated[idx] = { ...updated[idx], name: value };
      setForm({ ...form, subcategories: updated });
    }
  };

  const addSubcategory = () => {
    if (form.subcategories.length < 15) {
      setForm({ ...form, subcategories: [...form.subcategories, { name: "", image: "" }] });
    }
  };

  const removeSubcategory = (index) => {
    if (form.subcategories.length > 1) {
      const updated = form.subcategories.filter((_, idx) => idx !== index);
      setForm({ ...form, subcategories: updated });
    }
  };

  const removeImage = (type, idx = null) => {
    if (type === 'category') {
      setForm({ ...form, image: "" });
    } else if (type === 'subcategory' && idx !== null) {
      const updated = [...form.subcategories];
      updated[idx] = { ...updated[idx], image: "" };
      setForm({ ...form, subcategories: updated });
    }
  };

  const handleSubmit = async () => {
    try {
      // Process subcategories
      const processedSubcategories = form.subcategories
        .map((sub) => ({
          name: sub.name.trim(),
          image: sub.image || null
        }))
        .filter(sub => sub.name); // Remove empty subcategories

      const payload = {
        name: form.name.trim(),
        image: form.image || null,
        subcategories: processedSubcategories,
        isActive: form.isActive
      };

      if (!payload.name) {
        toast.error("Category name is required");
        return;
      }

      if (processedSubcategories.length > 15) {
        toast.error("Maximum 15 subcategories allowed");
        return;
      }

      if (editingId) {
        await api.put(`/categories/${editingId}`, payload);
        toast.success("Category updated successfully");
      } else {
        await api.post("/categories", payload);
        toast.success("Category created successfully");
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (err) {
      toast.error("Failed to delete category");
      console.error(err);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/categories/${id}/toggle-status`);
      toast.success(`Category ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchCategories();
    } catch (err) {
      toast.error("Failed to update category status");
      console.error(err);
    }
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Category Management</h2>
        <button
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => openModal()}
        >
          <PlusIcon className="w-5 h-5 mr-2" /> Add Category
        </button>
      </div>

      <div className="overflow-x-auto shadow border rounded">
        <table className="min-w-full text-sm text-left text-gray-600">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">#</th>
              <th className="p-3">Image</th>
              <th className="p-3">Name</th>
              <th className="p-3">Status</th>
              <th className="p-3">Subcategories</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, index) => (
              <tr key={cat._id || index} className={`border-t hover:bg-gray-50 ${!cat.isActive ? 'opacity-60' : ''}`}>
                <td className="p-3">{index + 1}</td>
                <td className="p-3">
                  {cat.image ? (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-10 h-10 rounded-lg object-cover border"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      <PhotoIcon className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </td>
                <td className="p-3 font-semibold">{cat.name}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    cat.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {cat.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3">
                  {Array.isArray(cat.subcategories) ? (
                    <div className="flex flex-wrap gap-1">
                      {cat.subcategories.slice(0, 3).map((sub, idx) => (
                        <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {typeof sub === 'string' ? sub : sub.name}
                        </span>
                      ))}
                      {cat.subcategories.length > 3 && (
                        <span className="text-gray-500 text-xs">
                          +{cat.subcategories.length - 3} more
                        </span>
                      )}
                    </div>
                  ) : "N/A"}
                </td>
                <td className="p-3 space-x-2">
                  <button
                    onClick={() => setViewCategory(cat)}
                    className="text-blue-600 hover:text-blue-800"
                    title="View Details"
                  >
                    <EyeIcon className="w-5 h-5 inline" />
                  </button>
                  <button
                    onClick={() => openModal(cat)}
                    className="text-green-600 hover:text-green-800"
                    title="Edit Category"
                  >
                    <PencilIcon className="w-5 h-5 inline" />
                  </button>
                  <button
                    onClick={() => toggleStatus(cat._id, cat.isActive)}
                    className={`${cat.isActive ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'}`}
                    title={cat.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {cat.isActive ? '⏸️' : '▶️'}
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id)}
                    className="text-red-600 hover:text-red-800"
                    title="Delete Category"
                  >
                    <TrashIcon className="w-5 h-5 inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} className="fixed z-10 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white rounded shadow-lg w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-xl font-bold mb-4">
              {editingId ? "Edit Category" : "Add Category"}
            </Dialog.Title>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div>
                <div className="mb-4">
                  <label className="block font-medium mb-1">Category Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    className="w-full border px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter category name"
                  />
                </div>

                <div className="mb-4">
                  <label className="block font-medium mb-1">Category Image</label>
                  <div className="space-y-2">
                    {form.image && (
                      <div className="relative inline-block">
                        <img
                          src={form.image}
                          alt="Category preview"
                          className="w-20 h-20 rounded-lg object-cover border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('category')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'category')}
                      className="w-full border px-3 py-2 rounded"
                    />
                    <p className="text-xs text-gray-500">Max size: 2MB. Formats: JPG, PNG, GIF, WebP</p>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleFormChange}
                      className="mr-2"
                    />
                    <span className="font-medium">Active Category</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Inactive categories won't appear in the navbar</p>
                </div>
              </div>

              {/* Right Column - Subcategories */}
              <div>
                <div className="mb-4">
                  <label className="block font-medium mb-1">Subcategories</label>
                  <div className="max-h-80 overflow-y-auto space-y-3">
                    {Array.isArray(form.subcategories) &&
                      form.subcategories.map((sub, idx) => (
                        <div key={idx} className="border rounded-lg p-3 bg-gray-50">
                          <div className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={sub.name}
                              onChange={(e) => handleFormChange(e, idx, 'subcategory-name')}
                              className="flex-1 border px-3 py-2 rounded"
                              placeholder="Subcategory name"
                            />
                            <button
                              type="button"
                              onClick={() => removeSubcategory(idx)}
                              className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                              disabled={form.subcategories.length === 1}
                            >
                              ✕
                            </button>
                          </div>

                          <div className="space-y-2">
                            {sub.image && (
                              <div className="relative inline-block">
                                <img
                                  src={sub.image}
                                  alt="Subcategory preview"
                                  className="w-16 h-16 rounded object-cover border"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage('subcategory', idx)}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, 'subcategory', idx)}
                              className="w-full border px-2 py-1 rounded text-sm"
                            />
                          </div>
                        </div>
                      ))}
                  </div>

                  {form.subcategories.length < 15 && (
                    <button
                      type="button"
                      onClick={addSubcategory}
                      className="mt-3 text-blue-600 hover:text-blue-800 font-medium flex items-center"
                    >
                      <PlusIcon className="w-4 h-4 mr-1" />
                      Add Subcategory
                    </button>
                  )}
                  <p className="text-xs text-gray-500 mt-2">Maximum 15 subcategories allowed</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {editingId ? "Update Category" : "Create Category"}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* View Modal */}
      <Dialog open={!!viewCategory} onClose={() => setViewCategory(null)} className="fixed z-10 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white rounded shadow-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <Dialog.Title className="text-xl font-bold mb-4">Category Details</Dialog.Title>

            <div className="space-y-4">
              <div>
                <strong className="block text-gray-700">Name:</strong>
                <p className="text-lg">{viewCategory?.name || "N/A"}</p>
              </div>

              <div>
                <strong className="block text-gray-700">Status:</strong>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  viewCategory?.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {viewCategory?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {viewCategory?.image && (
                <div>
                  <strong className="block text-gray-700 mb-2">Category Image:</strong>
                  <img
                    src={viewCategory.image}
                    alt={viewCategory.name}
                    className="w-24 h-24 rounded-lg object-cover border"
                  />
                </div>
              )}

              <div>
                <strong className="block text-gray-700 mb-2">Subcategories ({viewCategory?.subcategories?.length || 0}):</strong>
                {Array.isArray(viewCategory?.subcategories) && viewCategory.subcategories.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {viewCategory.subcategories.map((sub, i) => (
                      <div key={i} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center space-x-3">
                          {(typeof sub === 'object' && sub.image) ? (
                            <img
                              src={sub.image}
                              alt={sub.name}
                              className="w-12 h-12 rounded object-cover border"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                              <PhotoIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">
                              {typeof sub === 'string' ? sub : sub.name}
                            </p>
                            {typeof sub === 'object' && sub.image && (
                              <p className="text-xs text-gray-500">Has image</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No subcategories</p>
                )}
              </div>

              <div>
                <strong className="block text-gray-700">Created:</strong>
                <p className="text-sm text-gray-600">
                  {viewCategory?.createdAt
                    ? new Date(viewCategory.createdAt).toLocaleString()
                    : "N/A"
                  }
                </p>
              </div>

              <div>
                <strong className="block text-gray-700">Last Updated:</strong>
                <p className="text-sm text-gray-600">
                  {viewCategory?.updatedAt
                    ? new Date(viewCategory.updatedAt).toLocaleString()
                    : "N/A"
                  }
                </p>
              </div>
            </div>

            <div className="mt-6 text-right border-t pt-4">
              <button
                onClick={() => setViewCategory(null)}
                className="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
};

export default CategoryPage;
