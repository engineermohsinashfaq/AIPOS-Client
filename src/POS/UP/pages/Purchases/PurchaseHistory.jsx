import React, { useState, useMemo, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X } from "lucide-react";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

// ✅ Robust Date Formatter that handles all date formats
const formatDateTime = (dateInput) => {
  if (!dateInput) return "—";
  
  try {
    let date;
    
    // Handle different date formats
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      // Try to parse the date string - handle multiple formats
      if (dateInput.includes('/')) {
        // Handle DD/MM/YYYY format
        const parts = dateInput.split(' ');
        const datePart = parts[0];
        const timePart = parts[1];
        
        if (datePart.includes('/')) {
          const [day, month, year] = datePart.split('/');
          if (timePart) {
            const [hours, minutes, seconds] = timePart.split(':');
            date = new Date(year, month - 1, day, hours || 0, minutes || 0, seconds || 0);
          } else {
            date = new Date(year, month - 1, day);
          }
        }
      } else {
        // Try standard Date parsing
        date = new Date(dateInput);
      }
    } else {
      date = new Date(dateInput);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "—";
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return "—";
  }
};

// ✅ Short Date for Display (Table) - More robust version
const formatShortDate = (dateString) => {
  if (!dateString) return "—";
  
  try {
    const fullDate = formatDateTime(dateString);
    if (fullDate === "—") return "—";
    
    // Extract just the date part (DD/MM/YYYY)
    return fullDate.split(' ')[0];
  } catch (error) {
    return "—";
  }
};

/**
 * Loads purchase history data.
 */
const loadPurchaseHistory = () => {
  try {
    const purchaseHistory =
      JSON.parse(localStorage.getItem("purchaseHistory")) || [];

    // Sort by date descending (newest first)
    return purchaseHistory.sort((a, b) => {
      const dateA = new Date(a.savedOn || a.updatedOn || 0);
      const dateB = new Date(b.savedOn || b.updatedOn || 0);
      return dateB - dateA; // Descending order
    });
  } catch {
    console.error("Error loading purchase history from localStorage.");
    return [];
  }
};

