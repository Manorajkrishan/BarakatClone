import React, { useEffect, useState } from "react";
import api from "../../../Axios/api";
import { Dialog } from "@headlessui/react";
import { PlusIcon, TrashIcon, PencilIcon, EyeIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: "", subcategories: [""] });
  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewCategory, setViewCategory] = useState(null);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
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
      setForm({
        name: category.name || "",
        subcategories: Array.isArray(category.subcategories)
          ? category.subcategories
          : [""],
      });
    } else {
      setEditingId(null);
      setForm({ name: "", subcategories: [""] });
    }
    setIsModalOpen(true);
  };

  const handleFormChange = (e, idx = null) => {
    if (e.target.name === "name") {
      setForm({ ...form, name: e.target.value });
    } else {
      const updated = [...form.subcategories];
      updated[idx] = e.target.value;
      setForm({ ...form, subcategories: updated });
    }
  };

  const addSubcategory = () => {
    if (form.subcategories.length < 10) {
      setForm({ ...form, subcategories: [...form.subcategories, ""] });
    }
  };

  const removeSubcategory = (index) => {
    const updated = form.subcategories.filter((_, idx) => idx !== index);
    setForm({ ...form, subcategories: updated });
  };

  const handleSubmit = async () => {
    try {
      const trimmedSubcategories = form.subcategories
        .map((s) => s.trim())
        .filter(Boolean);
      const payload = {
        name: form.name.trim(),
        subcategories: trimmedSubcategories,
      };

      if (!payload.name) {
        toast.error("Category name is required");
        return;
      }

      if (
        !Array.isArray(payload.subcategories) ||
        payload.subcategories.length < 1 ||
        payload.subcategories.length > 10
      ) {
        toast.error("Subcategories must be between 1 and 10");
        return;
      }

      if (editingId) {
        await api.put(`/categories/${editingId}`, payload);
        toast.success("Category updated");
      } else {
        await api.post("/categories", payload);
        toast.success("Category created");
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
      toast.success("Category deleted");
      fetchCategories();
    } catch (err) {
      toast.error("Failed to delete category");
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
              <th className="p-3">Name</th>
              <th className="p-3">Subcategories</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, index) => (
              <tr key={cat._id || index} className="border-t hover:bg-gray-50">
                <td className="p-3">{index + 1}</td>
                <td className="p-3 font-semibold">{cat.name}</td>
                <td className="p-3">{Array.isArray(cat.subcategories) ? cat.subcategories.join(", ") : "N/A"}</td>
                <td className="p-3 space-x-2">
                  <button onClick={() => setViewCategory(cat)} className="text-blue-600">
                    <EyeIcon className="w-5 h-5 inline" />
                  </button>
                  <button onClick={() => openModal(cat)} className="text-green-600">
                    <PencilIcon className="w-5 h-5 inline" />
                  </button>
                  <button onClick={() => handleDelete(cat._id)} className="text-red-600">
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
          <Dialog.Panel className="bg-white rounded shadow-lg w-full max-w-lg p-6">
            <Dialog.Title className="text-xl font-bold mb-4">
              {editingId ? "Edit Category" : "Add Category"}
            </Dialog.Title>

            <div className="mb-4">
              <label className="block font-medium mb-1">Category Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Subcategories</label>
              {Array.isArray(form.subcategories) &&
                form.subcategories.map((sub, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={sub}
                      onChange={(e) => handleFormChange(e, idx)}
                      className="flex-1 border px-3 py-2 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeSubcategory(idx)}
                      className="bg-red-500 text-white px-2 rounded"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              {form.subcategories.length < 10 && (
                <button
                  type="button"
                  onClick={addSubcategory}
                  className="text-blue-600 hover:underline mt-2"
                >
                  + Add Subcategory
                </button>
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {editingId ? "Update" : "Create"}
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* View Modal */}
      <Dialog open={!!viewCategory} onClose={() => setViewCategory(null)} className="fixed z-10 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Panel className="bg-white rounded shadow-lg w-full max-w-md p-6">
            <Dialog.Title className="text-xl font-bold mb-4">Category Details</Dialog.Title>
            <p><strong>Name:</strong> {viewCategory?.name || "N/A"}</p>
            <p className="mt-2">
              <strong>Subcategories:</strong><br />
              {Array.isArray(viewCategory?.subcategories) &&
                viewCategory.subcategories.map((s, i) => (
                  <span
                    key={i}
                    className="inline-block bg-gray-200 text-sm px-2 py-1 rounded mr-1 mt-1"
                  >
                    {s}
                  </span>
                ))}
            </p>
            <div className="mt-6 text-right">
              <button onClick={() => setViewCategory(null)} className="px-4 py-2 border rounded">
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
