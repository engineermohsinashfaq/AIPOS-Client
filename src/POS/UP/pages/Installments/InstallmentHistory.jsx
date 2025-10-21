// |===============================| InstallmentHistory Component |===============================|
// Import necessary React hooks and external libraries
import React, { useState, useEffect, useMemo } from "react";
import { Receipt, Search, Calendar, Download } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

// Date formatting utility function - converts date to standardized string
const formatDate = (dateString) => {
  // Return dash for empty/null dates
  if (!dateString) return "—";

  try {
    const date = new Date(dateString);
    
    // Validate the parsed date
    if (isNaN(date.getTime())) {
      return "—";
    }

    // Return formatted date string (Month Day, Year)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

// Load payment history from localStorage
const loadPaymentHistory = () => {
  try {
    // Retrieve payment history from localStorage or initialize empty array
    const history = JSON.parse(localStorage.getItem("installmentHistory")) || [];
    return history;
  } catch {
    console.error("Error loading payment history from localStorage.");
    return [];
  }
};

// Main InstallmentHistory component function
export default function InstallmentHistory() {
  // State management for payment history data
  const [paymentHistory, setPaymentHistory] = useState([]);

  // State for search query
  const [searchTerm, setSearchTerm] = useState("");

  // State for date filter
  const [dateFilter, setDateFilter] = useState("");

  // State for modal visibility
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // State for currently selected receipt details
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Navigation hook for routing
  const navigate = useNavigate();

  // Effect hook to handle initial data loading
  useEffect(() => {
    setPaymentHistory(loadPaymentHistory());
  }, []);

  // Memoized filtered payment history based on search criteria
  const filteredHistory = useMemo(() => {
    return paymentHistory.filter(payment => {
      const matchesSearch = searchTerm === "" || 
        payment.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.invoiceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.productName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate = dateFilter === "" || 
        payment.paymentDate === dateFilter;

      return matchesSearch && matchesDate;
    });
  }, [paymentHistory, searchTerm, dateFilter]);

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
    setIsReceiptModalOpen(true);
  };

  // Handle close modal action
  const handleCloseModal = () => {
    setIsReceiptModalOpen(false);
    setSelectedReceipt(null);
  };

  // Navigate back to management page
  const handleBackToManagement = () => {
    navigate("/installment-management");
  };

  // Component render method
  return (
    // Main container with responsive padding
    <div className="p-2 min-h-screen">
      {/* Toast notifications container */}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        style={{ zIndex: 9999 }}
      />

      {/* Content wrapper with glass morphism effect */}
      <div className="bg-white/10 p-6 rounded-lg border border-white/20 backdrop-blur-md">
        {/* Header section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
              <Receipt className="w-6 h-6 mr-2" />
              Installment Payment History
            </h2>
            <p className="text-white/70">View all installment payment records</p>
          </div>
          
          {/* Back to management button */}
          <button
            onClick={handleBackToManagement}
            className="mt-4 md:mt-0 px-6 py-3 bg-cyan-950/70 hover:bg-cyan-950 border border-white/30 rounded-md transition-all duration-300 cursor-pointer font-semibold text-white flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Back to Management
          </button>
        </div>

        {/* Search and filter controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Search input */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              <Search className="w-4 h-4 inline mr-1" />
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
              placeholder="Search by customer, invoice, product..."
            />
          </div>

          {/* Date filter input */}
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              Filter by Date
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
            />
          </div>

          {/* Results counter */}
          <div className="flex items-end">
            <div className="text-white text-sm">
              Showing {filteredHistory.length} of {paymentHistory.length} payments
            </div>
          </div>
        </div>

        {/* Payment history table container */}
        <div className="bg-cyan-800/30 backdrop-blur-md border border-cyan-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Payment Records
          </h3>

          {/* Empty state message */}
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-white/20 rounded-md">
              <div className="text-white text-4xl mb-4">📋</div>
              <p className="text-white italic">No payment records found</p>
              <p className="text-white text-sm mt-2">
                {paymentHistory.length === 0 
                  ? "No installment payments have been recorded yet." 
                  : "No payments match your search criteria."}
              </p>
            </div>
          ) : (
            /* Payment records table */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 text-white font-semibold">Date</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Invoice ID</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Customer</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Product</th>
                    <th className="text-right py-3 px-4 text-white font-semibold">Amount</th>
                    <th className="text-left py-3 px-4 text-white font-semibold">Method</th>
                    <th className="text-right py-3 px-4 text-white font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Map through filtered payment records */}
                  {filteredHistory.map((payment) => (
                    <tr key={payment.id} className="border-b border-white/10 hover:bg-cyan-700/20 transition-colors">
                      {/* Payment date column */}
                      <td className="py-3 px-4 text-white text-sm">
                        {formatDate(payment.paymentDate)}
                      </td>

                      {/* Invoice ID column */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-cyan-300 text-sm">
                          {payment.invoiceId}
                        </span>
                      </td>

                      {/* Customer name column */}
                      <td className="py-3 px-4 text-white text-sm">
                        {payment.customer}
                      </td>

                      {/* Product name column */}
                      <td className="py-3 px-4 text-white text-sm">
                        {payment.productName}
                      </td>

                      {/* Payment amount column */}
                      <td className="py-3 px-4 text-right text-white font-semibold text-sm">
                        {formatCurrency(payment.paymentAmount)}
                      </td>

                      {/* Payment method column */}
                      <td className="py-3 px-4">
                        <span className="text-white text-sm capitalize">
                          {payment.paymentMethod}
                        </span>
                      </td>

                      {/* Actions column with receipt button */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleViewReceipt(payment)}
                          className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-sm transition-colors flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Receipt details modal */}
      {isReceiptModalOpen && selectedReceipt && (
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
                  Installment Payment Receipt
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-semibold text-gray-700">
                    Receipt ID: {selectedReceipt.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatDate(selectedReceipt.timestamp)}
                  </p>
                </div>
              </div>

              {/* Payment details section */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Invoice No:</span>
                  <span className="text-gray-900 text-right font-mono">
                    {selectedReceipt.invoiceId}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Customer:</span>
                  <span className="text-gray-900 text-right">
                    {selectedReceipt.customer}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Product:</span>
                  <span className="text-gray-900 text-right">
                    {selectedReceipt.productName}
                  </span>
                </div>
              </div>

              {/* Payment information section */}
              <div className="border-t border-dashed border-gray-300 pt-3 mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Payment Date:</span>
                  <span className="text-gray-900 text-right">
                    {formatDate(selectedReceipt.paymentDate)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Payment Method:</span>
                  <span className="text-gray-900 text-right">
                    {selectedReceipt.paymentMethod.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Amount Paid:</span>
                  <span className="text-gray-900 text-right font-semibold">
                    {formatCurrency(selectedReceipt.paymentAmount)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Remaining Balance:</span>
                  <span className="text-gray-900 text-right">
                    {formatCurrency(selectedReceipt.remainingAmount)}
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
                  className="px-4 py-2 rounded hover:cursor-pointer bg-blue-600 text-white hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <span>🖨️</span>
                  <span>Print</span>
                </button>
                
                {/* Close modal button */}
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded hover:cursor-pointer bg-gray-600 text-white hover:bg-gray-700 transition font-medium"
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