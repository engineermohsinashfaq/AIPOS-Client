import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddIcon from "@mui/icons-material/Add";

const emptyProduct = {
  productId: "",
  name: "",
  category: "",
  company: "",
  price: "",
  quantity: "",
  supplier: "",
  description: "",
  total: "",
};

// ✅ Auto-generate Product ID like P-001, P-002, etc.
const generateProductId = () => {
  let lastId = Number(localStorage.getItem("lastProductId") || 0);
  if (lastId < 1) lastId = 1;
  else lastId += 1;
  localStorage.setItem("lastProductId", lastId);
  return `P-${String(lastId).padStart(3, "0")}`;
};

export default function AddProduct({ onSave }) {
  const [product, setProduct] = useState(emptyProduct);

  // ✅ Auto-generate Product ID on load
  useEffect(() => {
    setProduct((prev) => ({ ...prev, productId: generateProductId() }));
  }, []);

  // ✅ Recalculate total automatically (price × quantity)
  useEffect(() => {
    const price = parseFloat(product.price) || 0;
    const qty = parseInt(product.quantity) || 0;
    const total = (price * qty).toFixed(2);
    setProduct((prev) => ({ ...prev, total }));
  }, [product.price, product.quantity]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ Price – only allow numbers and decimals
    if (name === "price") {
      const val = value.replace(/[^\d.]/g, "");
      setProduct((prev) => ({ ...prev, [name]: val }));
      return;
    }

    // ✅ Quantity – only allow integers
    if (name === "quantity") {
      const val = value.replace(/\D/g, "");
      setProduct((prev) => ({ ...prev, [name]: val }));
      return;
    }

    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Full Form Validation using Toastify
    if (!/^P-\d+$/.test(product.productId))
      return toast.error("Invalid Product ID format");
    if (!product.name.trim()) return toast.error("Product Name is required");
    if (!product.category.trim()) return toast.error("Category is required");
    if (!product.company.trim()) return toast.error("Company is required");
    if (!product.price || isNaN(product.price) || parseFloat(product.price) <= 0)
      return toast.error("Valid Price is required");
    if (
      !product.quantity ||
      isNaN(product.quantity) ||
      parseInt(product.quantity) <= 0
    )
      return toast.error("Valid Quantity is required");
    if (!product.supplier.trim()) return toast.error("Supplier is required");
    if (!product.description.trim())
      return toast.error("Description is required");

    // ✅ Success toast (reload after toast closes)
    toast.success("Product added successfully!", {
      onClose: () => {
        window.location.reload(); // 🔁 Reload form after toast closes
      },autoClose: 2000,
    });

    // ✅ Print all data with date & time
    const timestamp = new Date().toLocaleString();
    console.log("✅ Product saved successfully at:", timestamp);
    console.table({
      ...product,
      Saved_On: timestamp,
    });

    // ✅ Save callback
    onSave(product);
  };

  return (
    <div className="px-4 py-2">
      <ToastContainer />
      <div className="max-w-6xl mx-auto space-y-3">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Add Product</h1>
          <p className="text-white/80">
            Fill in the product details below and save.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 text-white shadow-lg mt-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product ID + Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="productId"
                value={product.productId}
                readOnly
                className="w-full p-3 rounded-md bg-black/40 border border-white/30 text-white outline-none cursor-not-allowed"
              />
              <input
                type="text"
                name="name"
                placeholder="Product Name"
                value={product.name}
                onChange={handleChange}
                className="w-full p-3 rounded-md bg-black/30 border border-white/20 placeholder-white/80 text-white outline-none"
              />
            </div>

            {/* Category + Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="category"
                placeholder="Category"
                value={product.category}
                onChange={handleChange}
                className="w-full p-3 rounded-md bg-black/30 border border-white/20 placeholder-white/80 text-white outline-none"
              />
              <input
                type="text"
                name="company"
                placeholder="Company"
                value={product.company}
                onChange={handleChange}
                className="w-full p-3 rounded-md bg-black/30 border border-white/20 placeholder-white/80 text-white outline-none"
              />
            </div>

            {/* Price + Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="price"
                placeholder="Price"
                value={product.price}
                onChange={handleChange}
                className="w-full p-3 rounded-md bg-black/30 border border-white/20 placeholder-white/80 text-white outline-none"
              />
              <input
                type="text"
                name="quantity"
                placeholder="Quantity"
                value={product.quantity}
                onChange={handleChange}
                className="w-full p-3 rounded-md bg-black/30 border border-white/20 placeholder-white/80 text-white outline-none"
              />
            </div>

            {/* Supplier */}
            <input
              type="text"
              name="supplier"
              placeholder="Supplier"
              value={product.supplier}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-black/30 border border-white/20 placeholder-white/80 text-white outline-none"
            />

            {/* Description */}
            <textarea
              name="description"
              placeholder="Description"
              value={product.description}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 rounded-md bg-black/30 border border-white/20 placeholder-white/80 text-white outline-none"
            />

            {/* Total Display */}
            <div className="flex justify-between items-center mt-2 border-t border-white/20 pt-4">
              <span className="text-lg font-bold text-white">Total Price:</span>
              <span className="text-lg font-bold text-white">
                Rs: {product.total || "0.00"}/-
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-md bg-cyan-800/80 hover:bg-cyan-900 transition cursor-pointer font-semibold flex justify-center items-center gap-2 mt-4"
            >
              <AddIcon />
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
