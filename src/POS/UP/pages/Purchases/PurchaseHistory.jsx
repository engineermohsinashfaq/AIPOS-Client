// |===============================| PurchaseHistory Component |===============================|
// Import necessary React hooks and external libraries
import React, { useState, useMemo, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";

// Date formatting utility function - converts various date formats to standardized string
const formatDateTime = (dateInput) => {
  // Return dash for empty/null dates
  if (!dateInput) return "—";

  try {
    let date;

    // Handle different date input types and formats
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === "string") {
      // Parse custom date format (DD/MM/YYYY HH:MM:SS)
      if (dateInput.includes("/")) {
        const parts = dateInput.split(" ");
        const datePart = parts[0];
        const timePart = parts[1];

        if (datePart.includes("/")) {
          const [day, month, year] = datePart.split("/");
          if (timePart) {
            const [hours, minutes, seconds] = timePart.split(":");
            date = new Date(
              year,
              month - 1,
              day,
              hours || 0,
              minutes || 0,
              seconds || 0
            );
          } else {
            date = new Date(year, month - 1, day);
          }
        }
      } else {
        // Parse ISO string or other standard formats
        date = new Date(dateInput);
      }
    } else {
      // Handle numeric timestamps or other date types
      date = new Date(dateInput);
    }

    // Validate the parsed date
    if (isNaN(date.getTime())) {
      return "—";
    }

    // Format date components with leading zeros
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    // Return formatted date string (DD/MM/YYYY HH:MM:SS)
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error("Date formatting error:", error);
    return "—";
  }
};

// Short date formatter - extracts only the date portion
const formatShortDate = (dateString) => {
  if (!dateString) return "—";

  try {
    const fullDate = formatDateTime(dateString);
    if (fullDate === "—") return "—";
    return fullDate.split(" ")[0]; // Return only date part (before space)
  } catch (error) {
    return "—";
  }
};

// Load purchase history from localStorage with sorting by date
const loadPurchaseHistory = () => {
  try {
    // Retrieve purchase history from localStorage or initialize empty array
    const purchaseHistory =
      JSON.parse(localStorage.getItem("purchaseHistory")) || [];

    // Sort purchase history by date (newest first)
    return purchaseHistory.sort((a, b) => {
      // Helper function to extract timestamp from various date fields
      const getTimestamp = (item) => {
        const dateFields = [
          "savedOn",
          "updatedOn",
          "updatedAt",
          "createdAt",
          "date",
        ];
        for (let field of dateFields) {
          if (item[field]) {
            const timestamp = new Date(item[field]).getTime();
            if (!isNaN(timestamp)) {
              return timestamp;
            }
          }
        }
        return 0;
      };

      const timestampA = getTimestamp(a);
      const timestampB = getTimestamp(b);

      // Sort descending (newest first)
      return timestampB - timestampA;
    });
  } catch {
    console.error("Error loading purchase history from localStorage.");
    return [];
  }
};

