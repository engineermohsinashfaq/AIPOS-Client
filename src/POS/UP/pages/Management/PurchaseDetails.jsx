// |===============================| PurchaseReports Component |===============================|
// Import necessary React hooks and external libraries
import React, { useState, useMemo, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Download, Printer } from "lucide-react";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FilterListIcon from "@mui/icons-material/FilterList";

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

// Enhanced date parser for consistent sorting
const parseDateForSorting = (dateInput) => {
  if (!dateInput) return new Date(0); // Return epoch for invalid dates

  try {
    // Handle multiple date formats
    if (dateInput instanceof Date) {
      return dateInput;
    }

    if (typeof dateInput === "string") {
      // Handle DD/MM/YYYY HH:MM:SS format
      if (dateInput.includes("/")) {
        const parts = dateInput.split(" ");
        const datePart = parts[0];
        const timePart = parts[1] || "00:00:00";

        if (datePart.includes("/")) {
          const [day, month, year] = datePart.split("/");
          const [hours, minutes, seconds] = timePart.split(":");
          return new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            parseInt(hours) || 0,
            parseInt(minutes) || 0,
            parseInt(seconds) || 0
          );
        }
      }

      // Handle ISO format and other standard formats
      const parsed = new Date(dateInput);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }

    // Fallback for other types (timestamps, etc.)
    return new Date(dateInput);
  } catch (error) {
    console.error("Date parsing error for sorting:", error, dateInput);
    return new Date(0);
  }
};

// Date range calculation utilities
const getDateRange = (range) => {
  const now = new Date();
  const start = new Date();

  switch (range) {
    case "7days":
      start.setDate(now.getDate() - 7);
      break;
    case "15days":
      start.setDate(now.getDate() - 15);
      break;
    case "30days":
      start.setDate(now.getDate() - 30);
      break;
    case "90days":
      start.setDate(now.getDate() - 90);
      break;
    case "all":
    default:
      return { start: null, end: null };
  }

  return { start, end: now };
};

