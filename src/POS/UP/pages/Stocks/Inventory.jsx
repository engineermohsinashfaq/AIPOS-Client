// |===============================| Inventory Component |===============================|
// Import necessary React hooks and external libraries
import React, { useState, useMemo, useEffect } from "react";
import { X } from "lucide-react";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";

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

// Short date formatter - extracts only the date portion for table display
const formatShortDate = (dateString) => {
  if (!dateString) return "—";

  try {
    const fullDate = formatDateTime(dateString);
    if (fullDate === "—") return "—";

    // Extract just the date part (DD/MM/YYYY)
    return fullDate.split(" ")[0];
  } catch (error) {
    return "—";
  }
};

// Load products from localStorage with data validation and field completion
const loadProducts = () => {
  try {
    const raw = localStorage.getItem("products");
    const products = raw ? JSON.parse(raw) : [];

    // Ensure all products have createdAt and updatedAt fields for consistency
    return products.map((product) => {
      // Set createdAt to savedOn or current date if missing
      if (!product.createdAt) {
        product.createdAt = product.savedOn || new Date().toISOString();
      }
      // Set updatedAt to updatedOn, savedOn, or current date if missing
      if (!product.updatedAt) {
        product.updatedAt =
          product.updatedOn || product.savedOn || new Date().toISOString();
      }
      return product;
    });
  } catch {
    console.error("Error loading products from localStorage.");
    return [];
  }
};

// Calculate product value with priority on stored value field, fallback to calculation
const getProductValue = (product) => {
  // First priority: Use the stored value field (contains accumulated inventory value)
  if (product.value !== undefined && product.value !== null) {
    const storedValue = parseFloat(product.value);
    if (!isNaN(storedValue) && storedValue >= 0) {
      return storedValue.toFixed(2);
    }
  }

  // Fallback: Calculate from quantity × price (for backward compatibility)
  const quantity = parseInt(product.quantity || 0);
  const price = parseFloat(product.price || 0);
  return (quantity * price).toFixed(2);
};

// Calculate average price per unit with priority on stored field, fallback to calculation
const getPricePerUnit = (product) => {
  // First priority: Use the stored pricePerUnit field
  if (product.pricePerUnit !== undefined && product.pricePerUnit !== null) {
    const storedPricePerUnit = parseFloat(product.pricePerUnit);
    if (!isNaN(storedPricePerUnit) && storedPricePerUnit >= 0) {
      return storedPricePerUnit.toFixed(2);
    }
  }

  // Fallback: Calculate from total value ÷ quantity
  const totalValue = parseFloat(getProductValue(product));
  const quantity = parseInt(product.quantity || 0);

  // Return zero if no quantity to avoid division by zero
  if (quantity === 0) return "0.00";

  const calculatedPricePerUnit = totalValue / quantity;
  return calculatedPricePerUnit.toFixed(2);
};

// Determine stock level status based on quantity with visual indicators
const getStockLevel = (quantity) => {
  const qty = parseInt(quantity || 0);

  // Return appropriate status object based on quantity level
  if (qty === 0) {
    return {
      level: "out-of-stock",
      label: "OUT OF STOCK",
      color: "text-white",
      bgColor: "bg-red-500/80",
      borderColor: "border-white/20",
      icon: <ErrorIcon fontSize="small" />,
    };
  } else if (qty <= 5) {
    return {
      level: "low",
      label: "LOW STOCK",
      color: "text-white",
      bgColor: "bg-orange-500/80",
      borderColor: "border-white/20",
      icon: <WarningIcon fontSize="small" />,
    };
  } else if (qty <= 15) {
    return {
      level: "medium",
      label: "MEDIUM STOCK",
      color: "text-white",
      bgColor: "bg-yellow-500/80",
      borderColor: "border-white/20",
      icon: <WarningIcon fontSize="small" />,
    };
  } else {
    return {
      level: "high",
      label: "IN STOCK",
      color: "text-white",
      bgColor: "bg-green-500",
      borderColor: "border-white/20",
      icon: <span>✓</span>,
    };
  }
};

