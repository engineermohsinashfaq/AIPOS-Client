import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";

const emptyProduct = {
  productId: "",
  name: "",
  model: "",
  category: "",
  company: "",
  price: "",
  sellPrice: "",
  quantity: "",
  supplier: "",
  supplierContact: "",
  total: "",
  value: "",
};

const generateProductId = () => {
  let lastId = Number(localStorage.getItem("lastProductId") || 0);
  lastId += 1;
  localStorage.setItem("lastProductId", lastId);
  return `PR-${String(lastId).padStart(3, "0")}`;
};

const loadProducts = () => {
  const stored = localStorage.getItem("products");
  return stored ? JSON.parse(stored) : [];
};

export default function AddPurchase({ onSave }) {
  const [product, setProduct] = useState(emptyProduct);
  const [products, setProducts] = useState(loadProducts());
  const navigate = useNavigate();

  useEffect(() => {
    setProduct((prev) => ({ ...prev, productId: generateProductId() }));
  }, []);

  useEffect(() => {
    const price = parseFloat(product.price) || 0;
    const qty = parseInt(product.quantity) || 0;
    const total = (price * qty).toFixed(2);
    setProduct((prev) => ({
      ...prev,
      total,
      value: total,
    }));
  }, [product.price, product.quantity]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "price" || name === "sellPrice") {
      const val = value.replace(/[^\d.]/g, "");
      setProduct((prev) => ({ ...prev, [name]: val }));
      return;
    }

    if (name === "quantity") {
      const val = value.replace(/\D/g, "");
      setProduct((prev) => ({ ...prev, [name]: val }));
      return;
    }

    if (name === "supplierContact") {
      let digits = value.replace(/\D/g, "");
      if (digits.length > 15) digits = digits.slice(0, 15);
      setProduct((prev) => ({ ...prev, [name]: digits }));
      return;
    }

    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const toastOptions = { theme: "dark", autoClose: 2000 };

    if (!/^PR-\d+$/.test(product.productId))
      return toast.error("Invalid Product ID format", toastOptions);
    if (!product.name.trim())
      return toast.error("Name is required", toastOptions);
    if (!product.model.trim())
      return toast.error("Model is required", toastOptions);
    if (!product.category.trim())
      return toast.error("Category is required", toastOptions);
    if (!product.company.trim())
      return toast.error("Company is required", toastOptions);
    if (
      !product.price ||
      isNaN(product.price) ||
      parseFloat(product.price) <= 0
    )
      return toast.error("Valid Purchase Price is required", toastOptions);
    if (
      !product.sellPrice ||
      isNaN(product.sellPrice) ||
      parseFloat(product.sellPrice) <= 0
    )
      return toast.error("Valid Sell Price is required", toastOptions);
    if (
      !product.quantity ||
      isNaN(product.quantity) ||
      parseInt(product.quantity) <= 0
    )
      return toast.error("Valid Quantity is required", toastOptions);
    if (!product.supplier.trim())
      return toast.error("Supplier is required", toastOptions);

    const fullSupplierContact = "+" + product.supplierContact;
    if (!/^\+\d{7,15}$/.test(fullSupplierContact))
      return toast.error(
        "Supplier Contact must start with '+' followed by 7–15 digits",
        toastOptions
      );

    const modelExists = products.some(
      (p) => p.model?.toLowerCase() === product.model.toLowerCase()
    );
    if (modelExists) return toast.error("Model must be unique!", toastOptions);

    const timestamp = new Date().toLocaleString();
    const newProduct = {
      ...product,
      supplierContact: fullSupplierContact,
      savedOn: timestamp,
    };

    const updatedProducts = [...products, newProduct];
    localStorage.setItem("products", JSON.stringify(updatedProducts));
    setProducts(updatedProducts);

    toast.success("Product added successfully!", {
      ...toastOptions,
      onClose: () => navigate("/up-purchase-history"),
    });

    onSave?.(newProduct);
  };

  const handleClear = () => {
    setProduct({
      ...emptyProduct,
      productId: generateProductId(),
    });
    toast.info("Form cleared", { theme: "dark", autoClose: 1500 });
  };

  return (
    <div className="px-4 py-2 min-h-[100%]">
      <ToastContainer theme="dark" autoClose={2000} />
      <div className="w-8xl mx-auto space-y-3">
        <div>
          <h1 className="text-3xl font-bold text-white">Add Product</h1>
          <p className="text-white/80">
            Fill in the product details below and save.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-5 text-white shadow-lg mt-6">
          <form onSubmit={handleSubmit} className="space-y-2">
            {/* Product ID + Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="productId"
                  className="block mb-1 text-sm text-white/80"
                >
                  Product ID
                </label>
                <input
                  type="text"
                  id="productId"
                  name="productId"
                  value={product.productId}
                  readOnly
                  className="w-full p-3 rounded-md bg-black/40 border border-white/30 text-white outline-none cursor-not-allowed"
                />
              </div>
              <div>
                <label
                  htmlFor="name"
                  className="block mb-1 text-sm text-white/80"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter product name"
                  value={product.name}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                />
              </div>
            </div>

            {/* Model + Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="model"
                  className="block mb-1 text-sm text-white/80"
                >
                  Model
                </label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  placeholder="Enter model"
                  value={product.model}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="block mb-1 text-sm text-white/80"
                >
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  placeholder="Enter category"
                  value={product.category}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                />
              </div>
            </div>

            {/* Company + Purchase Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="company"
                  className="block mb-1 text-sm text-white/80"
                >
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  placeholder="Enter company name"
                  value={product.company}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="price"
                  className="block mb-1 text-sm text-white/80"
                >
                  Purchase Price
                </label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  placeholder="Enter purchase price"
                  value={product.price}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                />
              </div>
            </div>

            {/* Sell Price + Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="sellPrice"
                  className="block mb-1 text-sm text-white/80"
                >
                  Sell Price
                </label>
                <input
                  type="text"
                  id="sellPrice"
                  name="sellPrice"
                  placeholder="Enter sell price"
                  value={product.sellPrice}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="quantity"
                  className="block mb-1 text-sm text-white/80"
                >
                  Quantity
                </label>
                <input
                  type="text"
                  id="quantity"
                  name="quantity"
                  placeholder="Enter quantity"
                  value={product.quantity}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                />
              </div>
            </div>

            {/* Value + Supplier */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="value"
                  className="block mb-1 text-sm text-white/80"
                >
                  Value
                </label>
                <input
                  type="text"
                  id="value"
                  name="value"
                  value={product.value}
                  placeholder="0.0"
                  readOnly
                  className="w-full p-3 rounded-md bg-black/40 border border-white/30 text-white outline-none cursor-not-allowed"
                />
              </div>
              <div>
                <label
                  htmlFor="supplier"
                  className="block mb-1 text-sm text-white/80"
                >
                  Supplier
                </label>
                <input
                  type="text"
                  id="supplier"
                  name="supplier"
                  placeholder="Enter supplier name"
                  value={product.supplier}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                />
              </div>
            </div>

            {/* Supplier Contact */}
            <div>
              <label
                htmlFor="supplierContact"
                className="block mb-1 text-sm text-white/80"
              >
                Supplier Contact
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 select-none">
                  +
                </span>
                <input
                  type="text"
                  id="supplierContact"
                  name="supplierContact"
                  placeholder="923001234567"
                  value={product.supplierContact}
                  onChange={handleChange}
                  className="w-full pl-6 p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                />
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mt-4 border-t border-white/20 pt-4 ">
              <span className="text-lg font-bold text-white">Total Price:</span>
              <span className="text-lg font-bold text-white">
                Rs: {product.total || "0.00"}/-
              </span>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <button
                type="submit"
                className="w-full sm:w-1/2 py-3 rounded-md bg-cyan-800/80 hover:bg-cyan-900 transition cursor-pointer font-semibold flex justify-center items-center gap-2"
              >
                <AddIcon />
                Save
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="w-full sm:w-1/2 py-3 rounded-md bg-red-600 hover:bg-red-700 transition cursor-pointer font-semibold flex justify-center items-center gap-2"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
