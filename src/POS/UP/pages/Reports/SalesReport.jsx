// |===============================| SalesReports Component |===============================|
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

// Currency formatter function with 2 decimal places
const formatCurrency = (amount) => {
  if (!amount || isNaN(amount)) return "Rs 0.00";
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
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
    case '7days':
      start.setDate(now.getDate() - 7);
      break;
    case '15days':
      start.setDate(now.getDate() - 15);
      break;
    case '30days':
      start.setDate(now.getDate() - 30);
      break;
    case '90days':
      start.setDate(now.getDate() - 90);
      break;
    case 'all':
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
    // Define CSV headers
    const headers = [
      'Invoice ID',
      'Product Name',
      'Product Model',
      'Product Category',
      'Sale Type',
      'Payment Method',
      'Quantity',
      'Unit Price',
      'Sale Price',
      'Discount',
      'Discount Amount',
      'Markup',
      'Markup Amount',
      'Final Total',
      'Customer ID',
      'Customer Name',
      'Guarantor ID',
      'Guarantor Name',
      'Plan Months',
      'Advance Payment',
      'Remaining Amount',
      'Monthly Payment',
      'Date'
    ];

    // Convert data to CSV rows
    const csvRows = data.map(sale => [
      sale.invoiceId,
      sale.productName,
      sale.productModel,
      sale.productCategory,
      getSaleType(sale),
      getPaymentMethodDisplay(sale),
      getDisplayQuantity(sale),
      sale.unitPrice || sale.salePrice,
      sale.salePrice,
      sale.discount || 0,
      sale.discountAmount || 0,
      sale.markup || 0,
      sale.markupAmount || 0,
      sale.finalTotal,
      sale.customerId || '',
      sale.customer || '',
      sale.guarantorId || '',
      sale.guarantor || '',
      sale.planMonths || 0,
      sale.advancePaymentAmount || 0,
      sale.remainingAmount || 0,
      sale.monthlyPayment || 0,
      formatShortDate(sale.timestamp)
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    toast.error('Failed to export data');
    return false;
  }
};

// Load sales history from localStorage with enhanced sorting by date
const loadSalesHistory = () => {
  try {
    // Retrieve sales history from localStorage or initialize empty array
    const salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];

    // Enhanced sort sales history by date (newest first)
    return salesHistory.sort((a, b) => {
      try {
        // Extract dates from multiple possible fields with fallbacks
        const dateA = parseDateForSorting(
          a.timestamp || a.savedOn || a.date || a.createdAt
        );
        const dateB = parseDateForSorting(
          b.timestamp || b.savedOn || b.date || b.createdAt
        );

        const timestampA = dateA.getTime();
        const timestampB = dateB.getTime();

        // Sort descending (newest first) - LATEST RECEIPTS ON TOP
        return timestampB - timestampA;
      } catch (error) {
        console.error("Sorting error for items:", a, b, error);
        return 0;
      }
    });
  } catch (error) {
    console.error("Error loading sales history from localStorage:", error);
    return [];
  }
};

// Payment method display formatter
const getPaymentMethodDisplay = (sale) => {
  // If paymentMethod exists in the sale object, use it
  if (sale.paymentMethod) {
    const methodMap = {
      cash: "Cash",
      hbl: "HBL Bank",
      jazzcash: "JazzCash",
      easypaisa: "Easy Paisa",
      meezan: "Meezan Bank",
    };
    return methodMap[sale.paymentMethod] || sale.paymentMethod;
  }

  // Fallback removed since customerType is no longer available
  return "Payment Method";
};

// Payment method background color formatter
const getPaymentMethodColor = (sale) => {
  const paymentMethod = sale.paymentMethod;

  switch (paymentMethod) {
    case "meezan":
      return "bg-purple-950/50";
    case "hbl":
      return "bg-cyan-800/50";
    case "easypaisa":
      return "bg-green-700/50";
    case "jazzcash":
      return "bg-red-700/50";
    case "cash":
      return "bg-blue-600/50";
    default:
      return "bg-orange-600/50";
  }
};

