// |===============================| InstallmentReports Component |===============================|
// Import necessary React hooks and external libraries
import React, { useState, useEffect, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Download, Printer } from "lucide-react";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FilterListIcon from "@mui/icons-material/FilterList";

// |===============================| Payment Methods List |===============================|
const PAYMENT_METHODS = [
  "Cash",
  "Credit",
  "Easypaisa",
  "JazzCash",
  "Allied Bank",
  "Askari Bank",
  "Bank AL Habib ",
  "Bank Alfalah",
  "Bank Islami",
  "Bank of Punjab",
  "Bank of Khyber",
  "Faysal Bank ",
  "First Women Bank",
  "HBL Bank",
  "JS Bank",
  "MCB Bank",
  "MCB Islamic Bank",
  "Meezan Bank",
  "NBP",
  "Samba Bank",
  "Silkbank ",
  "Sindh Bank ",
  "SME Bank ",
  "Soneri Bank ",
  "Summit Bank ",
  "UBL ",
];

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
    // Define CSV headers
    const headers = [
      "Receipt ID",
      "Invoice ID",
      "Customer",
      "Product Name",
      "Payment Amount",
      "Payment Method",
      "Remaining Amount",
      "Payment Date",
      "Timestamp",
    ];

    // Convert data to CSV rows
    const csvRows = data.map((payment) => [
      payment.receiptId || payment.id?.slice(0, 8),
      payment.invoiceId,
      payment.customer,
      payment.productName,
      payment.paymentAmount,
      getPaymentMethodDisplay(payment),
      payment.remainingAmount || 0,
      formatShortDate(payment.paymentDate),
      formatDateTime(payment.timestamp || payment.paymentDate),
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
    const history =
      JSON.parse(window.localStorage?.getItem("installmentHistory")) || [];

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

  // Color coding for common payment methods
  if (paymentMethod?.includes("cash")) return "bg-blue-600/50";
  if (paymentMethod?.includes("credit")) return "bg-purple-600/50";
  if (paymentMethod?.includes("easypaisa")) return "bg-green-700/50";
  if (paymentMethod?.includes("jazzcash")) return "bg-red-700/50";
  if (paymentMethod?.includes("hbl")) return "bg-cyan-800/50";
  if (paymentMethod?.includes("meezan")) return "bg-purple-950/50";
  if (paymentMethod?.includes("bank")) return "bg-indigo-700/50";

  return "bg-orange-600/50";
};

// Payment method display formatter
const getPaymentMethodDisplay = (payment) => {
  return payment.paymentMethod || "PAYMENT METHOD";
};

// Main InstallmentsDetails component function
export default function InstallmentsDetails() {
  // State management for payment history data
  const [paymentHistory, setPaymentHistory] = useState([]);

  // State for search query
  const [query, setQuery] = useState("");

  // State for payment method filtering
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All");

  // State for customer filtering
  const [customerFilter, setCustomerFilter] = useState("All");

  // State for date range filtering
  const [dateRangeFilter, setDateRangeFilter] = useState("all");

  // State for modal visibility
  const [isViewOpen, setIsViewOpen] = useState(false);

  // State for report modal visibility
  const [isReportOpen, setIsReportOpen] = useState(false);

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

  // Get unique customers for filter dropdown
  const uniqueCustomers = useMemo(() => {
    const customers = [
      ...new Set(paymentHistory.map((p) => p.customer)),
    ].filter(Boolean);
    return customers.sort();
  }, [paymentHistory]);

  // Get unique payment methods from actual data for filter dropdown
  const uniquePaymentMethodsFromData = useMemo(() => {
    const methods = [
      ...new Set(paymentHistory.map((p) => p.paymentMethod)),
    ].filter(Boolean);
    return methods.sort();
  }, [paymentHistory]);

  // Memoized filtered payment history based on search query and filters
  const filteredHistory = useMemo(() => {
    let arr = paymentHistory.slice(); // Start with already sorted array

    // Apply search filter if query exists
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((payment) => {
        const searchableText = [
          payment.invoiceId,
          payment.customer,
          payment.productName,
          payment.paymentMethod,
          payment.receiptId,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(q);
      });
    }

    // Apply payment method filter if not "All"
    if (paymentMethodFilter !== "All") {
      arr = arr.filter(
        (payment) => payment.paymentMethod === paymentMethodFilter
      );
    }

    // Apply customer filter if not "All"
    if (customerFilter !== "All") {
      arr = arr.filter((payment) => payment.customer === customerFilter);
    }

    // Apply date range filter if not "all"
    if (dateRangeFilter !== "all") {
      const { start, end } = getDateRange(dateRangeFilter);
      if (start && end) {
        arr = arr.filter((payment) => {
          const paymentDate = parseDateForSorting(
            payment.paymentDate || payment.timestamp
          );
          return paymentDate >= start && paymentDate <= end;
        });
      }
    }

    // Return filtered results - they maintain the original sort order
    return arr;
  }, [
    paymentHistory,
    query,
    paymentMethodFilter,
    customerFilter,
    dateRangeFilter,
  ]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = filteredHistory.length;
    const totalAmount = filteredHistory.reduce(
      (sum, payment) => sum + (parseFloat(payment.paymentAmount) || 0),
      0
    );
    const totalRemaining = filteredHistory.reduce(
      (sum, payment) => sum + (parseFloat(payment.remainingAmount) || 0),
      0
    );
    const cashPayments = filteredHistory.filter((p) =>
      p.paymentMethod?.toLowerCase().includes("cash")
    ).length;
    const bankPayments = filteredHistory.filter(
      (p) =>
        !p.paymentMethod?.toLowerCase().includes("cash") &&
        p.paymentMethod?.toLowerCase().includes("bank")
    ).length;
    const mobilePayments = filteredHistory.filter(
      (p) =>
        p.paymentMethod?.toLowerCase().includes("easypaisa") ||
        p.paymentMethod?.toLowerCase().includes("jazzcash")
    ).length;
    const cashAmount = filteredHistory
      .filter((p) => p.paymentMethod?.toLowerCase().includes("cash"))
      .reduce(
        (sum, payment) => sum + (parseFloat(payment.paymentAmount) || 0),
        0
      );
    const bankAmount = filteredHistory
      .filter(
        (p) =>
          !p.paymentMethod?.toLowerCase().includes("cash") &&
          p.paymentMethod?.toLowerCase().includes("bank")
      )
      .reduce(
        (sum, payment) => sum + (parseFloat(payment.paymentAmount) || 0),
        0
      );

    return {
      total,
      totalAmount,
      totalRemaining,
      cashPayments,
      bankPayments,
      mobilePayments,
      cashAmount,
      bankAmount,
    };
  }, [filteredHistory]);

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
    if (filteredHistory.length === 0) {
      notifyError("No data available to export");
      return;
    }

    const success = exportToExcel(
      filteredHistory,
      `installment-report-${new Date().toISOString().split("T")[0]}`
    );
    if (success) {
      notifySuccess("INSTALLMENT REPORT EXPORTED TO EXCEL SUCCESSFULLY");
    }
  };

  // Open report summary modal
  const handleOpenReport = () => {
    setIsReportOpen(true);
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
          <h1 className="text-3xl font-bold text-white mb-2">
            INSTALLMENTS DETAILS
          </h1>
          <p className="text-white/80">
            ANALYZE AND EXPORT INSTALLMENT PAYMENT DATA WITH ADVANCED FILTERING
            AND REPORTING.
          </p>
        </div>
        {/* Search and Filter Panel */}
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
              placeholder="SEARCH INSTALLMENTS..."
              className="flex-1 outline-none bg-transparent text-white placeholder-white/60"
            />
          </div>

         

          {/* Customer filter dropdown */}
          <div className="flex flex-col md:flex-row md:items-center md:gap-2 md:justify-between col-span-1">
            <label className="text-sm text-white/70 whitespace-nowrap">
              CUSTOMER
            </label>
            <select
              value={customerFilter}
              onChange={(e) => setCustomerFilter(e.target.value)}
              className="p-2 border border-white/10 rounded bg-white/10 text-white flex-1 mt-1 md:mt-0"
            >
              <option value="All" className="bg-black/95 text-white">
                ALL CUSTOMERS
              </option>
              {uniqueCustomers.map((customer) => (
                <option
                  key={customer}
                  value={customer}
                  className="bg-black/95 text-white"
                >
                  {(customer)}
                </option>
              ))}
            </select>
          </div>

          {/* Date range filter dropdown */}
          <div className="flex flex-col md:flex-row md:items-center md:gap-2 md:justify-between col-span-1">
            <label className="text-sm text-white/70 whitespace-nowrap">
              DATE RANGE
            </label>
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="p-2 border border-white/10 rounded bg-white/10 text-white flex-1 mt-1 md:mt-0"
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
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-md overflow-x-auto scrollbar-hide">
          {/* Payment history table */}
          <table className="w-full text-white/90 min-w-[800px]">
            {/* Table header with column labels */}
            <thead className="bg-white/10 text-left text-sm">
              <tr>
                <th className="p-3">DATE</th>
                <th className="p-3">RECEIPT</th>
                <th className="p-3">CUSTOMER</th>
                <th className="p-3">PRODUCT</th>
                <th className="p-3">AMOUNT</th>
                <th className="p-3">PAYMENT METHOD</th>
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
                    {payment.receiptId || "—"}
                  </td>

                  {/* Customer name column */}
                  <td className="p-3">{(payment.customer)}</td>

                  {/* Product name column */}
                  <td className="p-3">{(payment.productName)}</td>

                  {/* Payment amount column */}
                  <td className="p-3 font-semibold">Rs: {payment.paymentAmount}/-</td>

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
                  <td colSpan="7" className="p-4 text-center text-white/70">
                    NO PAYMENT RECORDS FOUND.
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
                    RECEIPT ID:{" "}
                    {selectedReceipt.receiptId ||
                      selectedReceipt.id?.slice(0, 8)}
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatDateTime(
                      selectedReceipt.timestamp || selectedReceipt.paymentDate
                    )}
                  </p>
                </div>
              </div>

              {/* Payment details section */}
              <div className="space-y-3">
                
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">CUSTOMER:</span>
                  <span className="text-gray-900 text-right">
                    {(selectedReceipt.customer)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">PRODUCT:</span>
                  <span className="text-gray-900 text-right">
                    {(selectedReceipt.productName)}
                  </span>
                </div>
              </div>

              {/* Payment information section */}
              <div className="border-t border-dashed border-gray-300 pt-3 mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    PAYMENT DATE:
                  </span>
                  <span className="text-gray-900 text-right">
                    {formatDateTime(
                      selectedReceipt.paymentDate || selectedReceipt.timestamp
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    PAYMENT METHOD:
                  </span>
                  <span className="text-gray-900 text-right ">
                    {getPaymentMethodDisplay(selectedReceipt)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    AMOUNT PAID:
                  </span>
                  <span className="text-gray-900 text-right font-semibold">
                    Rs: {selectedReceipt.paymentAmount}/-
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    REMAINING BALANCE:
                  </span>
                  <span className="text-gray-900 text-right">
                    Rs: {selectedReceipt.remainingAmount || 0}/-
                  </span>
                </div>
              </div>

              {/* Total value highlight section */}
              <div className="bg-green-200 border border-green-400 rounded-md p-2 mb-6">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-bold text-green-900">TOTAL PAID:</span>
                  <span className="font-bold text-green-900 text-right">
                    Rs: {selectedReceipt.paymentAmount}/-
                  </span>
                </div>
              </div>

              {/* Footer disclaimer */}
              <div className="text-center border-t border-dashed border-gray-300 pt-4 text-xs text-gray-600">
                <p>THANK YOU FOR YOUR PAYMENT!</p>
                <p>THIS IS A COMPUTER-GENERATED RECEIPT.</p>
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
                  INSTALLMENT PAYMENT REPORT SUMMARY
                </p>
                <div className="mt-3 space-y-1 text-sm">
                  <p className="font-semibold text-gray-700">
                    REPORT GENERATED: {formatDateTime(new Date())}
                  </p>
                  <p className="text-gray-600">
                    Total Records: {filteredHistory.length} | Date Range:{" "}
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
                  <div className="text-blue-700 text-sm">TOTAL PAYMENTS</div>
                </div>
                <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-900">
                    Rs: {stats.totalAmount}/-
                  </div>
                  <div className="text-green-700 text-sm">TOTAL COLLECTED</div>
                </div>
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-900">
                    Rs: {stats.totalRemaining}/-
                  </div>
                  <div className="text-yellow-700 text-sm">
                    REMAINING BALANCE
                  </div>
                </div>
                <div className="bg-teal-100 border border-teal-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-teal-900">
                    Rs: {stats.cashPayments}/-
                  </div>
                  <div className="text-teal-700 text-sm">CASH PAYMENTS</div>
                </div>
                <div className="bg-purple-100 border border-purple-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-900">
                    {stats.bankPayments}
                  </div>
                  <div className="text-purple-700 text-sm">BANK PAYMENTS</div>
                </div>
                <div className="bg-indigo-100 border border-indigo-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-indigo-900">
                    Rs: {stats.cashAmount}/-
                  </div>
                  <div className="text-indigo-700 text-sm">CASH AMOUNT</div>
                </div>
              </div>

              {/* Footer Information */}
              <div className="text-center border-t border-dashed border-gray-300 pt-4 text-xs text-gray-600">
                <p>THIS IS A COMPUTER-GENERATED INSTALLMENT PAYMENT REPORT.</p>
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
