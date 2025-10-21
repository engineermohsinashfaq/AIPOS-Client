// |===============================| SalesHistory Component |===============================|
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

// Load sales history from localStorage with enhanced sorting by date
const loadSalesHistory = () => {
  try {
    // Retrieve sales history from localStorage or initialize empty array
    const salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];

    // Enhanced sort sales history by date (newest first)
    return salesHistory.sort((a, b) => {
      try {
        // Extract dates from multiple possible fields with fallbacks
        const dateA = parseDateForSorting(a.timestamp || a.savedOn || a.date || a.createdAt);
        const dateB = parseDateForSorting(b.timestamp || b.savedOn || b.date || b.createdAt);
        
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

// Main SalesHistory component function
export default function SalesHistory() {
  // State management for sales history data
  const [salesHistory, setSalesHistory] = useState(loadSalesHistory);

  // State for search query
  const [query, setQuery] = useState("");

  // State for modal visibility
  const [isViewOpen, setIsViewOpen] = useState(false);

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

  // Memoized filtered sales history based on search query - PRESERVE SORTING
  const filtered = useMemo(() => {
    let arr = salesHistory.slice(); // Start with already sorted array

    // Apply search filter if query exists
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((sale) =>
        // Search across multiple sale fields
        [
          sale.invoiceId,
          sale.productId,
          sale.productName,
          sale.productModel,
          sale.productCategory,
          sale.type,
          sale.paymentMethod,
          sale.customer,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    
    // Return filtered results - they maintain the original sort order
    return arr;
  }, [salesHistory, query]);

  // Print functionality handler
  const handlePrint = () => {
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.print();
    document.body.style.overflow = bodyOverflow;
  };

  // Sale type display formatter
  const getSaleType = (sale) => {
    // First check if type is explicitly set
    if (sale.type) {
      return sale.type === "cash-sale" ? "Cash Sale" : "Installment Sale";
    }

    // Fallback to invoice-based detection
    const detectedType = getSaleTypeFromInvoice(sale.invoiceId);
    return detectedType === "cash-sale" ? "Cash Sale" : "Installment Sale";
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

  // Render installment-specific details
  const renderInstallmentDetails = (sale) => {
    if (!isInstallmentSale(sale)) return null;

    return (
      <>
        {/* Customer and Guarantor Information */}
        <div className="border-t border-dashed border-gray-300 pt-3 mt-3 space-y-2">
          {sale.customerId && (
            <div className="grid grid-cols-2 gap-2">
              <span className="font-medium text-gray-700">Customer ID:</span>
              <span className="text-gray-900 text-right font-mono">
                {sale.customerId}
              </span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <span className="font-medium text-gray-700">Customer:</span>
            <span className="text-gray-900 text-right">
              {sale.customer || "—"}
            </span>
          </div>
          {sale.guarantorId && (
            <div className="grid grid-cols-2 gap-2">
              <span className="font-medium text-gray-700">Guarantor ID:</span>
              <span className="text-gray-900 text-right font-mono">
                {sale.guarantorId}
              </span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <span className="font-medium text-gray-700">Guarantor:</span>
            <span className="text-gray-900 text-right">
              {sale.guarantor || "—"}
            </span>
          </div>
          
        </div>

        {/* Installment Plan Details */}
        <div className="border-t border-dashed border-gray-300 pt-3 mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <span className="font-medium text-gray-700">Payment Plan:</span>
            <span className="text-gray-900 text-right">
              {sale.planMonths || 0} months
            </span>
          </div>
          
          {sale.advancePaymentAmount > 0 && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium text-gray-700">Advance Payment:</span>
                <span className="text-gray-900 text-right">
                  {formatCurrency(sale.advancePaymentAmount)}/-
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium text-gray-700">Remaining Amount:</span>
                <span className="text-gray-900 text-right font-semibold">
                  {formatCurrency(sale.remainingAmount || 0)}/-
                </span>
              </div>
            </>
          )}
          
          <div className="grid grid-cols-2 gap-2 border-t border-dashed border-gray-300 pt-2 mt-2">
            <span className="font-medium text-gray-700">Monthly Payment:</span>
            <span className="text-gray-900 text-right font-semibold">
              {formatCurrency(sale.monthlyPayment || 0)}/-
            </span>
          </div>

        </div>

        {/* Payment Timeline Summary */}
        {sale.paymentTimeline && sale.paymentTimeline.length > 0 && (
          <div className="border-t border-dashed border-gray-300 pt-3 mt-3">
            <h4 className="font-medium text-gray-700 mb-2">
              Payment Schedule:
            </h4>
            <div className="text-xs text-gray-600 space-y-1">
              {sale.paymentTimeline.slice(0, 3).map((payment, index) => (
                <div key={index} className="flex justify-between">
                  <span>Payment {payment.paymentNumber}:</span>
                  <span>
                    {payment.dueDate} - {formatCurrency(payment.paymentAmount)}
                  </span>
                </div>
              ))}
              {sale.paymentTimeline.length > 3 && (
                <div className="text-center text-gray-500 italic">
                  ... and {sale.paymentTimeline.length - 3} more payments
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
              <span className="font-medium text-gray-700">Customer:</span>
              <span className="text-gray-900 text-right">
                {sale.customer}
              </span>
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
          <h1 className="text-3xl font-bold text-white mb-2">Sales History</h1>
          <p className="text-white/80">
            View all cash and installment sales records with invoice details. Latest receipts shown first.
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
              placeholder="Search by invoice, product, customer..."
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
          {/* Sales history table */}
          <table className="w-full text-white/90 min-w-[1200px]">
            {/* Table header with column labels */}
            <thead className="bg-white/10 text-left text-sm">
              <tr>
                <th className="p-3">Invoice</th>
                <th className="p-3">P-ID</th>
                <th className="p-3">Product</th>
                <th className="p-3">Sale Type</th>
                <th className="p-3">Payment Method</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Unit Price</th>
                <th className="p-3">Discount</th>
                <th className="p-3">Final Total</th>
                <th className="p-3">Date</th>
                <th className="p-3">Actions</th>
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
                  <td className="p-3 font-mono">{sale.invoiceId}</td>

                  {/* Product ID column */}
                  <td className="p-3 font-mono">{sale.productId}</td>

                  {/* Product name column */}
                  <td className="p-3">{sale.productName?.toUpperCase()}</td>

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
                      {getPaymentMethodDisplay(sale)}
                    </span>
                  </td>

                  {/* Quantity sold column - UPDATED: Uses getDisplayQuantity function */}
                  <td className="p-3">{getDisplayQuantity(sale)}</td>

                  {/* Unit price column */}
                  <td className="p-3">{formatCurrency(sale.salePrice)}</td>

                  {/* Discount column */}
                  <td className="p-3">
                    {sale.discount > 0 ? `${sale.discount}%` : "0%"}
                  </td>

                  {/* Final total column */}
                  <td className="p-3 font-semibold">{formatCurrency(sale.finalTotal)}</td>

                  {/* Date column with short format */}
                  <td className="p-3 text-sm">
                    {formatShortDate(sale.timestamp)}
                  </td>

                  {/* Actions column with view button */}
                  <td className="p-3 flex gap-2">
                    <button
                      title="View"
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
                  <td colSpan="11" className="p-4 text-center text-white/70">
                    No sales records found.
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
                    ? "Installment Sale Receipt" 
                    : "Sales Invoice Details"
                  }
                </p>
                {/* Timestamp information */}
                <p className="text-xs text-gray-600">
                  {formatDateTime(selectedSale.timestamp)}
                </p>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-700">
                    Invoice: {selectedSale.invoiceId}
                  </p>
                  {/* Sale Type badge */}
                  <span
                    className={`inline-block px-2 py-1 my-1 rounded-full text-xs ${getSaleTypeColor(
                      selectedSale
                    )} text-white border border-white/30`}
                  >
                    {getSaleType(selectedSale)}
                  </span>
                </div>
              </div>

              {/* Product details section */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Product ID:</span>
                  <span className="text-gray-900 text-right font-mono">
                    {selectedSale.productId}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="text-gray-900 text-right">
                    {selectedSale.productName?.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Model:</span>
                  <span className="text-gray-900 text-right">
                    {selectedSale.productModel?.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Category:</span>
                  <span className="text-gray-900 text-right">
                    {selectedSale.productCategory?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Sale details section */}
              <div className="border-t border-dashed border-gray-300 pt-3 mt-3 space-y-2">
                {/* UPDATED: Quantity display using getDisplayQuantity function */}
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Quantity:</span>
                  <span className="text-gray-900 text-right">
                    {getDisplayQuantity(selectedSale)} piece(s)
                  </span>
                </div>
                
                {/* UPDATED: Show unit price for installment sales with quantity */}
                {isInstallmentSale(selectedSale) && selectedSale.unitPrice ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium text-gray-700">Unit Price:</span>
                      <span className="text-gray-900 text-right">
                        {formatCurrency(selectedSale.unitPrice)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium text-gray-700">Total Price:</span>
                      <span className="text-gray-900 text-right font-semibold">
                        {formatCurrency(selectedSale.salePrice)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-medium text-gray-700">Unit Price:</span>
                    <span className="text-gray-900 text-right">
                      {formatCurrency(selectedSale.salePrice)}
                    </span>
                  </div>
                )}
                
                {selectedSale.discount > 0 && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium text-gray-700">
                        Discount:
                      </span>
                      <span className="text-gray-900 text-right">
                        {selectedSale.discount}% ({formatCurrency(selectedSale.discountAmount || 0)})
                      </span>
                    </div>
                  </>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    Payment Method:
                  </span>
                  <span className="text-gray-900 text-right">
                    <span
                      className={`px-2 py-1 text-xs rounded-full text-white ${getPaymentMethodColor(
                        selectedSale
                      )}`}
                    >
                      {getPaymentMethodDisplay(selectedSale)}
                    </span>
                  </span>
                </div>
              </div>

              {/* Render type-specific details */}
              {isInstallmentSale(selectedSale) 
                ? renderInstallmentDetails(selectedSale)
                : renderCashSaleDetails(selectedSale)
              }

              {/* Total value highlight section */}
              <div className="bg-green-100 border border-green-200 rounded-md p-2 mb-6 ">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-bold text-green-900">Final Total:</span>
                  <span className="font-bold text-green-900 text-right">
                    {formatCurrency(selectedSale.finalTotal)}
                  </span>
                </div>
              </div>

              {/* Footer disclaimer */}
              <div className="text-center border-t border-dashed border-gray-300 pt-4 text-xs text-gray-600">
                <p>Thank you for your business!</p>
                <p>This is a computer-generated sales receipt.</p>
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