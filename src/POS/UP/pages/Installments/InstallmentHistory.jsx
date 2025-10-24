// |===============================| InstallmentHistory Component |===============================|
// Import necessary React hooks and external libraries
import React, { useState, useEffect, useMemo } from "react";
import { Receipt } from "lucide-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";

// Date formatting utility function - converts date to standardized string
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

// Load payment history from localStorage with enhanced sorting
const loadPaymentHistory = () => {
  try {
    // Retrieve payment history from localStorage or initialize empty array
    const history = JSON.parse(window.localStorage?.getItem("installmentHistory")) || [];
    
    // Sort by timestamp (newest first)
    return history.sort((a, b) => {
      try {
        const dateA = parseDateForSorting(a.timestamp || a.paymentDate);
        const dateB = parseDateForSorting(b.timestamp || b.paymentDate);
        return dateB.getTime() - dateA.getTime();
      } catch (error) {
        console.error("Sorting error:", error);
        return 0;
      }
    });
  } catch (error) {
    console.error("Error loading payment history from localStorage:", error);
    return [];
  }
};

// Payment method background color formatter
const getPaymentMethodColor = (payment) => {
  const paymentMethod = payment.paymentMethod?.toLowerCase();

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

// Payment method display formatter
const getPaymentMethodDisplay = (payment) => {
  const methodMap = {
    cash: "CASH",
    hbl: "HBL BANK",
    jazzcash: "JAZZCASH",
    easypaisa: "EASY PAISA",
    meezan: "MEEZAN BANK",
  };
  return methodMap[payment.paymentMethod?.toLowerCase()] || payment.paymentMethod?.toUpperCase() || "PAYMENT METHOD";
};

// Main InstallmentHistory component function
export default function InstallmentHistory() {
  // State management for payment history data
  const [paymentHistory, setPaymentHistory] = useState([]);

  // State for search query
  const [query, setQuery] = useState("");

  // State for modal visibility
  const [isViewOpen, setIsViewOpen] = useState(false);

  // State for currently selected receipt details
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Effect hook to handle initial data loading
  useEffect(() => {
    setPaymentHistory(loadPaymentHistory());

    // Event handler for storage changes (other tabs/windows)
    const handleStorage = () => {
      setPaymentHistory(loadPaymentHistory());
    };
    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Memoized filtered payment history based on search query - PRESERVE SORTING
  const filteredHistory = useMemo(() => {
    let arr = paymentHistory.slice(); // Start with already sorted array

    // Apply search filter if query exists
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((payment) =>
        [
          payment.invoiceId,
          payment.customer,
          payment.productName,
          payment.paymentMethod,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    // Return filtered results - they maintain the original sort order
    return arr;
  }, [paymentHistory, query]);

  // Print functionality handler
  const handlePrint = () => {
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.print();
    document.body.style.overflow = bodyOverflow;
  };

  // Handle view receipt action
  const handleViewReceipt = (payment) => {
    setSelectedReceipt(payment);
    setIsViewOpen(true);
  };

  // Handle close modal action
  const handleCloseModal = () => {
    setIsViewOpen(false);
    setSelectedReceipt(null);
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
          <h1 className="text-3xl font-bold text-white mb-2">INSTALLMENT PAYMENT HISTORY</h1>
          <p className="text-white/80">
            View all installment payment records with invoice details. Latest payments shown first.
          </p>
        </div>

        {/* Search and statistics panel */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-md p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
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
            Total Records: {filteredHistory.length}
          </div>
        </div>

        {/* Main data table container */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-md overflow-x-auto scrollbar-hide">
          {/* Payment history table */}
          <table className="w-full text-white/90 min-w-[800px]">
            {/* Table header with column labels */}
            <thead className="bg-white/10 text-left text-sm">
              <tr>
                <th className="p-3">DATE</th>
                <th className="p-3">RECEIPT ID</th>
                <th className="p-3">INVOICE ID</th>
                <th className="p-3">CUSTOMER</th>
                <th className="p-3">PRODUCT</th>
                <th className="p-3">AMOUNT</th>
                <th className="p-3">METHOD</th>
                <th className="p-3">ACTIONS</th>
              </tr>
            </thead>

            {/* Table body with payment records - LATEST PAYMENTS ON TOP */}
            <tbody>
              {/* Map through filtered payment records */}
              {filteredHistory.map((payment) => (
                <tr
                  key={`${payment.id}-${payment.paymentDate}`}
                  className="border-t border-white/5 hover:bg-cyan-600/20 transition"
                >
                  {/* Payment date column */}
                  <td className="p-3">
                    {formatShortDate(payment.paymentDate || payment.timestamp)}
                  </td>

                  {/* Receipt ID column - UPPERCASE */}
                  <td className="p-3 font-mono font-semibold">
                    {payment.receiptId?.toUpperCase() || "—"}
                  </td>

                  {/* Invoice ID column */}
                  <td className="p-3 font-mono">
                    {payment.invoiceId?.toUpperCase()}
                  </td>

                  {/* Customer name column */}
                  <td className="p-3">
                    {payment.customer?.toUpperCase()}
                  </td>

                  {/* Product name column */}
                  <td className="p-3">
                    {payment.productName?.toUpperCase()}
                  </td>

                  {/* Payment amount column */}
                  <td className="p-3 font-semibold">
                    {formatCurrency(payment.paymentAmount)}
                  </td>

                  {/* Payment method column */}
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs border rounded-full border-white/30 ${getPaymentMethodColor(
                        payment
                      )}`}
                    >
                      {getPaymentMethodDisplay(payment)}
                    </span>
                  </td>

                  {/* Actions column with view button */}
                  <td className="p-3 flex gap-2">
                    <button
                      title="View Receipt"
                      onClick={() => handleViewReceipt(payment)}
                      className="p-2 rounded bg-cyan-900 text-white hover:bg-cyan-950 transition-colors cursor-pointer"
                    >
                      <VisibilityIcon fontSize="small" />
                    </button>
                  </td>
                </tr>
              ))}

              {/* Empty state message */}
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan="8" className="p-4 text-center text-white/70">
                    No payment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receipt details modal */}
      {isViewOpen && selectedReceipt && (
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
                  INSTALLMENT PAYMENT RECEIPT
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-semibold text-gray-700">
                    RECEIPT ID: {selectedReceipt.receiptId?.toUpperCase() || selectedReceipt.id?.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatDateTime(selectedReceipt.timestamp || selectedReceipt.paymentDate)}
                  </p>
                </div>
              </div>

              {/* Payment details section */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">INVOICE NO:</span>
                  <span className="text-gray-900 text-right font-mono">
                    {selectedReceipt.invoiceId?.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">CUSTOMER:</span>
                  <span className="text-gray-900 text-right">
                    {selectedReceipt.customer?.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">PRODUCT:</span>
                  <span className="text-gray-900 text-right">
                    {selectedReceipt.productName?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Payment information section */}
              <div className="border-t border-dashed border-gray-300 pt-3 mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">PAYMENT DATE:</span>
                  <span className="text-gray-900 text-right">
                    {formatDateTime(selectedReceipt.paymentDate || selectedReceipt.timestamp)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">PAYMENT METHOD:</span>
                  <span className="text-gray-900 text-right">
                    {getPaymentMethodDisplay(selectedReceipt)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">AMOUNT PAID:</span>
                  <span className="text-gray-900 text-right font-semibold">
                    {formatCurrency(selectedReceipt.paymentAmount)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">REMAINING BALANCE:</span>
                  <span className="text-gray-900 text-right">
                    {formatCurrency(selectedReceipt.remainingAmount || 0)}
                  </span>
                </div>
              </div>

              {/* Total value highlight section */}
              <div className="bg-green-100 border border-green-200 rounded-md p-2 mb-6">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-bold text-green-900">TOTAL PAID:</span>
                  <span className="font-bold text-green-900 text-right">
                    {formatCurrency(selectedReceipt.paymentAmount)}
                  </span>
                </div>
              </div>

              {/* Footer disclaimer */}
              <div className="text-center border-t border-dashed border-gray-300 pt-4 text-xs text-gray-600">
                <p>Thank you for your payment!</p>
                <p>This is a computer-generated receipt.</p>
              </div>
            </div>

            {/* Modal action buttons (sticky footer) */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 rounded-b-lg p-2 print:hidden">
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                {/* Print button */}
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded cursor-pointer bg-blue-600 text-white hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <span>🖨️</span>
                  <span>PRINT</span>
                </button>

                {/* Close modal button */}
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded cursor-pointer bg-gray-600 text-white hover:bg-gray-700 transition font-medium"
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