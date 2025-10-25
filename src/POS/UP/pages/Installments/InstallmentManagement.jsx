import React, { useState, useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { Calendar, TrendingUp, User } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";

const InstallmentManagement = () => {
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
  const [showConfirmation, setShowConfirmation] = useState(false);

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

  const generatePaymentReceiptId = () => {
    const installmentHistory =
      JSON.parse(localStorage.getItem("installmentHistory")) || [];
    const nextReceiptNumber = installmentHistory.length + 1;
    return String(nextReceiptNumber).padStart(6, "0");
  };

  const loadCustomerAndGuarantorDetails = () => {
    try {
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

  const filteredSales = useMemo(() => {
    return installmentSales.filter((sale) => {
      const customer = customerDetails[sale.customerId];

      const matchesSearch =
        searchTerm === "" ||
        sale.customer?.includes(searchTerm) ||
        sale.productName?.includes(searchTerm) ||
        sale.invoiceId?.includes(searchTerm) ||
        (customer &&
          (customer.firstName?.includes(searchTerm) ||
            customer.lastName?.includes(searchTerm) ||
            customer.cnic?.includes(searchTerm) ||
            customer.contact?.includes(searchTerm)));

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && sale.remainingAmount > 0) ||
        (filterStatus === "completed" && sale.remainingAmount <= 0);

      return matchesSearch && matchesStatus;
    });
  }, [installmentSales, searchTerm, filterStatus, customerDetails]);

  const getPaymentStatus = (sale) => {
    if (sale.remainingAmount <= 0) return "completed";
    return "active";
  };

  const getNextDueInfo = (sale) => {
    if (!sale.paymentTimeline || sale.paymentTimeline.length === 0) {
      return { dueDate: "—", amount: 0, isOverdue: false };
    }

    const nextPayment = sale.paymentTimeline.find((payment) => !payment.paid);
    if (!nextPayment) return { dueDate: "—", amount: 0, isOverdue: false };

    const today = new Date();
    const dueDate = new Date(nextPayment.dueDate);
    const isOverdue = dueDate < today;

    return {
      dueDate: formatShortDate(nextPayment.dueDate),
      amount: nextPayment.paymentAmount,
      isOverdue: isOverdue,
    };
  };

  const hasOverduePayments = (sale) => {
    if (!sale.paymentTimeline || sale.remainingAmount <= 0) return false;

    const today = new Date();
    return sale.paymentTimeline.some(
      (payment) => !payment.paid && new Date(payment.dueDate) < today
    );
  };

  const getRemainingInstallments = (sale) => {
    if (!sale.paymentTimeline) return 0;
    return sale.paymentTimeline.filter((payment) => !payment.paid).length;
  };

  const getPaidInstallments = (sale) => {
    if (!sale.paymentTimeline) return 0;
    return sale.paymentTimeline.filter((payment) => payment.paid).length;
  };

  const getTotalInstallments = (sale) => {
    return sale.paymentTimeline ? sale.paymentTimeline.length : 0;
  };

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

  const handlePaymentSubmit = (e) => {
    e.preventDefault();

    if (!selectedSale) {
      toast.error("Please select an installment sale!");
      return;
    }

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

    // Check if this is the last payment
    const remainingInstallments = getRemainingInstallments(selectedSale);
    if (remainingInstallments === 1 && payment < selectedSale.remainingAmount) {
      toast.error(
        "This is the last payment. Please pay the full remaining amount!"
      );
      return;
    }

    if (!paymentDate) {
      toast.error("Please select a payment date!");
      return;
    }

    setShowConfirmation(true);
  };

  const handleConfirmPayment = () => {
    const payment = parseFloat(paymentAmount);
    const receiptId = generatePaymentReceiptId();

    const paymentRecord = {
      id: crypto.randomUUID(),
      saleId: selectedSale.id,
      invoiceId: selectedSale.invoiceId,
      receiptId: receiptId,
      timestamp: new Date().toISOString(),
      paymentDate: paymentDate,
      paymentAmount: payment,
      paymentMethod: paymentMethod,
      remainingAmount: selectedSale.remainingAmount - payment,
      customer: selectedSale.customer,
      productName: selectedSale.productName,
    };

    const updatedSales = installmentSales.map((sale) => {
      if (sale.id === selectedSale.id) {
        let remainingPayment = payment;
        const updatedTimeline = sale.paymentTimeline
          ? [...sale.paymentTimeline]
          : [];

        for (let paymentItem of updatedTimeline) {
          if (!paymentItem.paid && remainingPayment > 0) {
            const paymentDue = paymentItem.paymentAmount;
            if (paymentDue <= remainingPayment) {
              paymentItem.paid = true;
              paymentItem.paymentDate = paymentDate;
              paymentItem.actualAmount = paymentDue;
              remainingPayment -= paymentDue;
            } else {
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

    localStorage.setItem("salesHistory", JSON.stringify(updatedSales));

    const installmentHistory =
      JSON.parse(localStorage.getItem("installmentHistory")) || [];
    installmentHistory.push(paymentRecord);
    localStorage.setItem(
      "installmentHistory",
      JSON.stringify(installmentHistory)
    );

    setInstallmentSales(updatedSales);
    setCurrentPayment(paymentRecord);
    setIsReceiptModalOpen(true);
    setShowConfirmation(false);

    setPaymentAmount("");
    setPaymentDate("");
    setPaymentMethod("cash");

    toast.success("Payment recorded successfully!");
  };

  const handleCancelPayment = () => {
    setShowConfirmation(false);
    toast.info("Payment cancelled");
  };

  const handlePrint = () => {
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.print();
    document.body.style.overflow = bodyOverflow;
  };

  const handleCloseModal = () => {
    setIsReceiptModalOpen(false);
    setCurrentPayment(null);
  };

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

  const handleRowClick = (sale) => {
    setSelectedSale(sale);
  };

  const getPaymentMethodDisplay = (method) => {
    const methodMap = {
      cash: "CASH",
      hbl: "HBL BANK",
      jazzcash: "JAZZCASH",
      easypaisa: "EASYPAISA",
      meezan: "MEEZAN BANK",
    };
    return methodMap[method] || method;
  };

  const renderPaymentForm = () => (
    <div className="bg-cyan-800/50 backdrop-blur-md border border-cyan-700 rounded-lg p-6 mb-6">
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        RECORD PAYMENT
      </h3>

      {!selectedSale ? (
        <div className="text-center py-8 border-2 border-dashed border-white/20 rounded-md">
          <div className="text-white text-3xl mb-3">💳</div>
          <p className="text-white italic">
            Click on a row to select installment for payment
          </p>
        </div>
      ) : selectedSale.remainingAmount <= 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-green-500/30 rounded-md bg-green-500/50">
          <div className="text-white text-3xl mb-3">✅</div>
          <p className=" font-semibold text-lg">INSTALLMENT COMPLETED</p>
          <p className=" text-sm mt-2">
            All payments have been received for this installment
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-cyan-900/40 backdrop-blur-md border border-cyan-600 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <User className="w-4 h-4" />
              CUSTOMER & INSTALLMENT DETAILS
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/70">CUSTOMER:</span>
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
                  <span className="text-white/70">CONTACT:</span>
                  <span className="text-white">
                    {customerDetails[selectedSale.customerId]?.contact || "—"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/70">PRODUCT:</span>
                  <span className="text-white font-semibold">
                    {selectedSale.productName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">REMAINING AMOUNT:</span>
                  <span className="text-white font-semibold">
                    Rs: {selectedSale.remainingAmount}/-
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">NEXT DUE AMOUNT:</span>
                  <span className="text-white font-bold">
                    Rs: {getNextDueInfo(selectedSale).amount || 0}/-
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">INSTALLMENTS:</span>
                  <span className="text-white">
                    {getPaidInstallments(selectedSale)}/
                    {getTotalInstallments(selectedSale)} PAID
                  </span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  PAYMENT AMOUNT
                </label>
                <input
                  type="text"
                  value={paymentAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
                      setPaymentAmount(value);
                    }
                  }}
                  className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                  placeholder="ENTER AMOUNT"
                />
                <p className="text-xs  text-white bg-orange-600/80 rounded-full px-2 py-1 max-w-max  mt-1">
                  REMAINING TOTAL: RS: {selectedSale.remainingAmount}/-
                </p>
                {getNextDueInfo(selectedSale).amount > 0 && (
                  <p className="text-xs text-white bg-yellow-500/80 rounded-full px-2 py-1 max-w-max  mt-1">
                    MINIMUM DUE: RS: {getNextDueInfo(selectedSale).amount}/-
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  PAYMENT DATE
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
                  PAYMENT METHOD
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                >
                  <option value="cash" className="bg-black/90">
                    CASH
                  </option>
                  <option value="easypaisa" className="bg-black/90">
                    EASYPAISA
                  </option>
                  <option value="jazzcash" className="bg-black/90">
                    JAZZCASH
                  </option>
                  <option value="meezan" className="bg-black/90">
                    MEEZAN BANK
                  </option>
                  <option value="hbl" className="bg-black/90">
                    HBL BANK
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
                CANCEL
              </button>
              <button
                type="submit"
                className="flex-1 py-3 border border-white/30 rounded-md bg-cyan-950/70 hover:bg-cyan-950 transition-all duration-300 cursor-pointer font-semibold text-white flex justify-center items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                RECORD PAYMENT
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
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
                <Calendar className="w-6 h-6 mr-2" />
                INSTALLMENT MANAGEMENT
              </h1>
              <p className="text-white/80">
                MANAGE AND TRACK INSTALLMENT PAYMENTS
              </p>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-md p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 md:col-span-2">
              <SearchIcon className="text-white" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="SEARCH "
                className="flex-1 outline-none bg-transparent text-white placeholder-white/60 uppercase"
              />
            </div>

            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
              >
                <option value="all" className="bg-black/90">
                  ALL INSTALLMENTS
                </option>
                <option value="active" className="bg-black/90">
                  ACTIVE
                </option>
                <option value="completed" className="bg-black/90">
                  COMPLETED
                </option>
              </select>
            </div>

            <div className="text-white/80 text-lg flex items-center">
              TOTAL RECORDS: {filteredSales.length}
            </div>
          </div>

          {renderPaymentForm()}

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-md overflow-x-auto scrollbar-hide">
            <table className="w-full text-white/90 min-w-[1000px]">
              <thead className="bg-white/10 text-left text-sm">
                <tr>
                  <th className="p-3">S.NO</th>
                  <th className="p-3">CUSTOMER</th>
                  <th className="p-3">PAID</th>
                  <th className="p-3">REMAINING</th>
                  <th className="p-3">DUE AMOUNT</th>
                  <th className="p-3">NEXT DUE DATE</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3">PROGRESS</th>
                  <th className="p-3">ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredSales.map((sale, index) => {
                  const status = getPaymentStatus(sale);
                  const paidInstallments = getPaidInstallments(sale);
                  const remainingInstallments = getRemainingInstallments(sale);
                  const totalInstallments = getTotalInstallments(sale);
                  const progressPercentage =
                    ((sale.finalTotal - sale.remainingAmount) /
                      sale.finalTotal) *
                    100;
                  const nextDueInfo = getNextDueInfo(sale);
                  const isOverdue = hasOverduePayments(sale);

                  const customer = customerDetails[sale.customerId];

                  return (
                    <tr
                      key={sale.id}
                      onClick={() => handleRowClick(sale)}
                      className={`border-t border-white/5 transition cursor-pointer ${
                        selectedSale?.id === sale.id
                          ? "bg-purple-600/50"
                          : isOverdue
                          ? "bg-red-600/50 hover:bg-red-600/70"
                          : "hover:bg-purple-600/30"
                      }`}
                    >
                      <td className="p-3 font-mono text-center">{index + 1}</td>
                      <td className="p-3">
                        <div className="font-semibold">
                          {customer
                            ? `${customer.firstName} ${customer.lastName}`
                            : sale.customer}
                        </div>
                        <div className="text-xs text-white/70 mt-1">
                          {sale.invoiceId}
                        </div>
                        {isOverdue && (
                          <div className="text-xs text-red-300 font-semibold mt-1">
                            ⚠️ OVERDUE
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-white font-semibold">
                        RS:{" "}
                        {sale.totalPaid ||
                          sale.finalTotal - sale.remainingAmount}
                        /-
                      </td>
                      <td className="p-3 text-white font-semibold">
                        RS: {sale.remainingAmount}/-
                      </td>
                      <td className="p-3">
                        <div className="text-center">
                          <div
                            className={`text-sm font-semibold ${
                              nextDueInfo.isOverdue
                                ? "text-red-300"
                                : "text-white"
                            }`}
                          >
                            RS: {nextDueInfo.amount}/-
                          </div>
                          {nextDueInfo.isOverdue && (
                            <div className="text-xs text-red-300">PAST DUE</div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-center">
                          <div
                            className={`text-sm font-semibold ${
                              nextDueInfo.isOverdue
                                ? "text-red-300"
                                : "text-white"
                            }`}
                          >
                            {nextDueInfo.dueDate}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 text-xs border rounded-full border-white/30 ${getStatusBadgeClassTable(
                            status
                          )}`}
                        >
                          {status}
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
                      NO INSTALLMENT RECORDS FOUND.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md z-50 p-4">
          <div className="bg-cyan-800/90 backdrop-blur-md border border-cyan-900 rounded-md p-6 w-full max-w-md text-white">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-purple-300">⚠️</span>
              CONFIRM PAYMENT RECORD
            </h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-white">CUSTOMER:</span>
                <span className="font-semibold">
                  {customerDetails[selectedSale?.customerId]
                    ? `${customerDetails[selectedSale.customerId].firstName} ${
                        customerDetails[selectedSale.customerId].lastName
                      }`
                    : selectedSale?.customer}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">PRODUCT:</span>
                <span className="font-semibold">
                  {selectedSale?.productName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">INVOICE ID:</span>
                <span className="font-mono font-bold text-white">
                  {selectedSale?.invoiceId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">PAYMENT AMOUNT:</span>
                <span className="font-semibold text-white">
                  RS: {paymentAmount}/-
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">PAYMENT DATE:</span>
                <span className="font-semibold text-white">{paymentDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">PAYMENT METHOD:</span>
                <span className="font-semibold text-white">
                  {getPaymentMethodDisplay(paymentMethod)}
                </span>
              </div>
              <div className="flex justify-between border-t border-white/20 pt-2">
                <span className="text-white">REMAINING AFTER PAYMENT:</span>
                <span className="font-bold text-white">
                  RS:{" "}
                  {selectedSale
                    ? selectedSale.remainingAmount - parseFloat(paymentAmount)
                    : 0}
                  /-
                </span>
              </div>
            </div>

            <p className="text-white text-sm mb-6 text-center bg-red-600/30 p-3 rounded border border-red-500/50">
              ⚠️ THIS ACTION CANNOT BE UNDONE. PAYMENT RECORD WILL BE PERMANENT.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCancelPayment}
                className="flex-1 py-3 border border-white/30 rounded-md bg-red-700 hover:bg-red-800 transition-all duration-300 cursor-pointer font-semibold"
              >
                CANCEL
              </button>

              <button
                onClick={handleConfirmPayment}
                className="flex-1 py-3 border border-white/30 rounded-md bg-cyan-950/70 hover:bg-cyan-950 transition-all duration-300 cursor-pointer font-semibold flex justify-center items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                CONFIRM PAYMENT
              </button>
            </div>
          </div>
        </div>
      )}

      {isViewOpen && selectedSale && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-2 md:p-4 backdrop-blur-md print:p-0">
          <div className="bg-white text-black rounded-lg w-full max-w-2xl mx-auto max-h-[95vh] overflow-y-auto scrollbar-hide relative font-sans text-sm border border-gray-300">
            {selectedSale.remainingAmount <= 0 && (
              <div className="absolute top-40 right-67 transform  z-10 print:block">
                <div className="bg-green-500 text-white text-lg font-bold py-2 px-4 rounded-2xl border-4 border-green-600 shadow-2xl text-center">
                  <div>PAID</div>
                  <div className="text-sm">COMPLETED</div>
                </div>
              </div>
            )}

            <div className="p-4 space-y-3">
              <div className="text-center border-b border-dashed border-gray-300 pb-3 mb-3">
                <h2 className="text-xl font-bold tracking-wider text-gray-900">
                  ZUBI ELECTRONICS
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  INSTALLMENT SALE DETAILS
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-semibold text-gray-700">
                    INVOICE: {selectedSale.invoiceId}
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatDateTime(selectedSale.timestamp)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">PRODUCT ID:</span>
                  <span className="text-gray-900 text-right font-mono">
                    {selectedSale.productId}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">NAME:</span>
                  <span className="text-gray-900 text-right">
                    {selectedSale.productName}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">MODEL:</span>
                  <span className="text-gray-900 text-right">
                    {selectedSale.productModel}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">CATEGORY:</span>
                  <span className="text-gray-900 text-right">
                    {selectedSale.productCategory}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">QUANTITY:</span>
                  <span className="text-gray-900 text-right">
                    {selectedSale.quantity || 1} PIECE(s)
                  </span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-300 pt-3 mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">CUSTOMER:</span>
                  <span className="text-gray-900 text-right font-mono">
                    {selectedSale.customerId} {selectedSale.customer}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">GUARANTOR:</span>
                  <span className="text-gray-900 text-right font-mono">
                    {selectedSale.guarantorId} {selectedSale.guarantor}
                  </span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-300 pt-3 mt-3 space-y-2">
                <h4 className="font-medium text-gray-700 mb-2">
                  PAYMENT SUMMARY
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    TOTAL AMOUNT:
                  </span>
                  <span className="text-gray-900 text-right font-semibold">
                    RS: {selectedSale.finalTotal}/-
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    ADVANCE PAID:
                  </span>
                  <span className="text-gray-900 text-right">
                    RS: {selectedSale.advancePaymentAmount || 0}/-
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    INSTALLMENT PAID:
                  </span>
                  <span className="text-right text-green-600 font-semibold">
                    RS:{" "}
                    {selectedSale.totalPaid ||
                      selectedSale.finalTotal - selectedSale.remainingAmount}
                    /-
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    REMAINING AMOUNT:
                  </span>
                  <span className="text-right text-orange-600 font-semibold">
                    RS: {selectedSale.remainingAmount}/-
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    MONTHLY PAYMENT:
                  </span>
                  <span className="text-gray-900 text-right">
                    RS: {selectedSale.monthlyPayment || 0}/-
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    PAYMENT PLAN:
                  </span>
                  <span className="text-gray-900 text-right">
                    {selectedSale.planMonths} MONTHS
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    PAYMENT METHOD:
                  </span>
                  <span className="text-gray-900 text-right">
                    {getPaymentMethodDisplay(selectedSale.paymentMethod)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">STATUS:</span>
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

              {selectedSale.remainingAmount > 0 && (
                <div className="border-t border-dashed border-gray-300 pt-3 mt-3">
                  <h4 className="font-medium text-gray-700 mb-2">
                    DUE INFORMATION
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-medium text-gray-700">
                      MINIMUM DUE AMOUNT:
                    </span>
                    <span
                      className={`text-right font-semibold ${
                        getNextDueInfo(selectedSale).isOverdue
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      RS: {getNextDueInfo(selectedSale).amount}/-
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-medium text-gray-700">DUE DATE:</span>
                    <span
                      className={`text-right ${
                        getNextDueInfo(selectedSale).isOverdue
                          ? "text-red-600 font-semibold"
                          : "text-gray-900"
                      }`}
                    >
                      {getNextDueInfo(selectedSale).dueDate}
                      {getNextDueInfo(selectedSale).isOverdue && (
                        <span className="text-red-500 ml-2">(OVERDUE)</span>
                      )}
                    </span>
                  </div>
                </div>
              )}

              <div className="border-t border-dashed border-gray-300 pt-3 mt-3">
                <h4 className="font-medium text-gray-700 mb-2">
                  INSTALLMENT PROGRESS
                </h4>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <span className="font-medium text-gray-700">
                    INSTALLMENTS PAID:
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
                  % PAID
                </div>
              </div>

              {selectedSale.paymentTimeline &&
                selectedSale.paymentTimeline.length > 0 && (
                  <div className="border-t border-dashed border-gray-300 pt-3 mt-3">
                    <h4 className="font-medium text-gray-700 mb-2">
                      PAYMENT SCHEDULE
                    </h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {selectedSale.paymentTimeline.map((payment, index) => {
                        const isOverdue =
                          !payment.paid &&
                          new Date(payment.dueDate) < new Date();
                        return (
                          <div
                            key={index}
                            className={`flex justify-between items-center p-2 rounded border ${
                              payment.paid
                                ? "bg-green-300 border-green-400"
                                : isOverdue
                                ? "bg-red-300 border-red-400"
                                : "bg-gray-300 border-gray-400"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-700">
                                PAYMENT {payment.paymentNumber}:
                              </span>
                              <span
                                className={`text-sm ${
                                  isOverdue
                                    ? "text-red-600 font-semibold"
                                    : "text-gray-600"
                                }`}
                              >
                                {formatDate(payment.dueDate)}
                                {isOverdue && (
                                  <span className="text-red-500 ml-1">
                                    (OVERDUE)
                                  </span>
                                )}
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
                              ) : isOverdue ? (
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                                  OVERDUE
                                </span>
                              ) : (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                  PENDING
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              <div className="text-center border-t border-dashed border-gray-300 pt-4 text-xs text-gray-600">
                <p>INSTALLMENT MANAGEMENT SYSTEM</p>
                <p>This is a computer-generated detail view.</p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 rounded-b-lg p-2 print:hidden">
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded hover:cursor-pointer bg-blue-600 text-white hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <span>🖨️</span>
                  <span>PRINT</span>
                </button>
                <button
                  onClick={() => setIsViewOpen(false)}
                  className="px-4 py-2 rounded hover:cursor-pointer bg-gray-600 text-white hover:bg-gray-700 transition font-medium"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isReceiptModalOpen && currentPayment && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-2 md:p-4 backdrop-blur-md print:p-0">
          <div className="bg-white text-black rounded-lg w-full max-w-md mx-auto max-h-[95vh] overflow-y-auto scrollbar-hide relative font-sans text-sm border border-gray-300">
            <div className="p-4 space-y-3">
              <div className="text-center border-b border-dashed border-gray-300 pb-3 mb-3">
                <h2 className="text-xl font-bold tracking-wider text-gray-900">
                  ZUBI ELECTRONICS
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  INSTALLMENT PAYMENT RECEIPT
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-semibold text-gray-700">
                    RECEIPT ID: {currentPayment.receiptId}
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatDate(currentPayment.timestamp)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    MAIN INVOICE:
                  </span>
                  <span className="text-gray-900 text-right font-mono">
                    {currentPayment.invoiceId}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">CUSTOMER:</span>
                  <span className="text-gray-900 text-right">
                    {currentPayment.customer}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">PRODUCT:</span>
                  <span className="text-gray-900 text-right">
                    {currentPayment.productName}
                  </span>
                </div>
              </div>

              <div className="border-t border-dashed border-gray-300 pt-3 mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    PAYMENT DATE:
                  </span>
                  <span className="text-gray-900 text-right">
                    {formatDate(currentPayment.paymentDate)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    PAYMENT METHOD:
                  </span>
                  <span className="text-gray-900 text-right">
                    {getPaymentMethodDisplay(currentPayment.paymentMethod)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    AMOUNT PAID:
                  </span>
                  <span className="text-gray-900 text-right font-semibold">
                    RS: {currentPayment.paymentAmount}/-
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    REMAINING BALANCE:
                  </span>
                  <span className="text-gray-900 text-right">
                    RS: {currentPayment.remainingAmount}/-
                  </span>
                </div>
              </div>

              <div className="text-center border-t border-dashed border-gray-300 pt-4 text-xs text-gray-600">
                <p>THANK YOU FOR YOUR PAYMENT!</p>
                <p>This is a computer-generated receipt.</p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 rounded-b-lg p-2 print:hidden">
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded hover:cursor-pointer bg-blue-600 text-white hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <span>🖨️</span>
                  <span>PRINT</span>
                </button>
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded hover:cursor-pointer bg-gray-600 text-white hover:bg-gray-700 transition font-medium"
                >
                  CLOSE
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