// Sale type detection based on invoice ID
const getSaleTypeFromInvoice = (invoiceId) => {
  if (!invoiceId) return "unknown";

  if (invoiceId.startsWith("CASH-")) {
    return "cash-sale";
  } else if (invoiceId.startsWith("INST-")) {
    return "installment-sale";
  }
  return "unknown";
};

// Get quantity for display - handles both old and new quantity fields
const getDisplayQuantity = (sale) => {
  // NEW: Check for quantity field (from updated installment sales)
  if (sale.quantity !== undefined && sale.quantity !== null) {
    return sale.quantity;
  }

  // OLD: Check for quantitySold field (from older sales)
  if (sale.quantitySold !== undefined && sale.quantitySold !== null) {
    return sale.quantitySold;
  }

  // Default to 1 if no quantity field found
  return 1;
};

// Helper function to convert text to uppercase
const toUpperCase = (text) => {
  if (!text || typeof text !== 'string') return text;
  return text;
};

// Sale type display formatter
const getSaleType = (sale) => {
  // First check if type is explicitly set
  if (sale.type) {
    return sale.type === "cash-sale" ? "CASH SALE" : "INSTALLMENT SALE";
  }

  // Fallback to invoice-based detection
  const detectedType = getSaleTypeFromInvoice(sale.invoiceId);
  return detectedType === "cash-sale" ? "CASH SALE" : "INSTALLMENT SALE";
};

// Sale type badge color formatter
const getSaleTypeColor = (sale) => {
  // First check if type is explicitly set
  if (sale.type) {
    return sale.type === "cash-sale" ? "bg-green-600" : "bg-purple-600";
  }

  // Fallback to invoice-based detection
  const detectedType = getSaleTypeFromInvoice(sale.invoiceId);
  return detectedType === "cash-sale" ? "bg-green-600" : "bg-purple-600";
};

// Get actual sale type for internal use
const getActualSaleType = (sale) => {
  if (sale.type) return sale.type;
  return getSaleTypeFromInvoice(sale.invoiceId);
};

// Check if sale is installment type
const isInstallmentSale = (sale) => {
  return getActualSaleType(sale) === "installment-sale";
};

