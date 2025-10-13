import React, { useState, useEffect, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";

const sampleProducts = [
  {
    productId: "P-001",
    name: "Laptop",
    category: "Electronics",
    company: "Dell",
    price: 1200,
    quantity: 10,
    supplier: "Tech Supplier",
    description: "High-performance laptop",
  },
  {
    productId: "P-002",
    name: "Mouse",
    category: "Accessories",
    company: "Logitech",
    price: 20,
    quantity: 2,
    supplier: "Tech Supplier",
    description: "Wireless mouse",
  },
  {
    productId: "P-003",
    name: "Keyboard",
    category: "Accessories",
    company: "Logitech",
    price: 30,
    quantity: 0,
    supplier: "Tech Supplier",
    description: "Mechanical keyboard",
  },
];

export default function AllProducts() {
  const [products, setProducts] = useState(() => {
    try {
      const raw = localStorage.getItem("all_products_data");
      return raw ? JSON.parse(raw) : sampleProducts;
    } catch {
      return sampleProducts;
    }
  });

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    localStorage.setItem("all_products_data", JSON.stringify(products));
  }, [products]);

  // Stock status logic
  const getStatus = (quantity) => {
    if (quantity === 0) return "Out of Stock";
    if (quantity < 5) return "Low Stock";
    return "Complete";
  };

  const filteredProducts = useMemo(() => {
    let arr = products.map((p) => ({ ...p, status: getStatus(p.quantity) }));
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter(
        (p) =>
          p.productId.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "All") {
      arr = arr.filter((p) => p.status === statusFilter);
    }
    return arr;
  }, [products, query, statusFilter]);

  const handlePrint = () => {
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.print();
    document.body.style.overflow = bodyOverflow;
  };

  return (
    <div className="p-4 min-h-[95vh] text-white">
      <ToastContainer />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Heading */}
        <div>
          <h1 className="text-3xl font-bold mb-2">All Products</h1>
          <p className="text-white/80">View all products and their details.</p>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 bg-black/30 p-2 rounded max-w-[90%]">
            <SearchIcon />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ID or Name"
              className="bg-transparent outline-none text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <label>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 bg-black/30 border border-white/20 rounded text-white"
            >
              <option className="bg-black/90">All</option>
              <option className="bg-black/90">Low Stock</option>
              <option className="bg-black/90">Complete</option>
              <option className="bg-black/90">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
            <div
              key={p.productId}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 space-y-2"
            >
              <p><strong>ID:</strong> {p.productId}</p>
              <h2 className="text-xl font-bold">{p.name}</h2>
              <p><strong>Quantity:</strong> {p.quantity}</p>
              <p><strong>Value:</strong> Rs: {p.price * p.quantity}/-</p>
              <p><strong>Status:</strong> {p.status}</p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setSelectedProduct(p)}
                  className="p-2 rounded bg-blue-600 hover:bg-blue-500 hover:cursor-pointer"
                >
                  <VisibilityIcon fontSize="small" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ PRODUCT DETAILS MODAL (same modal style as Customers/Guarantors) */}
      {selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-50 p-2 sm:p-4">
          <div className="bg-white/10 border border-white/30 backdrop-blur-xl rounded-2xl w-full max-w-[95%] sm:max-w-[600px] h-[85vh] shadow-xl text-white relative flex flex-col print:w-full print:h-auto print:bg-white print:text-black print:overflow-visible">
            <button
              className="absolute top-3 right-3 hover:cursor-pointer print:hidden cursor-pointer"
              onClick={() => setSelectedProduct(null)}
            >
              <CloseIcon />
            </button>

            <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-4 scrollbar-hide print:p-5">
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold">ZUBI Electronics</h1>
                <p className="text-white/70 print:text-black text-sm sm:text-base">
                  Pakistan | 📞 +92 300 1358167
                </p>
                <hr className="border-white/30 my-4 print:border-black/40" />
                <h2 className="text-lg sm:text-xl font-semibold">PRODUCT DETAILS</h2>
                <p className="text-white/70 print:text-black text-sm sm:text-base mt-1">
                  Date: {new Date().toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-2 text-sm sm:text-base leading-relaxed">
                <p><strong>ID:</strong> {selectedProduct.productId}</p>
                <p><strong>Name:</strong> {selectedProduct.name}</p>
                <p><strong>Category:</strong> {selectedProduct.category}</p>
                <p><strong>Company:</strong> {selectedProduct.company}</p>
                <p><strong>Unit Price:</strong> Rs {selectedProduct.price}/-</p>
                <p><strong>Quantity:</strong> {selectedProduct.quantity}</p>
                <p><strong>Value:</strong> Rs {selectedProduct.price * selectedProduct.quantity}/-</p>
                <p><strong>Supplier:</strong> {selectedProduct.supplier}</p>
                <p><strong>Description:</strong> {selectedProduct.description}</p>
                <p><strong>Status:</strong> {getStatus(selectedProduct.quantity)}</p>
              </div>

              <div className="mt-8 text-center text-white/70 text-xs sm:text-sm print:text-black">
                <p>Product information provided by ZUBI Electronics.</p>
                <p className="text-white/50 mt-2 print:text-gray-600">
                  This is a computer-generated document.
                </p>
              </div>
            </div>

            <div className="p-3 sm:p-4 border-t border-white/20 flex flex-wrap justify-center gap-2 print:hidden">
              <button
                onClick={() => toast.success("Product details saved successfully!")}
                className="bg-green-700 hover:bg-green-600 px-3 sm:px-4 py-2 rounded-md font-semibold cursor-pointer text-sm sm:text-base"
              >
                💾 Save
              </button>

              <button
                onClick={handlePrint}
                className="bg-blue-700 hover:bg-blue-600 px-3 sm:px-4 py-2 rounded-md font-semibold cursor-pointer text-sm sm:text-base"
              >
                🖨️ Print
              </button>

              <button
                onClick={() => setSelectedProduct(null)}
                className="bg-red-700 hover:bg-red-600 px-3 sm:px-4 py-2 rounded-md font-semibold cursor-pointer text-sm sm:text-base"
              >
                ✖ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