// Function to export data to Excel (CSV format)
const exportToExcel = (data, filename) => {
  if (!data || data.length === 0) {
    toast.error("No data to export");
    return;
  }

  try {
    // Define CSV headers - ADDED PAYMENT METHOD
    const headers = [
      "Invoice ID",
      "Product ID",
      "Product Name",
      "Product Model",
      "Product Category",
      "Purchase Type",
      "Quantity",
      "Unit Price",
      "Total Price",
      "Company",
      "Supplier",
      "Supplier Contact",
      "Payment Method", // ADDED THIS LINE
      "Date",
    ];

    // Convert data to CSV rows - ADDED PAYMENT METHOD
    const csvRows = data.map((purchase) => [
      purchase.invoiceId,
      purchase.productId,
      purchase.name,
      purchase.model,
      purchase.category,
      getPurchaseType(purchase),
      purchase.quantity,
      purchase.price,
      purchase.total,
      purchase.company,
      purchase.supplier,
      purchase.supplierContact,
      purchase.paymentMethod || "N/A", // ADDED THIS LINE
      formatShortDate(purchase.savedOn),
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...csvRows.map((row) => row.map((field) => `"${field}"`).join(",")),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    toast.error("Failed to export data");
    return false;
  }
};

// Load purchase history from localStorage with enhanced sorting by date - LATEST ON TOP
const loadPurchaseHistory = () => {
  try {
    // Retrieve purchase history from localStorage or initialize empty array
    const purchaseHistory =
      JSON.parse(localStorage.getItem("purchaseHistory")) || [];

    // Enhanced sort purchase history by date (newest first) - LATEST PURCHASES ON TOP
    return purchaseHistory.sort((a, b) => {
      try {
        // Extract dates from multiple possible fields with fallbacks
        const dateA = parseDateForSorting(
          a.timestamp ||
            a.savedOn ||
            a.updatedOn ||
            a.updatedAt ||
            a.createdAt ||
            a.date
        );
        const dateB = parseDateForSorting(
          b.timestamp ||
            b.savedOn ||
            b.updatedOn ||
            b.updatedAt ||
            b.createdAt ||
            b.date
        );

        const timestampA = dateA.getTime();
        const timestampB = dateB.getTime();

        // Sort descending (newest first) - LATEST PURCHASES ON TOP
        return timestampB - timestampA;
      } catch (error) {
        console.error("Sorting error for items:", a, b, error);
        return 0;
      }
    });
  } catch {
    console.error("Error loading purchase history from localStorage.");
    return [];
  }
};

// Purchase type display formatter
const getPurchaseType = (product) => {
  return product.type === "stock-addition" ? "Stock Addition" : "New Purchase";
};

// Main PurchaseDetails component function
export default function PurchaseDetails() {
  // State management for purchase history data
  const [purchaseHistory, setPurchaseHistory] = useState(loadPurchaseHistory);

  // State for search query
  const [query, setQuery] = useState("");

  // State for purchase type filtering
  const [purchaseTypeFilter, setPurchaseTypeFilter] = useState("All");

  // State for company filtering
  const [companyFilter, setCompanyFilter] = useState("All");

  // State for date range filtering
  const [dateRangeFilter, setDateRangeFilter] = useState("all");

  // State for modal visibility
  const [isViewOpen, setIsViewOpen] = useState(false);

  // State for report modal visibility
  const [isReportOpen, setIsReportOpen] = useState(false);

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

  // Memoized filtered purchase history based on search query and filters
  const filtered = useMemo(() => {
    let arr = purchaseHistory.slice(); // Start with already sorted array

    // Apply search filter if query exists
    if (query.trim()) {
      const q = query.trim();
      arr = arr.filter((p) => {
        // Search across multiple product fields - ADDED PAYMENT METHOD
        const searchableFields = [
          p.productId,
          p.name,
          p.model,
          p.category,
          p.company,
          p.supplier,
          p.supplierContact,
          p.invoiceId,
          p.type,
          p.paymentMethod,
        ]
          .filter(Boolean) // Remove null/undefined values
          .map((field) => field.toString())
          .join(" ");

        return searchableFields.includes(q);
      });
    }

    // Apply purchase type filter if not "All"
    if (purchaseTypeFilter !== "All") {
      arr = arr.filter((p) => {
        if (purchaseTypeFilter === "new-purchase") {
          return p.type === "new-purchase";
        } else if (purchaseTypeFilter === "stock-addition") {
          return p.type === "stock-addition";
        }
        return true;
      });
    }

    // Apply company filter if not "All"
    if (companyFilter !== "All") {
      arr = arr.filter((p) => p.company === companyFilter);
    }

    // Apply date range filter if not "all"
    if (dateRangeFilter !== "all") {
      const { start, end } = getDateRange(dateRangeFilter);
      if (start && end) {
        arr = arr.filter((p) => {
          const purchaseDate = parseDateForSorting(
            p.savedOn || p.timestamp || p.date
          );
          return purchaseDate >= start && purchaseDate <= end;
        });
      }
    }

    // Return filtered results - they maintain the original sort order (latest first)
    return arr;
  }, [
    purchaseHistory,
    query,
    purchaseTypeFilter,
    companyFilter,
    dateRangeFilter,
  ]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = filtered.length;
    const newPurchases = filtered.filter(
      (p) => p.type === "new-purchase"
    ).length;
    const stockAdditions = filtered.filter(
      (p) => p.type === "stock-addition"
    ).length;
    const totalQuantity = filtered.reduce(
      (sum, p) => sum + (parseInt(p.quantity) || 0),
      0
    );
    const totalPurchaseValue = filtered.reduce(
      (sum, p) => sum + (parseFloat(p.total) || 0),
      0
    );
    const averagePurchaseValue = total > 0 ? totalPurchaseValue / total : 0;

    return {
      total,
      newPurchases,
      stockAdditions,
      totalQuantity,
      totalPurchaseValue,
      averagePurchaseValue,
    };
  }, [filtered]);

  // Get unique companies for filter dropdown
  const uniqueCompanies = useMemo(() => {
    const companies = [
      ...new Set(purchaseHistory.map((p) => p.company).filter(Boolean)),
    ];
    return companies.sort();
  }, [purchaseHistory]);

  // Toast notification configuration
  const toastConfig = {
    position: "top-right",
    theme: "dark",
    autoClose: 2000,
  };
  const notifySuccess = (msg) => toast.success(msg, toastConfig);
  const notifyError = (msg) => toast.error(msg, toastConfig);

  // Print functionality handler
  const handlePrint = () => {
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.print();
    document.body.style.overflow = bodyOverflow;
  };

  // Generate and download Excel report
  const handleDownloadReport = () => {
    if (filtered.length === 0) {
      notifyError("No data available to export");
      return;
    }

    const success = exportToExcel(
      filtered,
      `purchase-report-${new Date().toISOString().split("T")[0]}`
    );
    if (success) {
      notifySuccess("Purchase report exported successfully.");
    }
  };

  // Open report summary modal
  const handleOpenReport = () => {
    setIsReportOpen(true);
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
            PURCHASE DETAILS
          </h1>
          <p className="text-white/80">
            ANALYZE AND EXPORT PURCHASE DATA WITH ADVANCED FILTERING AND
            REPORTING.
          </p>
        </div>

        {/* Search and filter panel */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-md p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Search input with icon */}
          <div className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 md:col-span-2">
            <SearchIcon className="text-white" />
            <input
              value={query}
              onChange={(e) => {
                const value = e.target.value;
                // Capitalize first letter of every word
                const formattedValue = value.replace(/\b\w/g, (char) =>
                  char.toUpperCase()
                );
                setQuery(formattedValue);
              }}
              placeholder="SEARCH PURCHASES..."
              className="flex-1 outline-none bg-transparent text-white placeholder-white/60"
            />
          </div>

          {/* Purchase Type filter dropdown */}
          <div className="flex items-center gap-2 justify-between">
            <label className="text-sm text-white/70">TYPE</label>
            <select
              value={purchaseTypeFilter}
              onChange={(e) => setPurchaseTypeFilter(e.target.value)}
              className="p-2 border border-white/10 rounded bg-white/10 text-white flex-1  scrollbar-hide"
            >
              <option value="All" className="bg-black/95 text-white">
                ALL
              </option>
              <option value="new-purchase" className="bg-black/95 text-white">
                New Purchase
              </option>
              <option value="stock-addition" className="bg-black/95 text-white">
                Stock Addition
              </option>
            </select>
          </div>

          {/* Company filter dropdown */}
          <div className="flex items-center gap-2 justify-between">
            <label className="text-sm text-white/70">COMPANY</label>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="p-2 border border-white/10 rounded bg-white/10 text-white flex-1  scrollbar-hide"
            >
              <option value="All" className="bg-black/95 text-white">
                ALL
              </option>
              {uniqueCompanies.map((company) => (
                <option
                  key={company}
                  value={company}
                  className="bg-black/95 text-white"
                >
                  {company}
                </option>
              ))}
            </select>
          </div>

          {/* Date range filter dropdown */}
          <div className="flex items-center gap-2 justify-between">
            <label className="text-sm text-white/70">DATE</label>
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="p-2 border border-white/10 rounded bg-white/10 text-white flex-1  scrollbar-hide"
            >
              <option value="all" className="bg-black/95 text-white">
                ALL TIME
              </option>
              <option value="7days" className="bg-black/95 text-white">
                LAST 7 DAYS
              </option>
              <option value="15days" className="bg-black/95 text-white">
                LAST 15 DAYS
              </option>
              <option value="30days" className="bg-black/95 text-white">
                LAST 30 DAYS
              </option>
              <option value="90days" className="bg-black/95 text-white">
                LAST 90 DAYS
              </option>
            </select>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 justify-end">
          <button
            onClick={handleOpenReport}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md border border-purple-500/30 transition-colors flex items-center gap-2"
          >
            <FilterListIcon fontSize="small" />
            VIEW REPORT SUMMARY
          </button>
          <button
            onClick={handleDownloadReport}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md border border-green-500/30 transition-colors flex items-center gap-2"
          >
            <Download size={18} />
            EXPORT TO EXCEL
          </button>
        </div>

        {/* Main data table container */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-md overflow-x-auto scrollbar-hide ">
          {/* Purchase history table */}
          <table className="w-full text-white/90 min-w-[1200px]">
            {/* Table header with column labels - ADDED PAYMENT METHOD COLUMN */}
            <thead className="bg-white/10 text-left text-sm">
              <tr>
                <th className="p-3">INVOICE</th>
                <th className="p-3">NAME</th>
                <th className="p-3">TYPE</th>
                <th className="p-3">QTY</th>
                <th className="p-3">PRICE</th>
                <th className="p-3">PAYMENT METHOD</th>{" "}
                {/* ADDED THIS COLUMN */}
                <th className="p-3">DATE</th>
                <th className="p-3">ACTIONS</th>
              </tr>
            </thead>
            {/* Table body with purchase records - LATEST PURCHASES ON TOP */}
            <tbody>
              {/* Map through filtered purchase records */}
              {filtered.map((p) => (
                <tr
                  key={`${p.invoiceId}-${p.productId}`} // Unique key for each row
                  className={`border-t border-white/5 transition 
        ${
          p.type === "stock-addition"
            ? " bg-blue-700/30 hover:bg-blue-700/50"
            : " bg-green-700/30 hover:bg-green-700/50"
        }`} 
                >
                  {/* Invoice ID column */}
                  <td className="p-3 font-mono">{p.invoiceId}</td>

                  {/* Product name column */}
                  <td className="p-3">{p.name}</td>
                  {/* Purchase type with colored badge */}
                  <td className="p-3">
                    <span
                      className={`px-2 py-1  text-xs text-white border border-white/30 rounded-full ${
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
                  <td className="p-3">Rs: {p.price}/-</td>

                  {/* Payment Method column - ADDED THIS COLUMN */}
                  <td className="p-3 text-sm">
                    {p.paymentMethod ? p.paymentMethod : "—"}
                  </td>
                  {/* Date column with short format */}
                  <td className="p-3 text-sm">{formatShortDate(p.savedOn)}</td>
                  {/* Actions column with view button */}
                  <td className="p-3 flex gap-2">
                    <button
                      title="VIEW"
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
                  <td colSpan="11" className="p-4 text-center text-white/70">
                    NO PURCHASE RECORDS FOUND.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product view details modal */}
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
                  PURCHASE & INVOICE DETAILS
                </p>
                <div className="mt-1 space-y-1">
                  <p className="text-xs font-semibold text-gray-700">
                    INVOICE: {selectedProduct.invoiceId}
                  </p>
                  {/* Purchase type badge */}
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                      selectedProduct.type === "stock-addition"
                        ? "bg-blue-600 text-white border border-blue-900"
                        : "bg-green-600 text-white border border-green-900"
                    }`}
                  >
                    {getPurchaseType(selectedProduct)}
                  </span>
                </div>
              </div>

              {/* Product details section */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">PRODUCT ID:</span>
                  <span className="text-gray-900 text-right font-mono">
                    {selectedProduct.productId}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">NAME:</span>
                  <span className="text-gray-900 text-right">
                    {selectedProduct.name}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">MODEL:</span>
                  <span className="text-gray-900 text-right">
                    {selectedProduct.model}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">CATEGORY:</span>
                  <span className="text-gray-900 text-right">
                    {selectedProduct.category}
                  </span>
                </div>
              </div>

              {/* Purchase details section */}
              <div className="border-t border-dashed border-gray-300 pt-3 mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">QUANTITY:</span>
                  <span className="text-gray-900 text-right">
                    {selectedProduct.quantity} PIECE(S)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    PURCHASE PRICE:
                  </span>
                  <span className="text-gray-900 text-right">
                    Rs: {selectedProduct.price}/-
                  </span>
                </div>
                {/* Payment Method section - ADDED THIS SECTION */}
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    PAYMENT METHOD:
                  </span>
                  <span className="text-gray-900 text-right">
                    {selectedProduct.paymentMethod
                      ? selectedProduct.paymentMethod
                      : "—"}
                  </span>
                </div>
              </div>

              {/* Total value highlight section */}
              <div className="bg-blue-200 border border-blue-900 rounded-md p-2 mt-3">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-bold text-blue-900">
                    PURCHASE VALUE:
                  </span>
                  <span className="font-bold text-blue-900  text-right">
                    Rs: {selectedProduct.total}/-
                  </span>
                </div>
              </div>

              {/* Supplier information section */}
              <div className="border-t border-dashed border-gray-300 pt-3 mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">COMPANY:</span>
                  <span className="text-gray-900 text-right">
                    {selectedProduct.company}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">SUPPLIER:</span>
                  <span className="text-gray-900 text-right">
                    {selectedProduct.supplier}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    SUPPLIER CONTACT:
                  </span>
                  <span className="text-gray-900 text-right">
                    {selectedProduct.supplierContact}
                  </span>
                </div>
              </div>

              {/* Timestamp information */}
              <div className="text-xs text-gray-500 italic border-t border-dashed border-gray-300 pt-3 mt-3">
                <div className="grid grid-cols-2 gap-2">
                  <span>PURCHASE DATE:</span>
                  <span className="text-right">
                    {formatDateTime(selectedProduct.savedOn)}
                  </span>
                </div>
                {/* Show update timestamp if available */}
                {selectedProduct.updatedAt && (
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <span>LAST UPDATED:</span>
                    <span className="text-right">
                      {formatDateTime(selectedProduct.updatedAt)}
                    </span>
                  </div>
                )}
              </div>

              {/* Footer disclaimer */}
              <div className="text-center border-t border-dashed border-gray-300 pt-4 text-xs text-gray-600">
                <p>THIS IS A COMPUTER-GENERATED PURCHASE RECORD.</p>
                <p>CONTAINS INVOICE AND PURCHASE DETAILS ONLY.</p>
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
                  <span>PRINT</span>
                </button>

                {/* Close modal button */}
                <button
                  onClick={() => setIsViewOpen(false)}
                  className="px-4 py-2 rounded bg-gray-600 cursor-pointer text-white hover:bg-gray-700 transition font-medium"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Summary Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-2 md:p-4 backdrop-blur-md print:p-0">
          <div className="bg-white text-black rounded-lg w-full max-w-2xl mx-auto max-h-[95vh] overflow-y-auto scrollbar-hide relative font-sans text-sm border border-gray-300">
            <div className="p-6 space-y-6">
              {/* Report Header */}
              <div className="text-center border-b border-dashed border-gray-300 pb-4">
                <h2 className="text-2xl font-bold tracking-wider text-gray-900">
                  ZUBI ELECTRONICS
                </h2>
                <p className="text-lg text-gray-600 mt-1">
                  PURCHASE REPORT SUMMARY
                </p>
                <div className="mt-3 space-y-1 text-sm">
                  <p className="font-semibold text-gray-700">
                    REPORT GENERATED: {formatDateTime(new Date())}
                  </p>
                  <p className="text-gray-600">
                    Total Records: {filtered.length} | Date Range:{" "}
                    {dateRangeFilter === "all"
                      ? "All Time"
                      : dateRangeFilter === "7days"
                      ? "Last 7 Days"
                      : dateRangeFilter === "15days"
                      ? "Last 15 Days"
                      : dateRangeFilter === "30days"
                      ? "Last 30 Days"
                      : "Last 90 Days"}
                  </p>
                </div>
              </div>

              {/* Statistics Summary */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-900">
                    {stats.total}
                  </div>
                  <div className="text-blue-700 text-sm">TOTAL PURCHASES</div>
                </div>
                <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-900">
                    {stats.newPurchases}
                  </div>
                  <div className="text-green-700 text-sm">NEW PURCHASES</div>
                </div>
                <div className="bg-teal-100 border border-teal-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-teal-900">
                    {stats.stockAdditions}
                  </div>
                  <div className="text-teal-700 text-sm">STOCK ADDITIONS</div>
                </div>
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-900">
                    {stats.totalQuantity}
                  </div>
                  <div className="text-yellow-700 text-sm">TOTAL QUANTITY</div>
                </div>
                <div className="bg-purple-100 border border-purple-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-900">
                    Rs: {stats.totalPurchaseValue.toLocaleString()}/-
                  </div>
                  <div className="text-purple-700 text-sm">TOTAL VALUE</div>
                </div>
                <div className="bg-indigo-100 border border-indigo-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-900">
                    Rs: {stats.averagePurchaseValue.toFixed(2)}/-
                  </div>
                  <div className="text-indigo-700 text-sm">AVG PURCHASE</div>
                </div>
              </div>

              {/* Footer Information */}
              <div className="text-center border-t border-dashed border-gray-300 pt-4 text-xs text-gray-600">
                <p>THIS IS A COMPUTER-GENERATED PURCHASE REPORT.</p>
                <p>CONTAINS CONFIDENTIAL BUSINESS INFORMATION.</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 rounded-b-lg p-4 print:hidden">
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded bg-blue-600 cursor-pointer text-white hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <Printer size={18} />
                  PRINT REPORT
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="px-4 py-2 rounded bg-green-600 cursor-pointer text-white hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  EXPORT TO EXCEL
                </button>
                <button
                  onClick={() => setIsReportOpen(false)}
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