export default function PurchaseHistory() {
  const [purchaseHistory, setPurchaseHistory] = useState(loadPurchaseHistory);
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [form, setForm] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  // 🟢 Refresh data automatically if storage updates
  useEffect(() => {
    const handleStorage = () => {
      setPurchaseHistory(loadPurchaseHistory());
    };
    window.addEventListener("storage", handleStorage);

    // Also refresh when component mounts
    setPurchaseHistory(loadPurchaseHistory());

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const filtered = useMemo(() => {
    let arr = purchaseHistory.slice();
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
          p.invoiceId,
          p.type,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    return arr;
  }, [purchaseHistory, query]);

  const toastConfig = { position: "top-right", theme: "dark", autoClose: 2000 };
  const notifySuccess = (msg) => toast.success(msg, toastConfig);
  const notifyError = (msg) => toast.error(msg, toastConfig);

  const handleOpenEdit = (product) => {
    const contactWithoutPlus = product.supplierContact?.startsWith("+")
      ? product.supplierContact.substring(1)
      : product.supplierContact || "";
    setForm({ ...product, supplierContact: contactWithoutPlus });
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;

    if (["price", "sellPrice"].includes(name)) {
      val = value.replace(/[^\d.]/g, "");
    } else if (name === "quantity") {
      val = value.replace(/\D/g, "");
    } else if (name === "supplierContact") {
      let digits = value.replace(/\D/g, "");
      if (digits.length > 15) digits = digits.slice(0, 15);
      val = digits;
    }

    setForm((s) => ({ ...s, [name]: val }));
  };

  const handleSave = (e) => {
    e.preventDefault();

    const originalProduct = purchaseHistory.find(
      (p) => p.productId === form.productId && p.invoiceId === form.invoiceId
    );

    const trimmedForm = Object.fromEntries(
      Object.entries(form).map(([k, v]) =>
        typeof v === "string" ? [k, v.trim()] : [k, v]
      )
    );

    // 🧱 Validation
    if (!trimmedForm.name) return notifyError("Name is required");
    if (!trimmedForm.model) return notifyError("Model is required");
    if (!trimmedForm.category) return notifyError("Category is required");
    if (!trimmedForm.company) return notifyError("Company is required");
    if (!trimmedForm.supplier) return notifyError("Supplier is required");

    const price = parseFloat(trimmedForm.price);
    const sellPrice = parseFloat(trimmedForm.sellPrice);
    const quantity = parseInt(trimmedForm.quantity);

    if (isNaN(price) || price <= 0)
      return notifyError("Valid Purchase Price is required");
    if (isNaN(sellPrice) || sellPrice <= 0)
      return notifyError("Valid Sell Price is required");
    if (isNaN(quantity) || quantity <= 0)
      return notifyError("Valid Quantity is required");

    const fullSupplierContact = "+" + trimmedForm.supplierContact;
    if (!/^\+\d{7,15}$/.test(fullSupplierContact))
      return notifyError(
        "Supplier Contact must start with '+' followed by 7–15 digits"
      );

    const total = (price * quantity).toFixed(2);

    const updatedProduct = {
      ...trimmedForm,
      price: price.toFixed(2),
      sellPrice: sellPrice.toFixed(2),
      quantity: String(quantity),
      total,
      value: total,
      supplierContact: fullSupplierContact,
      updatedAt: formatDateTime(new Date()),
    };

    // Update purchase history
    const updatedHistory = purchaseHistory.map((p) =>
      p.productId === updatedProduct.productId &&
      p.invoiceId === updatedProduct.invoiceId
        ? updatedProduct
        : p
    );

    setPurchaseHistory(updatedHistory);
    localStorage.setItem("purchaseHistory", JSON.stringify(updatedHistory));

    // Also update products if this is the latest entry for this product
    const products = JSON.parse(localStorage.getItem("products") || "[]");
    const productEntries = purchaseHistory.filter(
      (p) => p.productId === updatedProduct.productId
    );
    const latestEntry = productEntries.sort(
      (a, b) => new Date(b.savedOn) - new Date(a.savedOn)
    )[0];

    if (latestEntry && latestEntry.invoiceId === updatedProduct.invoiceId) {
      const updatedProducts = products.map((p) =>
        p.productId === updatedProduct.productId
          ? { ...p, ...updatedProduct }
          : p
      );
      localStorage.setItem("products", JSON.stringify(updatedProducts));
    }

    setIsModalOpen(false);
    notifySuccess(`${updatedProduct.name} updated successfully.`);
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!productToDelete) return;

    const updatedHistory = purchaseHistory.filter(
      (p) =>
        !(
          p.productId === productToDelete.productId &&
          p.invoiceId === productToDelete.invoiceId
        )
    );

    setPurchaseHistory(updatedHistory);
    localStorage.setItem("purchaseHistory", JSON.stringify(updatedHistory));

    notifySuccess(`${productToDelete.name} deleted successfully.`);
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const cancelDelete = () => {
    setProductToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handlePrint = () => {
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.print();
    document.body.style.overflow = bodyOverflow;
  };

  const getPurchaseType = (product) => {
    return product.type === "stock-addition"
      ? "Stock Addition"
      : "New Purchase";
  };

  return (
    <div className="p-2 min-h-screen text-white">
      <ToastContainer position="top-right" theme="dark" autoClose={2000} />
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Purchase History
          </h1>
          <p className="text-white/80">
            View all purchase and stock addition records with invoice details.
          </p>
        </div>

        {/* Search Filter */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-md p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 md:col-span-2">
            <SearchIcon className="text-white" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by product, invoice, supplier..."
              className="flex-1 outline-none bg-transparent text-white placeholder-white/60"
            />
          </div>
          <div className="text-white/80 text-sm flex items-center">
            Total Records: {filtered.length}
          </div>
        </div>

        {/* Purchase History Table */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-md overflow-x-auto">
          <table className="w-full text-white/90 min-w-[1200px]">
            <thead className="bg-white/10 text-left text-sm">
              <tr>
                <th className="p-3">Invoice ID</th>
                <th className="p-3">Product ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Price</th>
                <th className="p-3">Total</th>
                <th className="p-3">Supplier</th>
                <th className="p-3">Date</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={`${p.invoiceId}-${p.productId}`}
                  className="border-t border-white/5 hover:bg-white/5 transition"
                >
                  <td className="p-3 font-mono">{p.invoiceId}</td>
                  <td className="p-3 font-mono">{p.productId}</td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        p.type === "stock-addition"
                          ? "bg-blue-600/50"
                          : "bg-green-600/50"
                      }`}
                    >
                      {getPurchaseType(p)}
                    </span>
                  </td>
                  <td className="p-3">{p.quantity}</td>
                  <td className="p-3">Rs {p.price}/-</td>
                  <td className="p-3">Rs {p.total}/-</td>
                  <td className="p-3">{p.supplier}</td>
                  <td className="p-3 text-sm">{formatShortDate(p.savedOn)}</td>
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
                    <button
                      title="Edit"
                      onClick={() => handleOpenEdit(p)}
                      className="p-2 rounded bg-yellow-400 text-gray-900 hover:bg-yellow-300 transition-colors cursor-pointer"
                    >
                      <EditIcon fontSize="small" />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => handleDelete(p)}
                      className="p-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="10" className="p-4 text-center text-white/70">
                    No purchase records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- Edit Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 backdrop-blur-md p-2">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-lg text-white">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Edit Purchase Record</h2>
              <div className="text-sm text-white/80 mt-2 space-y-1">
                <p>
                  <strong>Invoice ID:</strong> {form.invoiceId}
                </p>
                <p>
                  <strong>Product ID:</strong> {form.productId}
                </p>
                <p>
                  <strong>Type:</strong> {getPurchaseType(form)}
                </p>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <input
                name="name"
                value={form.name || ""}
                onChange={handleChange}
                placeholder="Name"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />
              <input
                name="model"
                value={form.model || ""}
                onChange={handleChange}
                placeholder="Model"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />
              <input
                name="category"
                value={form.category || ""}
                onChange={handleChange}
                placeholder="Category"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />
              <input
                name="company"
                value={form.company || ""}
                onChange={handleChange}
                placeholder="Company"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />
              <input
                name="price"
                value={form.price || ""}
                onChange={handleChange}
                placeholder="Purchase Price"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />
              <input
                name="sellPrice"
                value={form.sellPrice || ""}
                onChange={handleChange}
                placeholder="Sell Price"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />
              <input
                name="quantity"
                value={form.quantity || ""}
                onChange={handleChange}
                placeholder="Quantity"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />
              <input
                name="supplier"
                value={form.supplier || ""}
                onChange={handleChange}
                placeholder="Supplier"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 select-none">
                  +
                </span>
                <input
                  type="text"
                  name="supplierContact"
                  value={form.supplierContact || ""}
                  onChange={handleChange}
                  placeholder="Supplier Contact (e.g. 923001234567)"
                  className="w-full pl-6 p-2 rounded bg-black/30 border border-white/20 outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="submit"
                  className="px-4 py-2 rounded border border-white/40 bg-cyan-800/80 hover:bg-cyan-900 transition hover:cursor-pointer"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded border border-white/40 bg-red-600 hover:bg-red-700 transition hover:cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

            <div className="text-center border-b border-dashed border-black pb-2 mb-2">
              <h2 className="text-xl font-bold tracking-wider">
                ZUBI ELECTRONICS
              </h2>
              <p className="text-xs mt-1">
                Contact: +92 300 1234567 | info@zubielectronics.com
              </p>
              <p className="text-xs">123 Market Road, Lahore, Pakistan</p>
              <p className="text-xs mt-2 pt-2 border-t border-dashed border-black">
                {selectedProduct.invoiceId}
              </p>
              <p className="text-xs font-semibold mt-1">
                {getPurchaseType(selectedProduct)}
              </p>
            </div>

            <div className="space-y-2 leading-4">
              <div className="flex justify-between">
                <span>Product ID:</span>
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
                <span>Quantity:</span>
                <span>{selectedProduct.quantity} piece(s)</span>
              </div>

              <div className="flex justify-between font-bold border-t border-dashed border-black/90 pt-2">
                <span>Total Purchase Price:</span>
                <span>Rs {selectedProduct.total}/-</span>
              </div>

              <div className="flex justify-between border-b border-dashed border-black/90 pb-2">
                <span>Inventory Value:</span>
                <span>Rs {selectedProduct.value}/-</span>
              </div>

              <div className="flex justify-between pt-2">
                <span>Supplier:</span>
                <span>{selectedProduct.supplier}</span>
              </div>
              <div className="flex justify-between">
                <span>Supplier Contact:</span>
                <span>{selectedProduct.supplierContact}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>
                  {selectedProduct.savedOn &&
                  !selectedProduct.savedOn.includes("Invalid")
                    ? formatDateTime(selectedProduct.savedOn)
                    : "Recently Added"}
                </span>
              </div>
              {selectedProduct.updatedAt && (
                <div className="flex justify-between text-xs text-black/70 italic">
                  <span>Last Updated:</span>
                  <span>
                    {selectedProduct.updatedAt &&
                    !selectedProduct.updatedAt.includes("Invalid")
                      ? formatDateTime(selectedProduct.updatedAt)
                      : "Recently Updated"}
                  </span>
                </div>
              )}
            </div>

            <div className="text-center border-t border-dashed border-black/90 mt-2 pt-6 text-xs">
              <p>
                Thank you for choosing <strong>ZUBI ELECTRONICS</strong>!
              </p>
              <p>This is a computer-generated record.</p>
            </div>

            <div className="flex justify-end gap-3 pt-5 print:hidden">
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

      {/* --- Delete Modal --- */}
      {isDeleteModalOpen && productToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 backdrop-blur-md">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-sm text-white">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-4">
              Are you sure you want to delete purchase record for{" "}
              <strong>{productToDelete.name}</strong> (Invoice:{" "}
              {productToDelete.invoiceId})?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 rounded border border-white/40 bg-cyan-800/80 hover:bg-cyan-900 hover:cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded border border-white/40 bg-red-600 hover:bg-red-700 hover:cursor-pointer transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}