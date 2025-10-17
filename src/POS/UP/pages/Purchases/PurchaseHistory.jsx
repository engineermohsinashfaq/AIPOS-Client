import React, { useState, useMemo, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X } from "lucide-react";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

/**
 * Formats a date string into DD-MM-YYYY format.
 * @param {string} dateString The date string to format.
 * @returns {string} The formatted date (DD-MM-YYYY) or '—'.
 */
const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getFullYear()}`;
  } catch (error) {
    return dateString; // Fallback if date parsing fails
  }
};

/**
 * Loads products array from localStorage.
 * @returns {Array<Object>} The array of products or an empty array.
 */
const loadProducts = () => {
  try {
    const raw = localStorage.getItem("products");
    return raw ? JSON.parse(raw) : [];
  } catch {
    console.error("Error loading products from localStorage.");
    return [];
  }
};

/**
 * AllProducts component for managing, searching, editing, and deleting product inventory.
 */
export default function PurchaseHistory() {
  // State for the list of products loaded from localStorage
  const [products, setProducts] = useState(loadProducts);

  // UI state for search and modals
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // Edit Modal visibility
  const [isViewOpen, setIsViewOpen] = useState(false); // View Modal visibility
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Delete Modal visibility

  // Data state for modals
  const [form, setForm] = useState({}); // Data for the edit form
  const [selectedProduct, setSelectedProduct] = useState(null); // Product data for the view modal
  const [productToDelete, setProductToDelete] = useState(null); // Product data for the delete modal

  /**
   * Effect to persist products to localStorage whenever the products state changes.
   */
  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  /**
   * Memoized computation to filter and sort products based on the search query.
   * Filters across multiple product fields (ID, Name, Model, Category, Company, Supplier, Contact).
   * Sorts the final array by productId.
   * @returns {Array<Object>} The filtered and sorted array of products.
   */
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
    // Sort by productId (assuming PR-001, PR-002, etc. format)
    arr.sort((a, b) => a.productId.localeCompare(b.productId));
    return arr;
  }, [products, query]);

  // Toast utility configuration
  const toastConfig = { position: "top-right", theme: "dark", autoClose: 2000 };
  const notifySuccess = (msg) => toast.success(msg, toastConfig);
  const notifyError = (msg) => toast.error(msg, toastConfig);

  /**
   * Opens the edit modal, setting the form state with the selected product.
   * It also removes the leading '+' from `supplierContact` for correct input display.
   * @param {Object} product The product object to edit.
   */
  const handleOpenEdit = (product) => {
    // Remove the leading '+' for supplierContact, as the input will re-add it visually
    const contactWithoutPlus = product.supplierContact?.startsWith("+")
      ? product.supplierContact.substring(1)
      : product.supplierContact || "";
    setForm({ ...product, supplierContact: contactWithoutPlus });
    setIsModalOpen(true);
  };

  /**
   * Handles input changes for the edit form, applying validation/formatting for numeric and contact fields.
   * @param {Event} e The change event.
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    let val = value;

    if (["price", "sellPrice"].includes(name)) {
      // Allow only digits and a single decimal point for price fields
      val = value.replace(/[^\d.]/g, "");
    } else if (name === "quantity") {
      // Allow only digits for quantity
      val = value.replace(/\D/g, "");
    } else if (name === "supplierContact") {
      // Allow only digits and limit length to 15 for contact number
      let digits = value.replace(/\D/g, "");
      if (digits.length > 15) digits = digits.slice(0, 15);
      val = digits;
    }

    setForm((s) => ({ ...s, [name]: val }));
  };

  /**
   * Handles saving the edited product details.
   * Performs validation, calculates `total` (Purchase Price * Quantity), and updates the products list.
   * @param {Event} e The form submission event.
   */
  const handleSave = (e) => {
    e.preventDefault();

    // Basic required field validation
    if (!form.name?.trim()) return notifyError("Name is required");
    if (!form.model?.trim()) return notifyError("Model is required");
    if (!form.category?.trim()) return notifyError("Category is required");
    if (!form.company?.trim()) return notifyError("Company is required");
    if (!form.supplier?.trim()) return notifyError("Supplier is required");

    // Numeric and range validation
    const price = parseFloat(form.price);
    const sellPrice = parseFloat(form.sellPrice);
    const quantity = parseInt(form.quantity);

    if (isNaN(price) || price <= 0)
      return notifyError("Valid Purchase Price is required");
    if (isNaN(sellPrice) || sellPrice <= 0)
      return notifyError("Valid Sell Price is required");
    if (isNaN(quantity) || quantity <= 0)
      return notifyError("Valid Quantity is required");

    // Supplier Contact validation (must be 7-15 digits after '+')
    const fullSupplierContact = "+" + form.supplierContact;
    if (!/^\+\d{7,15}$/.test(fullSupplierContact))
      return notifyError(
        "Supplier Contact must start with '+' followed by 7–15 digits"
      );

    // Uniqueness check for model (excluding the current product being edited)
    const modelExists = products.some(
      (p) =>
        p.productId !== form.productId &&
        p.model?.toLowerCase() === form.model.toLowerCase()
    );
    if (modelExists) return notifyError("Model must be unique!");

    // Calculate total inventory purchase value
    const total = (price * quantity).toFixed(2);

    const updatedProduct = {
      ...form,
      price: price.toFixed(2), // Ensure consistent storage format
      sellPrice: sellPrice.toFixed(2), // Ensure consistent storage format
      quantity: String(quantity), // Ensure quantity is stored as a string
      total, // Store the calculated total purchase price for convenience
      value: total, // 'value' is used in the main table for inventory value
      supplierContact: fullSupplierContact, // Save with '+' prefix
      updatedOn: new Date().toLocaleString(), // Add an update timestamp
    };

    // Update the state by mapping the new product over the old one
    setProducts((prev) =>
      prev.map((p) =>
        p.productId === updatedProduct.productId ? updatedProduct : p
      )
    );

    setIsModalOpen(false);
    notifySuccess(`${updatedProduct.name} updated successfully.`);
  };

  /**
   * Opens the delete confirmation modal.
   * @param {Object} product The product object to delete.
   */
  const handleDelete = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  /**
   * Confirms and executes the product deletion from the state.
   */
  const confirmDelete = () => {
    if (!productToDelete) return;
    setProducts((prev) =>
      prev.filter((p) => p.productId !== productToDelete.productId)
    );
    notifySuccess(`${productToDelete.name} deleted successfully.`);
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  /**
   * Cancels the product deletion process, closing the modal.
   */
  const cancelDelete = () => {
    setProductToDelete(null);
    setIsDeleteModalOpen(false);
  };

  /**
   * Triggers the browser print function for the visible view modal content.
   */
  const handlePrint = () => {
    // Temporarily hide scrollbar for a cleaner print view
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.print();
    document.body.style.overflow = bodyOverflow;
  };

  return (
    <div className="p-2 min-h-screen text-white">
      <ToastContainer position="top-right" theme="dark" autoClose={2000} />
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Purchase History</h1>
          <p className="text-white/80">
            View, edit, and manage all product inventory records.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-md p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 md:col-span-2">
            <SearchIcon className="text-white" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="flex-1 outline-none bg-transparent text-white placeholder-white/60"
            />
          </div>

         
        </div>

        {/* Products Table */}
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
                  <td className="p-3">{p.productId}</td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.model}</td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3">{p.company}</td>
                  <td className="p-3">{p.quantity}</td>
                  <td className="p-3">{p.value}</td>
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
                  <td colSpan="11" className="p-4 text-center text-white/70">
                    No products found.
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
            <h2 className="text-xl font-semibold mb-4">
              Edit Product: {form.productId}
            </h2>
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
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded border border-white/40 bg-red-600 hover:bg-red-700 transition hover:cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded border border-white/40 bg-cyan-800/80 hover:bg-cyan-900 transition hover:cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- View Modal (Updated to include Total Purchase Price) --- */}
      {isViewOpen && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/10 z-50 p-2 backdrop-blur-md print:p-0">
          <div className="bg-white text-black rounded-md shadow-xl w-full max-w-md p-6 relative font-mono text-sm border border-white/30">
            <button
              onClick={() => setIsViewOpen(false)}
              className="absolute top-2 right-2 text-black transition p-1 cursor-pointer rounded-full print:hidden"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="text-center border-b border-dashed border-black pb-3 mb-3">
              <h2 className="text-xl font-bold tracking-wider">
                ZUBI ELECTRONICS
              </h2>
              <p className="text-xs mt-1">
                Contact: +92 300 1234567 | info@zubielectronics.com
              </p>
              <p className="text-xs">123 Market Road, Lahore, Pakistan</p>
            </div>

            {/* Body */}
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

              {/* Purchase Details */}
              <div className="flex justify-between border-t border-dashed border-black/90 mt-2 pt-2">
                <span>Purchase Price (Per Unit):</span>
                <span>Rs {selectedProduct.price}</span>
              </div>
              <div className="flex justify-between">
                <span>Sell Price (Per Unit):</span>
                <span>Rs {selectedProduct.sellPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Quantity in Stock:</span>
                <span>{selectedProduct.quantity} units</span>
              </div>
              
              {/* Added Total Purchase Price */}
              <div className="flex justify-between font-bold border-t border-dashed border-black/90 pt-2">
                <span>Total Purchase Price:</span>
                {/* Calculate total if 'total' property is missing for older records, otherwise use the stored 'total' */}
                <span>Rs {selectedProduct.total || (parseFloat(selectedProduct.price) * parseInt(selectedProduct.quantity)).toFixed(2)}</span> 
              </div>

              {/* Inventory Value */}
              <div className="flex justify-between border-b border-dashed border-black/90 pb-2">
                <span>Total Inventory Value:</span>
                <span>Rs {selectedProduct.value}</span>
              </div>

              {/* Supplier Details */}
              <div className="flex justify-between pt-2">
                <span>Supplier:</span>
                <span>{selectedProduct.supplier}</span>
              </div>
              <div className="flex justify-between">
                <span>Supplier Contact:</span>
                <span>{selectedProduct.supplierContact}</span>
              </div>
              <div className="flex justify-between">
                <span>Purchased On:</span>
                <span>{selectedProduct.savedOn || formatDate()}</span>
              </div>
              {selectedProduct.updatedOn && (
                <div className="flex justify-between text-xs text-black/70 italic">
                  <span>Last Updated:</span>
                  <span>{selectedProduct.updatedOn}</span>
                </div>
              )}
            </div>

            {/* Footer */}
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
              Are you sure you want to delete{" "}
              <strong>{productToDelete.name}</strong> (ID:{" "}
              {productToDelete.productId})?
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