// Main SalesReports component function
export default function SalesReport() {
  // State management for sales history data
  const [salesHistory, setSalesHistory] = useState(loadSalesHistory);

  // State for search query
  const [query, setQuery] = useState("");

  // State for sale type filtering
  const [saleTypeFilter, setSaleTypeFilter] = useState("All");

  // State for payment method filtering
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All");

  // State for date range filtering
  const [dateRangeFilter, setDateRangeFilter] = useState("all");

  // State for modal visibility
  const [isViewOpen, setIsViewOpen] = useState(false);

  // State for report modal visibility
  const [isReportOpen, setIsReportOpen] = useState(false);

  // State for currently selected sale details
  const [selectedSale, setSelectedSale] = useState(null);

  // Effect hook to handle localStorage changes and initial data loading
  useEffect(() => {
    // Event handler for storage changes (other tabs/windows)
    const handleStorage = () => {
      setSalesHistory(loadSalesHistory());
    };
    window.addEventListener("storage", handleStorage);

    // Load initial data
    setSalesHistory(loadSalesHistory());

    // Cleanup event listener on component unmount
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Memoized filtered sales history based on search query and filters
  const filtered = useMemo(() => {
    let arr = salesHistory.slice(); // Start with already sorted array

    // Apply search filter if query exists
    if (query.trim()) {
      const q = query;
      arr = arr.filter((sale) =>
        // Search across multiple sale fields
        [
          sale.invoiceId,
          sale.productName,
          sale.productModel,
          sale.productCategory,
          sale.type,
          sale.paymentMethod,
          sale.customerId,
          sale.customer,
          sale.guarantorId,
          sale.guarantor,
        ]
          .join(" ")
          
          .includes(q)
      );
    }

    // Apply sale type filter if not "All"
    if (saleTypeFilter !== "All") {
      arr = arr.filter((sale) => {
        const saleType = getActualSaleType(sale);
        return saleTypeFilter === "cash-sale" ? saleType === "cash-sale" : saleType === "installment-sale";
      });
    }

    // Apply payment method filter if not "All"
    if (paymentMethodFilter !== "All") {
      arr = arr.filter((sale) => sale.paymentMethod === paymentMethodFilter);
    }

    // Apply date range filter if not "all"
    if (dateRangeFilter !== "all") {
      const { start, end } = getDateRange(dateRangeFilter);
      if (start && end) {
        arr = arr.filter((sale) => {
          const saleDate = new Date(sale.timestamp || sale.savedOn || sale.date || sale.createdAt);
          return saleDate >= start && saleDate <= end;
        });
      }
    }

    // Return filtered results - they maintain the original sort order
    return arr;
  }, [salesHistory, query, saleTypeFilter, paymentMethodFilter, dateRangeFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = filtered.length;
    const cashSales = filtered.filter(sale => getActualSaleType(sale) === 'cash-sale').length;
    const installmentSales = filtered.filter(sale => getActualSaleType(sale) === 'installment-sale').length;
    const totalRevenue = filtered.reduce((sum, sale) => sum + (sale.finalTotal || 0), 0);
    const cashRevenue = filtered
      .filter(sale => getActualSaleType(sale) === 'cash-sale')
      .reduce((sum, sale) => sum + (sale.finalTotal || 0), 0);
    const installmentRevenue = filtered
      .filter(sale => getActualSaleType(sale) === 'installment-sale')
      .reduce((sum, sale) => sum + (sale.finalTotal || 0), 0);
    
    return { 
      total, 
      cashSales, 
      installmentSales, 
      totalRevenue, 
      cashRevenue, 
      installmentRevenue 
    };
  }, [filtered]);

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

    const success = exportToExcel(filtered, `sales-report-${new Date().toISOString().split('T')[0]}`);
    if (success) {
      notifySuccess("SALES REPORT EXPORTED TO EXCEL SUCCESSFULLY");
    }
  };

  // Open report summary modal
  const handleOpenReport = () => {
    setIsReportOpen(true);
  };

  // Render installment-specific details
  const renderInstallmentDetails = (sale) => {
    if (!isInstallmentSale(sale)) return null;

    return (
      <>
        {/* Customer and Guarantor Information */}
        <div className="border-t border-dashed border-gray-300 pt-3 mt-3 space-y-2">
          {sale.customerId && (
            <div className="grid grid-cols-2 gap-2">
              <span className="font-medium text-gray-700">CUSTOMER ID:</span>
              <span className="text-gray-900 text-right font-mono">
                {toUpperCase(sale.customerId)} {toUpperCase(sale.customer || "—")}
              </span>
            </div>
          )}

          {sale.guarantorId && (
            <div className="grid grid-cols-2 gap-2">
              <span className="font-medium text-gray-700">GUARANTOR ID:</span>
              <span className="text-gray-900 text-right font-mono">
                {toUpperCase(sale.guarantorId)} {toUpperCase(sale.guarantor || "—")}
              </span>
            </div>
          )}
        </div>

        {/* Installment Plan Details */}
        <div className="border-t border-dashed border-gray-300 pt-3 mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <span className="font-medium text-gray-700">PAYMENT PLAN:</span>
            <span className="text-gray-900 text-right">
              {sale.planMonths || 0} MONTHS
            </span>
          </div>

          {sale.advancePaymentAmount > 0 && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium text-gray-700">
                  ADVANCE PAYMENT:
                </span>
                <span className="text-gray-900 text-right">
                  {formatCurrency(sale.advancePaymentAmount)}/-
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium text-gray-700">
                  REMAINING AMOUNT:
                </span>
                <span className="text-gray-900 text-right font-semibold">
                  {formatCurrency(sale.remainingAmount || 0)}/-
                </span>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-2 border-t border-dashed border-gray-300 pt-2 mt-2">
            <span className="font-medium text-gray-700">MONTHLY PAYMENT:</span>
            <span className="text-gray-900 text-right font-semibold">
              {formatCurrency(sale.monthlyPayment || 0)}/-
            </span>
          </div>
        </div>

        {/* Payment Timeline Summary */}
        {sale.paymentTimeline && sale.paymentTimeline.length > 0 && (
          <div className="border-t border-dashed border-gray-300 pt-3 mt-3">
            <h4 className="font-medium text-gray-700 mb-2">
              PAYMENT SCHEDULE:
            </h4>
            <div className="text-xs text-gray-600 space-y-1">
              {sale.paymentTimeline.slice(0, 3).map((payment, index) => (
                <div key={index} className="flex justify-between">
                  <span>PAYMENT {payment.paymentNumber}:</span>
                  <span>
                    {payment.dueDate} - {formatCurrency(payment.paymentAmount)}
                  </span>
                </div>
              ))}
              {sale.paymentTimeline.length > 3 && (
                <div className="text-center text-gray-500 italic">
                  ... AND {sale.paymentTimeline.length - 3} MORE PAYMENTS
                </div>
              )}
            </div>
          </div>
        )}
      </>
    );
  };

  // Render cash sale details
  const renderCashSaleDetails = (sale) => {
    if (isInstallmentSale(sale)) return null;

    return (
      <>
        {/* Customer Information for Cash Sales */}
        <div className="border-t border-dashed border-gray-300 pt-3 mt-3 space-y-2">
          {sale.customer && (
            <div className="grid grid-cols-2 gap-2">
              <span className="font-medium text-gray-700">CUSTOMER:</span>
              <span className="text-gray-900 text-right">{toUpperCase(sale.customer)}</span>
            </div>
          )}
        </div>
      </>
    );
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
          <h1 className="text-3xl font-bold text-white mb-2">SALES REPORTS</h1>
          <p className="text-white/80">
            ANALYZE AND EXPORT SALES DATA WITH ADVANCED FILTERING AND REPORTING.
          </p>
        </div>

        {/* Search and filter panel */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-md p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Search input with icon */}
          <div className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 md:col-span-2">
            <SearchIcon className="text-white" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH SALES..."
              className="flex-1 outline-none bg-transparent text-white placeholder-white/60"
            />
          </div>

          {/* Sale Type filter dropdown */}
          <div className="flex items-center gap-2 justify-between">
            <label className="text-sm text-white/70">SALE TYPE</label>
            <select
              value={saleTypeFilter}
              onChange={(e) => setSaleTypeFilter(e.target.value)}
              className="p-2 border border-white/10 rounded bg-white/10 text-white flex-1"
            >
              <option className="bg-black/95 text-white">ALL</option>
              <option value="cash-sale" className="bg-black/95 text-white">CASH SALE</option>
              <option value="installment-sale" className="bg-black/95 text-white">INSTALLMENT SALE</option>
            </select>
          </div>

          {/* Payment Method filter dropdown */}
          <div className="flex items-center gap-2 justify-between">
            <label className="text-sm text-white/70">PAYMENT METHOD</label>
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="p-2 border border-white/10 rounded bg-white/10 text-white flex-1"
            >
              <option className="bg-black/95 text-white">ALL</option>
              <option value="cash" className="bg-black/95 text-white">CASH</option>
              <option value="hbl" className="bg-black/95 text-white">HBL BANK</option>
              <option value="meezan" className="bg-black/95 text-white">MEEZAN BANK</option>
              <option value="easypaisa" className="bg-black/95 text-white">EASY PAISA</option>
              <option value="jazzcash" className="bg-black/95 text-white">JAZZ CASH</option>
            </select>
          </div>

          {/* Date range filter dropdown */}
          <div className="flex items-center gap-2 justify-between">
            <label className="text-sm text-white/70">DATE RANGE</label>
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="p-2 border border-white/10 rounded bg-white/10 text-white flex-1"
            >
              <option value="all" className="bg-black/95 text-white">ALL TIME</option>
              <option value="7days" className="bg-black/95 text-white">LAST 7 DAYS</option>
              <option value="15days" className="bg-black/95 text-white">LAST 15 DAYS</option>
              <option value="30days" className="bg-black/95 text-white">LAST 30 DAYS</option>
              <option value="90days" className="bg-black/95 text-white">LAST 90 DAYS</option>
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
          {/* Sales history table */}
          <table className="w-full text-white/90 min-w-[800px]">
            {/* Table header with column labels */}
            <thead className="bg-white/10 text-left text-sm">
              <tr>
                <th className="p-3">INVOICE</th>
                <th className="p-3">PRODUCT</th>
                <th className="p-3">SALE TYPE</th>
                <th className="p-3">PAYMENT METHOD</th>
                <th className="p-3">FINAL TOTAL</th>
                <th className="p-3">DATE</th>
                <th className="p-3">ACTIONS</th>
              </tr>
            </thead>

            {/* Table body with sales records - LATEST RECEIPTS ON TOP */}
            <tbody>
              {/* Map through filtered sales records */}
              {filtered.map((sale) => (
                <tr
                  key={`${sale.invoiceId}-${sale.productId}-${sale.timestamp}`}
                  className={`border-t border-white/5 transition 
        ${
          // Different hover colors based on sale type
          getActualSaleType(sale) === "cash-sale"
            ? "hover:bg-green-600/50"
            : "hover:bg-purple-600/50"
        }`}
                >
                  {/* Invoice ID column */}
                  <td className="p-3 font-mono">{toUpperCase(sale.invoiceId)}</td>

                  {/* Product name column */}
                  <td className="p-3">{toUpperCase(sale.productName)}</td>

                  {/* Sale Type with colored badge */}
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs border rounded-full border-white/30 ${getSaleTypeColor(
                        sale
                      )}`}
                    >
                      {getSaleType(sale)}
                    </span>
                  </td>

                  {/* Payment method column */}
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs border rounded-full border-white/30 ${getPaymentMethodColor(
                        sale
                      )}`}
                    >
                      {toUpperCase(getPaymentMethodDisplay(sale))}
                    </span>
                  </td>

                  {/* Final total column */}
                  <td className="p-3 font-semibold">
                    {formatCurrency(sale.finalTotal)}
                  </td>

                  {/* Date column with short format */}
                  <td className="p-3 text-sm">
                    {formatShortDate(sale.timestamp)}
                  </td>

                  {/* Actions column with view button */}
                  <td className="p-3 flex gap-2">
                    <button
                      title="VIEW"
                      onClick={() => {
                        setSelectedSale(sale);
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
                  <td colSpan="7" className="p-4 text-center text-white/70">
                    NO SALES RECORDS FOUND.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sale details modal */}
      {isViewOpen && selectedSale && (
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
                  {isInstallmentSale(selectedSale)
                    ? "INSTALLMENT SALE RECEIPT"
                    : "SALES INVOICE DETAILS"}
                </p>
                {/* Timestamp information */}
                <p className="text-xs text-gray-600">
                  {formatDateTime(selectedSale.timestamp)}
                </p>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-700">
                    INVOICE: {toUpperCase(selectedSale.invoiceId)}
                  </p>
                  {/* Sale Type badge */}
                  <span
                    className={`inline-block px-2 py-1 my-1 rounded-full text-xs ${getSaleTypeColor(
                      selectedSale
                    )} text-white border border-gray-700/40`}
                  >
                    {getSaleType(selectedSale)}
                  </span>
                </div>
              </div>

              {/* Product details section */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">PRODUCT ID:</span>
                  <span className="text-gray-900 text-right font-mono">
                    {toUpperCase(selectedSale.productId)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">NAME:</span>
                  <span className="text-gray-900 text-right">
                    {toUpperCase(selectedSale.productName)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">MODEL:</span>
                  <span className="text-gray-900 text-right">
                    {toUpperCase(selectedSale.productModel)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">CATEGORY:</span>
                  <span className="text-gray-900 text-right">
                    {toUpperCase(selectedSale.productCategory)}
                  </span>
                </div>
              </div>

              {/* Sale details section */}
              <div className="border-t border-dashed border-gray-300 pt-3 mt-3 space-y-2">
                {/* UPDATED: Quantity display using getDisplayQuantity function */}
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">QUANTITY:</span>
                  <span className="text-gray-900 text-right">
                    {getDisplayQuantity(selectedSale)} PIECE(S)
                  </span>
                </div>

                {/* UPDATED: Show unit price for installment sales with quantity */}
                {isInstallmentSale(selectedSale) && selectedSale.unitPrice ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium text-gray-700">
                        UNIT PRICE:
                      </span>
                      <span className="text-gray-900 text-right">
                        {formatCurrency(selectedSale.unitPrice)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium text-gray-700">
                        TOTAL PRICE:
                      </span>
                      <span className="text-gray-900 text-right font-semibold">
                        {formatCurrency(selectedSale.salePrice)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-medium text-gray-700">
                      UNIT PRICE:
                    </span>
                    <span className="text-gray-900 text-right">
                      {formatCurrency(selectedSale.salePrice)}
                    </span>
                  </div>
                )}

                {selectedSale.discount > 0 && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium text-gray-700">
                        DISCOUNT:
                      </span>
                      <span className="text-gray-900 text-right">
                        {selectedSale.discount}% (
                        {formatCurrency(selectedSale.discountAmount || 0)})
                      </span>
                    </div>
                  </>
                )}

                {/* FIXED: Markup display for installment sales - Show for all sales types if markup exists */}
                {((selectedSale.markup && selectedSale.markup > 0) ||
                  (selectedSale.markupAmount &&
                    selectedSale.markupAmount > 0)) && (
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-medium text-gray-700">MARKUP:</span>
                    <span className="text-gray-900 text-right">
                      {selectedSale.markup || 0}% (
                      {formatCurrency(selectedSale.markupAmount || 0)})
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    PAYMENT METHOD:
                  </span>
                  <span className="text-gray-900 text-right">
                    <span
                      className={`px-2 py-1 text-xs rounded-full text-white ${getPaymentMethodColor(
                        selectedSale
                      )}`}
                    >
                      {toUpperCase(getPaymentMethodDisplay(selectedSale))}
                    </span>
                  </span>
                </div>
              </div>

              {/* Render type-specific details */}
              {isInstallmentSale(selectedSale)
                ? renderInstallmentDetails(selectedSale)
                : renderCashSaleDetails(selectedSale)}

              {/* Total value highlight section */}
              <div className="bg-green-100 border border-green-200 rounded-md p-2 mb-6 ">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-bold text-green-900">FINAL TOTAL:</span>
                  <span className="font-bold text-green-900 text-right">
                    {formatCurrency(selectedSale.finalTotal)}
                  </span>
                </div>
              </div>

              {/* Footer disclaimer */}
              <div className="text-center border-t border-dashed border-gray-300 pt-4 text-xs text-gray-600">
                <p>THANK YOU FOR YOUR BUSINESS!</p>
                <p>THIS IS A COMPUTER-GENERATED SALES RECEIPT.</p>
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
                  SALES REPORT SUMMARY
                </p>
                <div className="mt-3 space-y-1 text-sm">
                  <p className="font-semibold text-gray-700">
                    REPORT GENERATED: {formatDateTime(new Date())}
                  </p>
                  <p className="text-gray-600">
                    Total Records: {filtered.length} | Date Range: {
                      dateRangeFilter === 'all' ? 'All Time' :
                      dateRangeFilter === '7days' ? 'Last 7 Days' :
                      dateRangeFilter === '15days' ? 'Last 15 Days' :
                      dateRangeFilter === '30days' ? 'Last 30 Days' : 'Last 90 Days'
                    }
                  </p>
                </div>
              </div>

              {/* Statistics Summary */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-900">{stats.total}</div>
                  <div className="text-blue-700 text-sm">TOTAL SALES</div>
                </div>
                <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-900">{stats.cashSales}</div>
                  <div className="text-green-700 text-sm">CASH SALES</div>
                </div>
                <div className="bg-purple-100 border border-purple-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-900">{stats.installmentSales}</div>
                  <div className="text-purple-700 text-sm">INSTALLMENT SALES</div>
                </div>
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-900">{formatCurrency(stats.totalRevenue)}</div>
                  <div className="text-yellow-700 text-sm">TOTAL REVENUE</div>
                </div>
                <div className="bg-teal-100 border border-teal-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-teal-900">{formatCurrency(stats.cashRevenue)}</div>
                  <div className="text-teal-700 text-sm">CASH REVENUE</div>
                </div>
                <div className="bg-indigo-100 border border-indigo-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-900">{formatCurrency(stats.installmentRevenue)}</div>
                  <div className="text-indigo-700 text-sm">INSTALLMENT REVENUE</div>
                </div>
              </div>

              {/* Footer Information */}
              <div className="text-center border-t border-dashed border-gray-300 pt-4 text-xs text-gray-600">
                <p>THIS IS A COMPUTER-GENERATED SALES REPORT.</p>
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