// Main Inventory component function
export default function Inventory() {
  // State management for products data
  const [products] = useState(loadProducts);

  // State for search functionality
  const [query, setQuery] = useState("");

  // State for modal visibility
  const [isViewOpen, setIsViewOpen] = useState(false);

  // State for selected product details
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Effect hook to handle body overflow when modal is open/closed
  useEffect(() => {
    if (isViewOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    }

    // Cleanup function to reset overflow on component unmount
    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    };
  }, [isViewOpen]);

  // Memoized filtered products based on search query
  const filtered = useMemo(() => {
    let arr = products.slice();

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
          p.createdAt,
          p.updatedAt,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    // Sort by product ID
    arr.sort((a, b) => a.productId.localeCompare(b.productId));
    return arr;
  }, [products, query]);

  // Memoized total inventory value calculation using stored or calculated values
  const totalValue = useMemo(() => {
    return filtered
      .reduce((sum, p) => {
        const productValue = getProductValue(p);
        return sum + parseFloat(productValue);
      }, 0)
      .toFixed(2);
  }, [filtered]);

  // Memoized total quantity calculation
  const totalQuantity = useMemo(() => {
    return filtered.reduce((sum, p) => sum + parseInt(p.quantity || 0), 0);
  }, [filtered]);

  // Memoized low stock count (quantity <= 5)
  const lowStockCount = useMemo(() => {
    return filtered.filter((p) => parseInt(p.quantity || 0) <= 5).length;
  }, [filtered]);

  // Memoized out of stock count (quantity === 0)
  const outOfStockCount = useMemo(() => {
    return filtered.filter((p) => parseInt(p.quantity || 0) === 0).length;
  }, [filtered]);

  // Memoized products with calculated values for display
  const productsWithCalculatedValues = useMemo(() => {
    return filtered.map((product) => ({
      ...product,
      displayValue: getProductValue(product), // Use calculated value for display
      displayPricePerUnit: getPricePerUnit(product), // Add price per unit for display
      stockLevel: getStockLevel(product.quantity), // Add stock level information
    }));
  }, [filtered]);

  // Print functionality handler
  const handlePrint = () => {
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.print();
    document.body.style.overflow = bodyOverflow;
  };

  // Close view modal handler
  const handleCloseViewModal = () => {
    setIsViewOpen(false);
  };

  // Component render method
  return (
    // Main container with responsive padding and dark background
    <div className="p-2 min-h-screen text-white">
      {/* Content wrapper with max width constraint */}
      <div className="max-w-8xl mx-auto space-y-6">
        {/* Page header section */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            INVENTORY & STOCKS
          </h1>
          <p className="text-white/80">
            VIEW ALL STOCKS AND INVENTORY RECORDS WITH ACCUMULATED VALUES.
          </p>
        </div>

        {/* Summary Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Products Card */}
          <div className="bg-blue-600/80 backdrop-blur-md border border-blue-400/80 rounded-lg p-4">
            <h3 className="text-blue-300 text-sm font-semibold">
              TOTAL PRODUCTS
            </h3>
            <p className="text-2xl font-bold text-white">{filtered.length}</p>
          </div>

          {/* Total Quantity Card */}
          <div className="bg-green-600/80 backdrop-blur-md border border-green-400/80 rounded-lg p-4">
            <h3 className="text-green-300 text-sm font-semibold">
              TOTAL QUANTITY
            </h3>
            <p className="text-2xl font-bold text-white">
              {totalQuantity} UNITS
            </p>
          </div>

          {/* Total Inventory Value Card */}
          <div className="bg-purple-600/80 backdrop-blur-md border border-purple-400/80 rounded-lg p-4">
            <h3 className="text-purple-300 text-sm font-semibold">
              TOTAL INVENTORY VALUE
            </h3>
            <p className="text-2xl font-bold text-white">RS {totalValue}/-</p>
          </div>

          {/* Stock Alerts Card with pulse animation when alerts exist */}
          <div
            className={`bg-red-600/80 backdrop-blur-md border border-red-400/80 rounded-lg p-4 ${
              lowStockCount > 0 || outOfStockCount > 0 ? "animate-pulse" : ""
            }`}
          >
            <h3 className="text-red-200 text-sm font-semibold flex items-center gap-2">
              <WarningIcon fontSize="small" />
              STOCK ALERTS
            </h3>
            <div className="space-y-1 mt-2">
              {/* Out of Stock Alert */}
              {outOfStockCount > 0 && (
                <p className="text-white font-bold flex items-center gap-1">
                  <ErrorIcon fontSize="small" />
                  {outOfStockCount} OUT OF STOCK
                </p>
              )}
              {/* Low Stock Alert */}
              {lowStockCount > 0 && (
                <p className="text-white font-bold flex items-center gap-1">
                  <WarningIcon fontSize="small" />
                  {lowStockCount} LOW STOCK
                </p>
              )}
              {/* All Good Message */}
              {outOfStockCount === 0 && lowStockCount === 0 && (
                <p className="text-white font-bold">ALL GOOD ✓</p>
              )}
            </div>
          </div>
        </div>

        {/* Search Panel */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-md p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 md:col-span-2">
            <SearchIcon className="text-white" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH"
              className="flex-1 outline-none bg-transparent text-white placeholder-white/60"
            />
          </div>
        </div>

        {/* Main Data Table Container */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-md overflow-x-auto scrollbar-hide ">
          {/* Inventory Table */}
          <table className="w-full text-white min-w-[1200px]  ">
            {/* Table Header with Column Labels */}
            <thead className="bg-white/10 text-left text-sm">
              <tr className="text-white/90">
                <th className="p-3">P-ID</th>
                <th className="p-3">NAME</th>
                <th className="p-3">CATEGORY</th>
                <th className="p-3">QTY</th>
                <th className="p-3">STOCK LEVEL</th>
                <th className="p-3">PURCHASE PRICE</th>
                <th className="p-3">VALUE</th>
                <th className="p-3">LAST UPDATED</th>
                <th className="p-3">ACTIONS</th>
              </tr>
            </thead>

            {/* Table Body with Product Records */}
            <tbody>
              {/* Map through filtered product records */}
              {productsWithCalculatedValues.map((p) => (
                <tr
                  key={p.productId}
                  className={` border-t border-white/15 transition hover:bg-green-500/50 ${
                    // Different hover colors based on stock level
                    p.stockLevel.level === "out-of-stock"
                      ? " hover:bg-red-500/50"
                      : p.stockLevel.level === "low"
                      ? " hover:bg-orange-500/50"
                      : p.stockLevel.level === "medium"
                      ? " hover:bg-yellow-500/50"
                      : ""
                  }`}
                >
                  {/* Product ID Column */}
                  <td className="p-3 font-mono">{p.productId.toUpperCase()}</td>

                  {/* Product Name Column */}
                  <td className="p-3">{p.name.toUpperCase()}</td>

                  {/* Category Column */}
                  <td className="p-3">{p.category.toUpperCase()}</td>

                  {/* Quantity Column */}
                  <td className="p-3 font-semibold">{p.quantity}</td>

                  {/* Stock Level Column with Visual Indicator */}
                  <td className="p-3">
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${p.stockLevel.bgColor} ${p.stockLevel.borderColor} ${p.stockLevel.color}`}
                    >
                      {p.stockLevel.icon}
                      {p.stockLevel.label}
                    </div>
                  </td>

                  {/* Purchase Price Column */}
                  <td className="p-3">RS {p.price}/-</td>

                  {/* Inventory Value Column */}
                  <td className="p-3">RS {p.displayValue}/-</td>

                  {/* Last Updated Date Column */}
                  <td className="p-3 text-xs">
                    {formatShortDate(p.updatedAt)}
                  </td>

                  {/* Actions Column with View Button */}
                  <td className="p-3 flex gap-2">
                    <button
                      title="VIEW"
                      onClick={() => {
                        setSelectedProduct({
                          ...p,
                          value: p.displayValue, // Use display value in modal
                          pricePerUnit: p.displayPricePerUnit, // Add price per unit to modal
                          stockLevel: p.stockLevel, // Add stock level to modal
                        });
                        setIsViewOpen(true);
                      }}
                      className="p-2 rounded bg-cyan-900 text-white hover:bg-cyan-950 transition-colors cursor-pointer"
                    >
                      <VisibilityIcon fontSize="small" />
                    </button>
                  </td>
                </tr>
              ))}

              {/* Empty State Message */}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="12" className="p-4 text-center text-white/70">
                    NO PRODUCTS FOUND.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Details View Modal */}
      {isViewOpen && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-2 md:p-4 backdrop-blur-md print:p-0">
          {/* Modal Content Container */}
          <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-md mx-auto max-h-[95vh] overflow-y-auto scrollbar-hide relative font-sans text-sm border border-gray-300">
            {/* Modal Body Content */}
            <div className="p-4 space-y-4">
              {/* Company Header Section */}
              <div className="text-center border-b border-dashed border-gray-300 pb-3 mb-3">
                <h2 className="text-xl font-bold tracking-wider text-gray-900">
                  ZUBI ELECTRONICS
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  PRODUCT & STOCK DETAILS
                </p>
              </div>

              {/* Product Information Section */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">ID:</span>
                  <span className="text-gray-900 text-right">
                    {selectedProduct.productId.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">NAME:</span>
                  <span className="text-gray-900 text-right">
                    {selectedProduct.name.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">MODEL:</span>
                  <span className="text-gray-900 text-right">
                    {selectedProduct.model.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">CATEGORY:</span>
                  <span className="text-gray-900 text-right">
                    {selectedProduct.category.toUpperCase()}
                  </span>
                </div>
                
              </div>

              {/* Pricing and Stock Section */}
              <div className="border-t border-dashed border-gray-300 pt-3 mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">QUANTITY:</span>
                  <span className="text-gray-900 text-right font-semibold">
                    {selectedProduct.quantity} PIECE(S)
                  </span>
                </div>

                {/* Stock Level Display */}
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    STOCK STATUS:
                  </span>
                  <span className="text-right">
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${selectedProduct.stockLevel.bgColor} ${selectedProduct.stockLevel.borderColor} ${selectedProduct.stockLevel.color}`}
                    >
                      {selectedProduct.stockLevel.icon}
                      {selectedProduct.stockLevel.label}
                    </div>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    PURCHASE PRICE:
                  </span>
                  <span className="text-gray-900 text-right">
                    RS {selectedProduct.price}/-
                  </span>
                </div>

                {/* Average Price Per Unit Display */}
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    AVERAGE PRICE PER UNIT:
                  </span>
                  <span className="text-right font-semibold text-orange-600">
                    RS {selectedProduct.pricePerUnit}/-
                  </span>
                </div>
              </div>

              {/* Total Inventory Value Highlight */}
              <div className="bg-blue-200 border border-blue-200 rounded-lg p-3 mt-3">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-bold text-blue-900">
                    INVENTORY VALUE:
                  </span>
                  <span className="font-bold text-blue-900 text-right">
                    RS {selectedProduct.value}/-
                  </span>
                </div>
                <div className="text-xs text-blue-700 mt-1 text-center">
                  (ACCUMULATED INVENTORY VALUE)
                </div>
              </div>

              {/* Timestamp Information Section */}
              <div className="text-xs text-gray-500 italic border-t border-dashed border-gray-300 pt-3 mt-3 space-y-2">
                {/* Creation Date */}
                <div className="grid grid-cols-2 gap-2">
                  <span>CREATED:</span>
                  <span className="text-right">
                    {formatDateTime(selectedProduct.createdAt)}
                  </span>
                </div>

                {/* Last Update Date */}
                <div className="grid grid-cols-2 gap-2">
                  <span>LAST UPDATED:</span>
                  <span className="text-right">
                    {formatDateTime(selectedProduct.updatedAt)}
                  </span>
                </div>
              </div>

              {/* Footer Disclaimer */}
              <div className="text-center border-t border-dashed border-gray-300 pt-4 text-xs text-gray-600">
                <p>THIS IS A COMPUTER-GENERATED RECORD.</p>
                <p>CONTAINS PRODUCT AND STOCK DETAILS ONLY.</p>
              </div>
            </div>

            {/* Modal Action Buttons (Sticky Footer) */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 rounded-b-lg p-2 print:hidden">
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                {/* Print Button */}
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded bg-blue-600 cursor-pointer text-white hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <span>🖨️</span>
                  <span>PRINT</span>
                </button>

                {/* Close Modal Button */}
                <button
                  onClick={handleCloseViewModal}
                  className="px-4 py-2 rounded bg-gray-600 cursor-pointer text-white hover:bg-gray-700 transition font-medium"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}