// |===============================| Import Components |===============================|
import React, { useState, useEffect, useMemo } from "react";
import { Calendar, TrendingUp, User } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from "@mui/icons-material/Add";

// |===============================| Installment Management Component |===============================|
const InstallmentManagement = () => {
  const navigate = useNavigate();

  // State for installment data
  const [installmentSales, setInstallmentSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({});
  const [guarantorDetails, setGuarantorDetails] = useState({});

  // Load installment sales from localStorage
  useEffect(() => {
    loadInstallmentSales();
    loadCustomerAndGuarantorDetails();
  }, []);

  const loadInstallmentSales = () => {
    try {
      const salesHistory =
        JSON.parse(localStorage.getItem("salesHistory")) || [];
      const installmentSales = salesHistory.filter(
        (sale) => sale.type === "installment-sale"
      );
      setInstallmentSales(installmentSales);
    } catch (error) {
      console.error("Error loading installment sales:", error);
      toast.error("Error loading installment data!");
    }
  };

  // Load customer and guarantor details
  const loadCustomerAndGuarantorDetails = () => {
    try {
      // Load customers
      const customersData =
        JSON.parse(localStorage.getItem("all_customers_data")) || [];
      const customerMap = {};
      customersData.forEach((customer) => {
        customerMap[customer.customerId] = {
          firstName: customer.firstName,
          lastName: customer.lastName,
          contact: customer.contact,
          cnic: customer.cnic,
          city: customer.city,
          address: customer.address,
        };
      });
      setCustomerDetails(customerMap);

      // Load guarantors
      const guarantorsData =
        JSON.parse(localStorage.getItem("all_guarantors_data")) || [];
      const guarantorMap = {};
      guarantorsData.forEach((guarantor) => {
        guarantorMap[guarantor.guarantorId] = {
          firstName: guarantor.firstName,
          lastName: guarantor.lastName,
          contact: guarantor.contact,
          cnic: guarantor.cnic,
          city: guarantor.city,
          address: guarantor.address,
        };
      });
      setGuarantorDetails(guarantorMap);
    } catch (error) {
      console.error("Error loading customer/guarantor details:", error);
    }
  };

  // Filtered installment sales based on search and filter
  const filteredSales = useMemo(() => {
    return installmentSales.filter((sale) => {
      const customer = customerDetails[sale.customerId];

      const matchesSearch =
        searchTerm === "" ||
        sale.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.invoiceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer &&
          (customer.firstName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
            customer.lastName
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            customer.cnic?.includes(searchTerm) ||
            customer.contact?.includes(searchTerm)));

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && sale.remainingAmount > 0) ||
        (filterStatus === "completed" && sale.remainingAmount <= 0);

      return matchesSearch && matchesStatus;
    });
  }, [installmentSales, searchTerm, filterStatus, customerDetails]);

  // Calculate payment status - only completed or active
  const getPaymentStatus = (sale) => {
    if (sale.remainingAmount <= 0) return "completed";
    return "active";
  };

  // Get next due date
  const getNextDueDate = (sale) => {
    if (!sale.paymentTimeline || sale.paymentTimeline.length === 0) return "—";

    const nextPayment = sale.paymentTimeline.find((payment) => !payment.paid);
    return nextPayment ? formatShortDate(nextPayment.dueDate) : "—";
  };

  // Get remaining installments count
  const getRemainingInstallments = (sale) => {
    if (!sale.paymentTimeline) return 0;
    return sale.paymentTimeline.filter((payment) => !payment.paid).length;
  };

  // Get paid installments count
  const getPaidInstallments = (sale) => {
    if (!sale.paymentTimeline) return 0;
    return sale.paymentTimeline.filter((payment) => payment.paid).length;
  };

  // Get total installments
  const getTotalInstallments = (sale) => {
    return sale.paymentTimeline ? sale.paymentTimeline.length : 0;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "—";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "—";
    }
  };

  // Short date formatter
  const formatShortDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "—";
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "—";
    }
  };

  // Format date time for detailed display
  const formatDateTime = (dateInput) => {
    if (!dateInput) return "—";
    try {
      let date;
      if (dateInput instanceof Date) {
        date = dateInput;
      } else if (typeof dateInput === "string") {
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
          date = new Date(dateInput);
        }
      } else {
        date = new Date(dateInput);
      }
      if (isNaN(date.getTime())) return "—";
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    } catch (error) {
      console.error("Date formatting error:", error);
      return "—";
    }
  };

  // Handle payment submission
  const handlePaymentSubmit = (e) => {
    e.preventDefault();

    if (!selectedSale) {
      toast.error("Please select an installment sale!");
      return;
    }

    // Check if installment is already completed
    if (selectedSale.remainingAmount <= 0) {
      toast.error("This installment is already completed!");
      return;
    }

    const payment = parseFloat(paymentAmount);
    if (!payment || payment <= 0) {
      toast.error("Please enter a valid payment amount!");
      return;
    }

    if (payment > selectedSale.remainingAmount) {
      toast.error(
        `Payment cannot exceed remaining amount of ${selectedSale.remainingAmount}`
      );
      return;
    }

    if (!paymentDate) {
      toast.error("Please select a payment date!");
      return;
    }

    // Create payment record
    const paymentRecord = {
      id: crypto.randomUUID(),
      saleId: selectedSale.id,
      invoiceId: selectedSale.invoiceId,
      timestamp: new Date().toISOString(),
      paymentDate: paymentDate,
      paymentAmount: payment,
      paymentMethod: paymentMethod,
      remainingAmount: selectedSale.remainingAmount - payment,
      customer: selectedSale.customer,
      productName: selectedSale.productName,
    };

    // Update installment sale
    const updatedSales = installmentSales.map((sale) => {
      if (sale.id === selectedSale.id) {
        let remainingPayment = payment;
        const updatedTimeline = sale.paymentTimeline
          ? [...sale.paymentTimeline]
          : [];

        // Mark payments as paid in timeline
        for (let paymentItem of updatedTimeline) {
          if (!paymentItem.paid && remainingPayment > 0) {
            const paymentDue = paymentItem.paymentAmount;
            if (paymentDue <= remainingPayment) {
              paymentItem.paid = true;
              paymentItem.paymentDate = paymentDate;
              paymentItem.actualAmount = paymentDue;
              remainingPayment -= paymentDue;
            } else {
              // Partial payment for this installment
              paymentItem.paid = true;
              paymentItem.paymentDate = paymentDate;
              paymentItem.actualAmount = remainingPayment;
              remainingPayment = 0;
            }
          }
        }

        const updatedSale = {
          ...sale,
          remainingAmount: sale.remainingAmount - payment,
          lastPaymentDate: paymentDate,
          totalPaid: (sale.totalPaid || 0) + payment,
          paymentTimeline: updatedTimeline,
        };

        return updatedSale;
      }
      return sale;
    });

    // Save to localStorage
    localStorage.setItem("salesHistory", JSON.stringify(updatedSales));

    // Save payment to installment history
    const installmentHistory =
      JSON.parse(localStorage.getItem("installmentHistory")) || [];
    installmentHistory.push(paymentRecord);
    localStorage.setItem(
      "installmentHistory",
      JSON.stringify(installmentHistory)
    );

    // Update state
    setInstallmentSales(updatedSales);
    setCurrentPayment(paymentRecord);
    setIsReceiptModalOpen(true);

    // Reset form
    setPaymentAmount("");
    setPaymentDate("");
    setPaymentMethod("cash");

    toast.success("Payment recorded successfully!");
  };

  // Handle print receipt
  const handlePrint = () => {
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.print();
    document.body.style.overflow = bodyOverflow;
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsReceiptModalOpen(false);
    setCurrentPayment(null);
  };

  // Get status badge class for table
  const getStatusBadgeClassTable = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-600 text-white";
      case "active":
        return "bg-blue-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  // Handle row click
  const handleRowClick = (sale) => {
    setSelectedSale(sale);
  };

  // Format payment method for display
  const getPaymentMethodDisplay = (method) => {
    const methodMap = {
      cash: "Cash",
      hbl: "HBL Bank",
      jazzcash: "JazzCash",
      easypaisa: "EasyPaisa",
      meezan: "Meezan Bank",
    };
    return methodMap[method] || method;
  };

  // Render payment form with customer details
  const renderPaymentForm = () => (
    <div className="bg-cyan-800/50 backdrop-blur-md border border-cyan-700 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        Record Payment
      </h3>

      {!selectedSale ? (
        <div className="text-center py-8 border-2 border-dashed border-white/20 rounded-md">
          <div className="text-white text-3xl mb-3">💳</div>
          <p className="text-white italic">
            Click on a row to select installment for payment
          </p>
        </div>
      ) : selectedSale.remainingAmount <= 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-green-500/30 rounded-md bg-green-500/10">
          <div className="text-green-400 text-3xl mb-3">✅</div>
          <p className="text-green-400 font-semibold text-lg">
            Installment Completed
          </p>
          <p className="text-green-400/80 text-sm mt-2">
            All payments have been received for this installment
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Customer Details Section */}
          <div className="bg-cyan-900/40 backdrop-blur-md border border-cyan-600 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              Customer & Installment Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/70">Customer:</span>
                  <span className="text-white font-semibold">
                    {customerDetails[selectedSale.customerId]
                      ? `${
                          customerDetails[selectedSale.customerId].firstName
                        } ${customerDetails[selectedSale.customerId].lastName}`
                      : selectedSale.customer}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">CNIC:</span>
                  <span className="text-white font-mono">
                    {customerDetails[selectedSale.customerId]?.cnic || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Contact:</span>
                  <span className="text-white">
                    {customerDetails[selectedSale.customerId]?.contact || "—"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/70">Product:</span>
                  <span className="text-white font-semibold">
                    {selectedSale.productName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Remaining Amount:</span>
                  <span className="text-orange-400 font-semibold">
                    {selectedSale.remainingAmount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Installments:</span>
                  <span className="text-white">
                    {getPaidInstallments(selectedSale)}/
                    {getTotalInstallments(selectedSale)} paid
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Payment Amount
                </label>
                <input
                  type="text"
                  value={paymentAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Allow only numbers and decimal point
                    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
                      setPaymentAmount(value);
                    }
                  }}
                  className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                  placeholder="Enter amount"
                />
                <p className="text-xs text-white/70 mt-1">
                  Remaining: {selectedSale.remainingAmount}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                >
                  <option value="cash" className="bg-black/90">
                    Cash
                  </option>
                  <option value="easypaisa" className="bg-black/90">
                    EasyPaisa
                  </option>
                  <option value="jazzcash" className="bg-black/90">
                    JazzCash
                  </option>
                  <option value="meezan" className="bg-black/90">
                    Meezan Bank
                  </option>
                  <option value="hbl" className="bg-black/90">
                    HBL Bank
                  </option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setSelectedSale(null)}
                className="px-6 py-3 border border-white/30 rounded-md bg-gray-600 hover:bg-gray-700 transition-all duration-300 cursor-pointer font-semibold text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 border border-white/30 rounded-md bg-cyan-950/70 hover:bg-cyan-950 transition-all duration-300 cursor-pointer font-semibold text-white flex justify-center items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Record Payment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );

  return (
    <>
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

      <div className="p-2 min-h-screen text-white">
        <div className="max-w-8xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                <Calendar className="w-6 h-6 mr-2" />
                Installment Management
              </h1>
              <p className="text-white/80">
                Manage and track installment payments
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-md p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 md:col-span-2">
              <SearchIcon className="text-white" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by customer, product, invoice, CNIC, contact..."
                className="flex-1 outline-none bg-transparent text-white placeholder-white/60"
              />
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
              >
                <option value="all" className="bg-black/90">
                  All Installments
                </option>
                <option value="active" className="bg-black/90">
                  Active
                </option>
                <option value="completed" className="bg-black/90">
                  Completed
                </option>
              </select>
            </div>

            <div className="text-white/80 text-lg flex items-center">
              Total Records: {filteredSales.length}
            </div>
          </div>

          {/* Payment Form */}
          {renderPaymentForm()}

          {/* Installment Sales Table */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-md overflow-x-auto scrollbar-hide">
            <table className="w-full text-white/90 min-w-[1000px]">
              <thead className="bg-white/10 text-left text-sm">
                <tr>
                  <th className="p-3">Invoice</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Paid</th>
                  <th className="p-3">Remaining</th>
                  <th className="p-3">Installments</th>
                  <th className="p-3">Next Due Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Progress</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredSales.map((sale) => {
                  const status = getPaymentStatus(sale);
                  const paidInstallments = getPaidInstallments(sale);
                  const remainingInstallments = getRemainingInstallments(sale);
                  const totalInstallments = getTotalInstallments(sale);
                  const progressPercentage =
                    ((sale.finalTotal - sale.remainingAmount) /
                      sale.finalTotal) *
                    100;

                  const customer = customerDetails[sale.customerId];

                  return (
                    <tr
                      key={sale.id}
                      onClick={() => handleRowClick(sale)}
                      className={`border-t border-white/5 transition cursor-pointer ${
                        selectedSale?.id === sale.id
                          ? "bg-purple-600/50"
                          : "hover:bg-purple-600/30"
                      }`}
                    >
                      <td className="p-3 font-mono">{sale.invoiceId}</td>
                      <td className="p-3">
                        <div className="font-semibold">
                          {customer
                            ? `${customer.firstName} ${customer.lastName}`
                            : sale.customer}
                        </div>
                      </td>
                      <td className="p-3 text-white font-semibold">
                        Rs:{" "}
                        {sale.totalPaid ||
                          sale.finalTotal - sale.remainingAmount}
                        /-
                      </td>
                      <td className="p-3 text-white font-semibold">
                        Rs: {sale.remainingAmount}/-
                      </td>
                      <td className="p-3">
                        <div className="text-center">
                          <div className="text-sm font-semibold">
                            {paidInstallments}/{totalInstallments}
                          </div>
                          <div className="text-xs text-white/70">
                            {remainingInstallments} remaining
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-center">
                          <div className="text-sm font-semibold">
                            {getNextDueDate(sale)}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 text-xs border rounded-full border-white/30 ${getStatusBadgeClassTable(
                            status
                          )}`}
                        >
                          {status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div
                            className="bg-cyan-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-center mt-1 text-white/70">
                          {Math.round(progressPercentage)}%
                        </div>
                      </td>
                      <td className="p-3">
                        <button
                          title="View Details"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSale(sale);
                            setIsViewOpen(true);
                          }}
                          className="p-2 rounded bg-cyan-900 text-white hover:bg-cyan-950 transition-colors cursor-pointer"
                        >
                          <VisibilityIcon fontSize="small" />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredSales.length === 0 && (
                  <tr>
                    <td colSpan="9" className="p-4 text-center text-white/70">
                      No installment records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sale Details Modal - UPDATED with complete details */}
      {isViewOpen && selectedSale && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-2 md:p-4 backdrop-blur-md print:p-0">
          <div className="bg-white text-black rounded-lg w-full max-w-2xl mx-auto max-h-[95vh] overflow-y-auto scrollbar-hide relative font-sans text-sm border border-gray-300">
            <div className="p-4 space-y-3">
              {/* Header section */}
              <div className="text-center border-b border-dashed border-gray-300 pb-3 mb-3">
                <h2 className="text-xl font-bold tracking-wider text-gray-900">
                  ZUBI ELECTRONICS
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Installment Sale Details
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-semibold text-gray-700">
                    Invoice: {selectedSale.invoiceId}
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatDateTime(selectedSale.timestamp)}
                  </p>
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
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Quantity:</span>
                  <span className="text-gray-900 text-right">
                    {selectedSale.quantity || 1} units
                  </span>
                </div>
              </div>

              {/* Customer and Guarantor Information */}
              <div className="border-t border-dashed border-gray-300 pt-3 mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    Customer ID:
                  </span>
                  <span className="text-gray-900 text-right font-mono">
                    {selectedSale.customerId}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Customer:</span>
                  <span className="text-gray-900 text-right">
                    {selectedSale.customer?.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    Guarantor ID:
                  </span>
                  <span className="text-gray-900 text-right font-mono">
                    {selectedSale.guarantorId}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Guarantor:</span>
                  <span className="text-gray-900 text-right">
                    {selectedSale.guarantor?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Payment Details Section */}
              <div className="border-t border-dashed border-gray-300 pt-3 mt-3 space-y-2">
                <h4 className="font-medium text-gray-700 mb-2">
                  Payment Summary
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    Total Amount:
                  </span>
                  <span className="text-gray-900 text-right font-semibold">
                    Rs: {selectedSale.finalTotal}/-
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    Advance Paid:
                  </span>
                  <span className="text-gray-900 text-right">
                    Rs: {selectedSale.advancePaymentAmount || 0}/-
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Installment Paid:</span>
                  <span className="text-right text-green-600 font-semibold">
                    Rs:{" "}
                    {selectedSale.totalPaid ||
                      selectedSale.finalTotal - selectedSale.remainingAmount}
                    /-
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    Remaining Amount:
                  </span>
                  <span className="text-right text-orange-600 font-semibold">
                    Rs: {selectedSale.remainingAmount}/-
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    Monthly Payment:
                  </span>
                  <span className="text-gray-900 text-right">
                    Rs: {selectedSale.monthlyPayment || 0}/-
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    Payment Plan:
                  </span>
                  <span className="text-gray-900 text-right">
                    {selectedSale.planMonths} months
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    Payment Method:
                  </span>
                  <span className="text-gray-900 text-right">
                    {getPaymentMethodDisplay(selectedSale.paymentMethod)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Status:</span>
                  <span
                    className={`text-right font-semibold ${
                      selectedSale.remainingAmount <= 0
                        ? "text-green-600"
                        : "text-blue-600"
                    }`}
                  >
                    {selectedSale.remainingAmount <= 0 ? "COMPLETED" : "ACTIVE"}
                  </span>
                </div>
              </div>

              {/* Installment Progress */}
              <div className="border-t border-dashed border-gray-300 pt-3 mt-3">
                <h4 className="font-medium text-gray-700 mb-2">
                  Installment Progress
                </h4>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <span className="font-medium text-gray-700">
                    Installments Paid:
                  </span>
                  <span className="text-gray-900 text-right">
                    {getPaidInstallments(selectedSale)}/
                    {getTotalInstallments(selectedSale)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        ((selectedSale.finalTotal -
                          selectedSale.remainingAmount) /
                          selectedSale.finalTotal) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="text-xs text-center text-gray-500">
                  {Math.round(
                    ((selectedSale.finalTotal - selectedSale.remainingAmount) /
                      selectedSale.finalTotal) *
                      100
                  )}
                  % Paid
                </div>
              </div>

              {/* Payment Timeline */}
              {selectedSale.paymentTimeline &&
                selectedSale.paymentTimeline.length > 0 && (
                  <div className="border-t border-dashed border-gray-300 pt-3 mt-3">
                    <h4 className="font-medium text-gray-700 mb-2">
                      Payment Schedule
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedSale.paymentTimeline.map((payment, index) => (
                        <div
                          key={index}
                          className={`flex justify-between items-center p-2 rounded border ${
                            payment.paid
                              ? "bg-green-50 border-green-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">
                              Payment {payment.paymentNumber}:
                            </span>
                            <span className="text-sm text-gray-600">
                              {formatDate(payment.dueDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">
                              {payment.paymentAmount}
                            </span>
                            {payment.paid ? (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                PAID
                              </span>
                            ) : (
                              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                PENDING
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Footer */}
              <div className="text-center border-t border-dashed border-gray-300 pt-4 text-xs text-gray-600">
                <p>Installment Management System</p>
                <p>This is a computer-generated detail view.</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 rounded-b-lg p-2 print:hidden">
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded hover:cursor-pointer bg-blue-600 text-white hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <span>🖨️</span>
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setIsViewOpen(false)}
                  className="px-4 py-2 rounded hover:cursor-pointer bg-gray-600 text-white hover:bg-gray-700 transition font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Receipt Modal */}
      {isReceiptModalOpen && currentPayment && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-2 md:p-4 backdrop-blur-md print:p-0">
          <div className="bg-white text-black rounded-lg w-full max-w-md mx-auto max-h-[95vh] overflow-y-auto scrollbar-hide relative font-sans text-sm border border-gray-300">
            <div className="p-4 space-y-3">
              {/* Header section */}
              <div className="text-center border-b border-dashed border-gray-300 pb-3 mb-3">
                <h2 className="text-xl font-bold tracking-wider text-gray-900">
                  ZUBI ELECTRONICS
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Installment Payment Receipt
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-semibold text-gray-700">
                    Receipt ID: {currentPayment.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatDate(currentPayment.timestamp)}
                  </p>
                </div>
              </div>

              {/* Payment details */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Invoice No:</span>
                  <span className="text-gray-900 text-right font-mono">
                    {currentPayment.invoiceId}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Customer:</span>
                  <span className="text-gray-900 text-right">
                    {currentPayment.customer}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Product:</span>
                  <span className="text-gray-900 text-right">
                    {currentPayment.productName}
                  </span>
                </div>
              </div>

              {/* Payment information */}
              <div className="border-t border-dashed border-gray-300 pt-3 mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    Payment Date:
                  </span>
                  <span className="text-gray-900 text-right">
                    {formatDate(currentPayment.paymentDate)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    Payment Method:
                  </span>
                  <span className="text-gray-900 text-right">
                    {currentPayment.paymentMethod.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    Amount Paid:
                  </span>
                  <span className="text-gray-900 text-right font-semibold">
                    {currentPayment.paymentAmount}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    Remaining Balance:
                  </span>
                  <span className="text-gray-900 text-right">
                    {currentPayment.remainingAmount}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center border-t border-dashed border-gray-300 pt-4 text-xs text-gray-600">
                <p>Thank you for your payment!</p>
                <p>This is a computer-generated receipt.</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 rounded-b-lg p-2 print:hidden">
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded hover:cursor-pointer bg-blue-600 text-white hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <span>🖨️</span>
                  <span>Print</span>
                </button>
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
    </>
  );
};

export default InstallmentManagement;
