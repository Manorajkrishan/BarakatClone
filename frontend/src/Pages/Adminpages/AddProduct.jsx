import React, { useEffect, useState } from "react";
import api from "../../../Axios/api";
import { toast } from "react-toastify";

const ProductInventory = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    quantity: "",
    price: "",
    offer: "",
    description: "",
    subcategoryId: "",
  });
  const [base64Images, setBase64Images] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState("");

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch {
      toast.error("Failed to load products");
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  const getSubcategories = () => {
    const selectedCategory = categories.find(cat => cat._id === selectedMainCategory);
    return selectedCategory?.subcategories || [];
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleMainCategoryChange = (e) => {
    const mainCatId = e.target.value;
    setSelectedMainCategory(mainCatId);
    setForm({ ...form, subcategoryId: "" });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    const readers = files.map(file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }));

    Promise.all(readers)
      .then(setBase64Images)
      .catch(() => toast.error("Image processing error"));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    const payload = { ...form, mainCategoryId: selectedMainCategory, images: base64Images };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
        toast.success("Product updated");
      } else {
        await api.post("/products", payload);
        toast.success("Product added");
      }
      fetchProducts();
      handleCancel();
    } catch {
      toast.error("Error saving product");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      quantity: product.quantity,
      price: product.price,
      offer: product.offer,
      description: product.description,
      subcategoryId: product.subcategory,
    });
    setSelectedMainCategory(product.mainCategoryId);
    setBase64Images(product.images);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      fetchProducts();
    } catch {
      toast.error("Error deleting product");
    }
  };

  const handleCancel = () => {
    setForm({ name: "", quantity: "", price: "", offer: "", description: "", subcategoryId: "" });
    setSelectedMainCategory("");
    setBase64Images([]);
    setEditingProduct(null);
    setShowForm(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Product Inventory</h2>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded">Add Product</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow space-y-4 mb-6">
          <select value={selectedMainCategory} onChange={handleMainCategoryChange} className="w-full border p-2" required>
            <option value="">Select Main Category</option>
            {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
          </select>

          <select name="subcategoryId" value={form.subcategoryId} onChange={handleChange} className="w-full border p-2" required>
            <option value="">Select Subcategory</option>
            {getSubcategories().map((sub, idx) => {
              const subcategoryName = typeof sub === 'string' ? sub : sub.name;
              return <option key={idx} value={subcategoryName}>{subcategoryName}</option>;
            })}
          </select>

          <input type="text" name="name" placeholder="Product Name" value={form.name} onChange={handleChange} className="w-full border p-2" required />
          <input type="number" name="price" placeholder="Price" value={form.price} onChange={handleChange} className="w-full border p-2" required />
          <input type="number" name="quantity" placeholder="Quantity" value={form.quantity} onChange={handleChange} className="w-full border p-2" required />
          <input type="text" name="offer" placeholder="Offer (optional)" value={form.offer} onChange={handleChange} className="w-full border p-2" />
          <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} className="w-full border p-2" required />

          <input type="file" accept="image/*" multiple onChange={handleImageChange} className="w-full" />

          <div className="flex gap-2 mt-2">
            {base64Images.map((img, i) => <img key={i} src={img} alt="preview" className="w-20 h-20 object-cover border" />)}
          </div>

          <div className="flex gap-3 mt-4">
            <button type="submit" disabled={loading} className="bg-green-600 text-white px-4 py-2 rounded">
              {loading ? "Saving..." : editingProduct ? "Update" : "Add"} Product
            </button>
            <button type="button" onClick={handleCancel} className="bg-gray-400 text-white px-4 py-2 rounded">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <div key={product._id} className="border p-4 rounded shadow">
            <img src={product.images[0]} alt={product.name} className="w-full h-40 object-cover rounded" />
            <h3 className="text-lg font-bold mt-2">{product.name}</h3>
            <p>Rs. {product.price}</p>
            <p>Qty: {product.quantity}</p>
            <p className="text-sm text-gray-600">{product.offer}</p>
            <p className="text-sm">{product.description}</p>
            <div className="flex gap-3 mt-3">
              <button onClick={() => handleEdit(product)} className="bg-yellow-500 text-white px-3 py-1 rounded">Edit</button>
              <button onClick={() => handleDelete(product._id)} className="bg-red-600 text-white px-3 py-1 rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductInventory;
