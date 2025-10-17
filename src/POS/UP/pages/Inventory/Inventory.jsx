import React, { useState, useMemo } from "react";
import { X } from "lucide-react";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";

// ✅ Consistent Date Formatter
const formatDateTime = (dateString) => {
  if (!dateString) return "—";
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    return "Invalid Date";
  }
};

const loadProducts = () => {
  try {
    const raw = localStorage.getItem("products");
    return raw ? JSON.parse(raw) : [];
  } catch {
    console.error("Error loading products from localStorage.");
    return [];
  }
};

export default function Inventory() {
  const [products] = useState(loadProducts);
  const [query, setQuery] = useState("");
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const filtered = useMemo(() => {
    let arr = products.slice();
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((p) =>
        [
          p.productId,
          p.name,
          p.model,
          p.category,
          p.company,
          p.supplier,
          p.supplierContact,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    arr.sort((a, b) => a.productId.localeCompare(b.productId));
    return arr;
  }, [products, query]);

  // Calculate total value of all filtered products
  const totalValue = useMemo(() => {
    return filtered
      .reduce((sum, p) => sum + parseFloat(p.value || 0), 0)
      .toFixed(2);
  }, [filtered]);

  // Calculate total quantity of all filtered products
  const totalQuantity = useMemo(() => {
    return filtered
      .reduce((sum, p) => sum + parseInt(p.quantity || 0), 0);
  }, [filtered]);

  const handlePrint = () => {
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.print();
    document.body.style.overflow = bodyOverflow;
  };

  return (
    <div className="p-2 min-h-screen text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Inventory & Stocks
          </h1>
          <p className="text-white/80">
            View all stocks and inventory records with accumulated values.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-600/20 backdrop-blur-md border border-blue-400/30 rounded-lg p-4">
            <h3 className="text-blue-300 text-sm font-semibold">Total Products</h3>
            <p className="text-2xl font-bold text-white">{filtered.length}</p>
          </div>
          <div className="bg-green-600/20 backdrop-blur-md border border-green-400/30 rounded-lg p-4">
            <h3 className="text-green-300 text-sm font-semibold">Total Quantity</h3>
            <p className="text-2xl font-bold text-white">{totalQuantity} units</p>
          </div>
          <div className="bg-purple-600/20 backdrop-blur-md border border-purple-400/30 rounded-lg p-4">
            <h3 className="text-purple-300 text-sm font-semibold">Total Inventory Value</h3>
            <p className="text-2xl font-bold text-white">Rs {totalValue}/-</p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-md p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 md:col-span-2">
            <SearchIcon className="text-white" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 outline-none bg-transparent text-white placeholder-white/60"
            />
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-md overflow-x-auto">
          <table className="w-full text-white/90 min-w-[1200px]">
            <thead className="bg-white/10 text-left text-sm">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Model</th>
                <th className="p-3">Category</th>
                <th className="p-3">Company</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Purchase Price</th>
                <th className="p-3">Sell Price</th>
                <th className="p-3">Value</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.productId}
                  className="border-t border-white/5 hover:bg-white/5 transition"
                >
                  <td className="p-3 font-mono">{p.productId}</td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.model}</td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3">{p.company}</td>
                  <td className="p-3">{p.quantity}</td>
                  <td className="p-3">Rs {p.price}/-</td>
                  <td className="p-3">Rs {p.sellPrice}/-</td>
                  <td className="p-3">Rs {p.value}/-</td>
                  <td className="p-3 flex gap-2">
                    <button
                      title="View"
                      onClick={() => {
                        setSelectedProduct(p);
                        setIsViewOpen(true);
                      }}
                      className="p-2 rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors cursor-pointer"
                    >
                      <VisibilityIcon fontSize="small" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="10" className="p-4 text-center text-white/70">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
            {/* Footer row showing totals */}
            {filtered.length > 0 && (
              <tfoot className="bg-white/10 text-left text-md font-semibold">
                <tr>
                  <td className="p-3" colSpan="5">Total</td>
                  <td className="p-3">{totalQuantity} units</td>
                  <td className="p-3" colSpan="2"></td>
                  <td className="p-3">Rs {totalValue}/-</td>
                  <td className="p-3"></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* --- View Modal --- */}
      {isViewOpen && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/10 z-50 p-2 backdrop-blur-md print:p-0">
          <div className="bg-white text-black rounded-md shadow-xl w-full max-w-md p-6 relative font-mono text-sm border border-white/30">
            <button
              onClick={() => setIsViewOpen(false)}
              className="absolute top-2 right-2 text-black transition p-1 cursor-pointer rounded-full print:hidden"
            >
              <X size={18} />
            </button>

            <div className="text-center border-b border-dashed border-black pb-3 mb-3">
              <h2 className="text-xl font-bold tracking-wider">
                ZUBI ELECTRONICS
              </h2>
              <p className="text-xs mt-1">Product & Stock Details</p>
            </div>

            <div className="space-y-2 leading-6">
              <div className="flex justify-between">
                <span>ID:</span>
                <span>{selectedProduct.productId}</span>
              </div>
              <div className="flex justify-between">
                <span>Name:</span>
                <span>{selectedProduct.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Model:</span>
                <span>{selectedProduct.model}</span>
              </div>
              <div className="flex justify-between">
                <span>Category:</span>
                <span>{selectedProduct.category}</span>
              </div>
              <div className="flex justify-between">
                <span>Company:</span>
                <span>{selectedProduct.company}</span>
              </div>

              <div className="flex justify-between border-t border-dashed border-black/90 mt-2 pt-2">
                <span>Purchase Price (Per Unit):</span>
                <span>Rs {selectedProduct.price}/-</span>
              </div>
              <div className="flex justify-between">
                <span>Sell Price (Per Unit):</span>
                <span>Rs {selectedProduct.sellPrice}/-</span>
              </div>
              <div className="flex justify-between">
                <span>Quantity in Stock:</span>
                <span>{selectedProduct.quantity} piece(s)</span>
              </div>
              
              <div className="flex justify-between border-t border-dashed border-black/90 mt-4 py-2 font-bold">
                <span>Total Inventory Value:</span>
                <span>Rs {selectedProduct.value}/-</span>
              </div>

              {/* Supplier Information */}
              <div className="flex justify-between border-t border-dashed border-black/90 mt-2 pt-2">
                <span>Supplier:</span>
                <span>{selectedProduct.supplier}</span>
              </div>
              <div className="flex justify-between">
                <span>Supplier Contact:</span>
                <span>{selectedProduct.supplierContact}</span>
              </div>
              <div className="flex justify-between text-xs text-black/70 italic">
                <span>Last Updated:</span>
                <span>{formatDateTime(selectedProduct.updatedOn || selectedProduct.savedOn)}</span>
              </div>
            </div>

            <div className="text-center border-t border-dashed border-black/90 pt-4 text-xs">
              <p>This is a computer-generated record.</p>
              <p>Contains product and stock details only.</p>
            </div>

            <div className="flex justify-end gap-3 pt-8 print:hidden">
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded bg-blue-700 cursor-pointer text-white hover:bg-blue-600 transition"
              >
                🖨️ Print
              </button>
              <button
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 rounded cursor-pointer bg-red-600 text-white hover:bg-red-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}