// Main PurchaseHistory component function
export default function PurchaseHistory() {
  // State management for purchase history data
  const [purchaseHistory, setPurchaseHistory] = useState(loadPurchaseHistory);

  // State for search query
  const [query, setQuery] = useState("");

  // State for modal visibility
  const [isViewOpen, setIsViewOpen] = useState(false);

  // State for currently selected product details
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Effect hook to handle localStorage changes and initial data loading
  useEffect(() => {
    // Event handler for storage changes (other tabs/windows)
    const handleStorage = () => {
      setPurchaseHistory(loadPurchaseHistory());
    };
    window.addEventListener("storage", handleStorage);

    // Load initial data
    setPurchaseHistory(loadPurchaseHistory());

    // Cleanup event listener on component unmount
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Memoized filtered purchase history based on search query
  const filtered = useMemo(() => {
    let arr = purchaseHistory.slice();

    // Apply search filter if query exists
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((p) =>
        // Search across multiple product fields
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

  // Print functionality handler
  const handlePrint = () => {
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.print();
    document.body.style.overflow = bodyOverflow;
  };

  // Purchase type display formatter
  const getPurchaseType = (product) => {
    return product.type === "stock-addition"
      ? "Stock Addition"
      : "New Purchase";
  };

  // Component render method
  return (
    // Main container with responsive padding and dark background
    <div className="p-2 min-h-screen text-white">
      {/* Toast notifications container */}
      <ToastContainer position="top-right" theme="dark" autoClose={2000} />

      {/* Content wrapper with max width constraint */}
      <div className="max-w-8xl mx-auto space-y-6">
        {/* Page header section */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Purchase History
          </h1>
          <p className="text-white/80">
            View all purchase and stock addition records with invoice details.
          </p>
        </div>

        {/* Search and statistics panel */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-md p-4 grid grid-cols-1 md:grid-cols-3 gap-3 ">
          {/* Search input with icon */}
          <div className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 md:col-span-2">
            <SearchIcon className="text-white" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="flex-1 outline-none bg-transparent text-white placeholder-white/60"
            />
          </div>

          {/* Record count display */}
          <div className="text-white/80 text-lg flex items-center">
            Total Records: {filtered.length}
          </div>
        </div>

        {/* Main data table container */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-md overflow-x-auto scrollbar-hide ">
          {/* Purchase history table */}
          <table className="w-full text-white/90 min-w-[1200px]">
            {/* Table header with column labels */}
            <thead className="bg-white/10 text-left text-sm">
              <tr>
                <th className="p-3">Invoice ID</th>
                <th className="p-3">Product ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Price</th>
                <th className="p-3">Supplier</th>
                <th className="p-3">Date</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            {/* Table body with purchase records */}
            <tbody>
              {/* Map through filtered purchase records */}
              {filtered.map((p) => (
                <tr
                  key={`${p.invoiceId}-${p.productId}`} // Unique key for each row
                  className={`border-t border-white/5 transition 
        ${
          // Different hover colors based on purchase type
          p.type === "stock-addition"
            ? "hover:bg-blue-600/50"
            : "hover:bg-green-600/50"
        }`}
                >
                  {/* Invoice ID column */}
                  <td className="p-3 font-mono">{p.invoiceId}</td>

                  {/* Product ID column */}
                  <td className="p-3 font-mono">{p.productId}</td>

                  {/* Product name column */}
                  <td className="p-3">{p.name.toUpperCase()}</td>

                  {/* Purchase type with colored badge */}
                  <td className="p-3">
                    <span
                      className={`px-2 py-1  text-xs border rounded-full border-white/30 ${
                        p.type === "stock-addition"
                          ? "bg-blue-600"
                          : "bg-green-600"
                      }`}
                    >
                      {getPurchaseType(p)}
                    </span>
                  </td>

                  {/* Quantity column */}
                  <td className="p-3">{p.quantity}</td>

                  {/* Price column */}
                  <td className="p-3">Rs {p.price}/-</td>

                  {/* Supplier column */}
                  <td className="p-3">{p.supplier.toUpperCase()}</td>

                  {/* Date column with short format */}
                  <td className="p-3 text-sm">{formatShortDate(p.savedOn)}</td>

                  {/* Actions column with view button */}
                  <td className="p-3 flex gap-2">
                    <button
                      title="View"
                      onClick={() => {
                        setSelectedProduct(p);
                        setIsViewOpen(true);
                      }}
                      className="p-2 rounded bg-cyan-900 text-white hover:bg-cyan-950 transition-colors cursor-pointer"
                    >
                      <VisibilityIcon fontSize="small" />
                    </button>
                  </td>
                </tr>
              ))}

              {/* Empty state message */}
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

      {/* Product details modal */}
      {isViewOpen && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-2 md:p-4 backdrop-blur-md print:p-0">
          {/* Modal content container */}
          <div className="bg-white text-black rounded-lg w-full max-w-md mx-auto max-h-[95vh] overflow-y-auto scrollbar-hide relative font-sans text-sm border border-gray-300">
            {/* Modal body content */}
            <div className="p-4 space-y-3">
              {/* Header section with company info */}
              <div className="text-center border-b border-dashed border-gray-300 pb-3 mb-3">
                <h2 className="text-xl font-bold tracking-wider text-gray-900">
                  ZUBI ELECTRONICS
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Purchase & Invoice Details
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-semibold text-gray-700">
                    Invoice: {selectedProduct.invoiceId}
                  </p>
                  {/* Purchase type badge */}
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs ${
                      selectedProduct.type === "stock-addition"
                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                        : "bg-green-200 text-green-800 border border-green-200"
                    }`}
                  >
                    {getPurchaseType(selectedProduct)}
                  </span>
                </div>
              </div>

              {/* Product details section */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Product ID:</span>
                  <span className="text-gray-900 text-right font-mono">
                    {selectedProduct.productId}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="text-gray-900 text-right">
                    {selectedProduct.name.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Model:</span>
                  <span className="text-gray-900 text-right">
                    {selectedProduct.model.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Category:</span>
                  <span className="text-gray-900 text-right">
                    {selectedProduct.category.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Purchase details section */}
              <div className="border-t border-dashed border-gray-300 pt-3 mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Quantity:</span>
                  <span className="text-gray-900 text-right">
                    {selectedProduct.quantity} piece(s)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    Purchase Price:
                  </span>
                  <span className="text-gray-900 text-right">
                    Rs {selectedProduct.price}/-
                  </span>
                </div>
              </div>

              {/* Total value highlight section */}
              <div className="bg-blue-200 border border-blue-200 rounded-md p-2 mt-3">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-bold text-blue-900">
                    Purchase Value:
                  </span>
                  <span className="font-bold text-blue-900 text-right">
                    Rs {selectedProduct.total}/-
                  </span>
                </div>
              </div>

              {/* Supplier information section */}
              <div className="border-t border-dashed border-gray-300 pt-3 mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Company:</span>
                  <span className="text-gray-900 text-right">
                    {selectedProduct.company.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Supplier:</span>
                  <span className="text-gray-900 text-right">
                    {selectedProduct.supplier.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    Supplier Contact:
                  </span>
                  <span className="text-gray-900 text-right">
                    {selectedProduct.supplierContact}
                  </span>
                </div>
              </div>

              {/* Timestamp information */}
              <div className="text-xs text-gray-500 italic border-t border-dashed border-gray-300 pt-3 mt-3">
                <div className="grid grid-cols-2 gap-2">
                  <span>Purchase Date:</span>
                  <span className="text-right">
                    {formatDateTime(selectedProduct.savedOn)}
                  </span>
                </div>
                {/* Show update timestamp if available */}
                {selectedProduct.updatedAt && (
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <span>Last Updated:</span>
                    <span className="text-right">
                      {formatDateTime(selectedProduct.updatedAt)}
                    </span>
                  </div>
                )}
              </div>

              {/* Footer disclaimer */}
              <div className="text-center border-t border-dashed border-gray-300 pt-4 text-xs text-gray-600">
                <p>This is a computer-generated purchase record.</p>
                <p>Contains invoice and purchase details only.</p>
              </div>
            </div>

            {/* Modal action buttons (sticky footer) */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 rounded-b-lg p-2 print:hidden">
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                {/* Print button */}
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded bg-blue-600 cursor-pointer text-white hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <span>🖨️</span>
                  <span>Print</span>
                </button>

                {/* Close modal button */}
                <button
                  onClick={() => setIsViewOpen(false)}
                  className="px-4 py-2 rounded bg-gray-600 cursor-pointer text-white hover:bg-gray-700 transition font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
