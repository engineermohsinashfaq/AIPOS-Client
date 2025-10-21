// |===============================| Import Components |===============================|
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { TrendingUp } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";

// Generate invoice number for installment sales - OUTSIDE COMPONENT
const generateInvoiceNumber = () => {
  try {
    const existingSales =
      JSON.parse(localStorage.getItem("salesHistory")) || [];
    const installmentSales = existingSales.filter(
      (sale) => sale.type === "installment-sale"
    );

    if (installmentSales.length === 0) {
      return "INST-0001";
    }

    const lastInvoice = installmentSales
      .map((sale) => sale.invoiceId)
      .filter((invoice) => invoice.startsWith("INST-"))
      .sort((a, b) => {
        const numA = parseInt(a.split("-")[1]);
        const numB = parseInt(b.split("-")[1]);
        return numB - numA;
      })[0];

    if (!lastInvoice) {
      return "INST-0001";
    }

    const lastNumber = parseInt(lastInvoice.split("-")[1]);
    const nextNumber = lastNumber + 1;
    return `INST-${nextNumber.toString().padStart(8, "0")}`;
  } catch (error) {
    console.error("Error generating invoice number:", error);
    return `INST-${Date.now().toString().slice(-8)}`;
  }
};

// |===============================| Installment Component |===============================|
const Installment = () => {
  const navigate = useNavigate();

  // Date formatting utility function
  const formatDateTime = useCallback((dateInput) => {
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
  }, []);



  // Helper function to format numbers to 2 decimal places
  const formatNumber = useCallback((number) => {
    if (!number || isNaN(number)) return "0.00";
    return parseFloat(number).toFixed(2);
  }, []);

  // Helper function to calculate next month's date
  const getNextMonthDate = useCallback((date, months) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    if (d.getDate() !== new Date(date).getDate()) {
      d.setDate(0);
    }
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  // Load products from localStorage
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [guarantors, setGuarantors] = useState([]);

  // Transaction State
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("1"); // NEW: Quantity state
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("0");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedGuarantorId, setSelectedGuarantorId] = useState("");
  const [planMonths, setPlanMonths] = useState(3);
  const [commissionRate, setCommissionRate] = useState("0");
  const [advancePayment, setAdvancePayment] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [newInvoiceId, setNewInvoiceId] = useState("");
  const [showFullAdvanceWarning, setShowFullAdvanceWarning] = useState(false);

  // Load products and data on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("products");
      setProducts(stored ? JSON.parse(stored) : []);
    } catch {
      console.error("Error loading products from localStorage.");
      setProducts([]);
    }

    // Load customers from all_customers_data
    try {
      const storedCustomers = localStorage.getItem("all_customers_data");
      if (storedCustomers) {
        const customersData = JSON.parse(storedCustomers);
        // Transform customer data to match expected format
        const formattedCustomers = customersData.map((customer) => ({
          id: customer.customerId,
          name: `${customer.firstName} ${customer.lastName}`,
          contact: customer.contact,
          cnic: customer.cnic,
          city: customer.city,
          status: customer.status || "Active",
          address: customer.address,
        }));
        setCustomers(formattedCustomers);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error("Error loading customers:", error);
      setCustomers([]);
    }

    // Load guarantors from all_guarantors_data
    try {
      const storedGuarantors = localStorage.getItem("all_guarantors_data");
      if (storedGuarantors) {
        const guarantorsData = JSON.parse(storedGuarantors);
        // Transform guarantor data to match expected format
        const formattedGuarantors = guarantorsData.map((guarantor) => ({
          id: guarantor.guarantorId,
          name: `${guarantor.firstName} ${guarantor.lastName}`,
          contact: guarantor.contact,
          cnic: guarantor.cnic,
          city: guarantor.city,
          address: guarantor.address,
        }));
        setGuarantors(formattedGuarantors);
      } else {
        setGuarantors([]);
      }
    } catch (error) {
      console.error("Error loading guarantors:", error);
      setGuarantors([]);
    }

    // Generate invoice number
    setNewInvoiceId(generateInvoiceNumber());
  }, []);

  // Derived State with 2 decimal places
  const productBasePrice = useMemo(() => {
    const product = products.find((p) => p.productId === selectedProductId);
    const price = product
      ? parseFloat(product.pricePerUnit) || parseFloat(product.price) || 0
      : 0;
    return parseFloat(formatNumber(price));
  }, [selectedProductId, products, formatNumber]);

  // NEW: Calculate total price based on quantity
  const totalBasePrice = useMemo(() => {
    const basePrice = productBasePrice;
    const qty = parseInt(quantity) || 1;
    return parseFloat(formatNumber(basePrice * qty));
  }, [productBasePrice, quantity, formatNumber]);

  // NEW: Calculate total selling price based on quantity
  const totalSellingPrice = useMemo(() => {
    const unitPrice = parseFloat(price) || 0;
    const qty = parseInt(quantity) || 1;
    return parseFloat(formatNumber(unitPrice * qty));
  }, [price, quantity, formatNumber]);

  const commissionAmount = useMemo(() => {
    const salePrice = totalSellingPrice; // CHANGED: Use total selling price instead of unit price
    const rate = parseFloat(commissionRate) || 0;
    if (salePrice <= 0) return 0;
    const amount = salePrice * (rate / 100);
    return parseFloat(formatNumber(amount));
  }, [totalSellingPrice, commissionRate, formatNumber]);

  const discountAmount = useMemo(() => {
    const salePrice = totalSellingPrice; // CHANGED: Use total selling price instead of unit price
    const discountPercent = parseFloat(discount) || 0;
    if (salePrice <= 0 || discountPercent <= 0) return 0;
    const amount = salePrice * (discountPercent / 100);
    return parseFloat(formatNumber(amount));
  }, [totalSellingPrice, discount, formatNumber]);

  const subtotal = useMemo(() => {
    const salePrice = totalSellingPrice; // CHANGED: Use total selling price instead of unit price
    const amount = salePrice - discountAmount;
    return parseFloat(formatNumber(amount));
  }, [totalSellingPrice, discountAmount, formatNumber]);

  const finalTotal = useMemo(() => {
    const amount = subtotal + commissionAmount;
    return parseFloat(formatNumber(amount));
  }, [subtotal, commissionAmount, formatNumber]);

  const advancePaymentAmount = useMemo(() => {
    const advanceAmount = parseFloat(advancePayment) || 0;
    if (finalTotal <= 0 || advanceAmount <= 0) return 0;
    const amount = Math.min(advanceAmount, finalTotal);
    return parseFloat(formatNumber(amount));
  }, [finalTotal, advancePayment, formatNumber]);

  const remainingAmount = useMemo(() => {
    const amount = finalTotal - advancePaymentAmount;
    return parseFloat(formatNumber(amount));
  }, [finalTotal, advancePaymentAmount, formatNumber]);

  const monthlyPayment = useMemo(() => {
    if (remainingAmount <= 0 || planMonths <= 0) return 0;
    const amount = remainingAmount / planMonths;
    return parseFloat(formatNumber(amount));
  }, [remainingAmount, planMonths, formatNumber]);

  // NEW: Check if advance payment is 100% and remaining amount is 0
  const isFullAdvancePayment = useMemo(() => {
    return advancePaymentAmount >= finalTotal && remainingAmount <= 0;
  }, [advancePaymentAmount, finalTotal, remainingAmount]);

  // NEW: Check if quantity is available
  const isQuantityAvailable = useMemo(() => {
    if (!selectedProduct) return true;
    const availableQty = parseInt(selectedProduct.quantity) || 0;
    const requestedQty = parseInt(quantity) || 1;
    return requestedQty <= availableQty;
  }, [selectedProduct, quantity]);

  // Generate timeline automatically when values change
  const timeline = useMemo(() => {
    if (remainingAmount <= 0 || planMonths <= 0) return [];

    const today = new Date();
    const timelineData = [];

    for (let i = 1; i <= planMonths; i++) {
      timelineData.push({
        dueDate: getNextMonthDate(today, i),
        paymentAmount: monthlyPayment,
        paymentNumber: i,
      });
    }

    return timelineData;
  }, [remainingAmount, planMonths, monthlyPayment, getNextMonthDate]);

  // Get selected customer status
  const selectedCustomerStatus = useMemo(() => {
    if (!selectedCustomerId) return null;
    const customer = customers.find((c) => c.id === selectedCustomerId);
    return customer ? customer.status : null;
  }, [selectedCustomerId, customers]);

  // Product selection effect
  useEffect(() => {
    if (selectedProductId) {
      const found = products.find((p) => p.productId === selectedProductId);
      if (found) {
        const pricePerUnit =
          parseFloat(found.pricePerUnit) || parseFloat(found.price) || 0;
        setSelectedProduct({
          productId: found.productId,
          name: found.name,
          model: found.model,
          category: found.category,
          quantity: found.quantity,
          company: found.company,
          pricePerUnit: pricePerUnit.toString(),
          value: found.value || "0.00",
        });
        setQuantity("1"); // Reset quantity to 1 when product changes
        setPrice("");
        setDiscount("0");
        setCommissionRate("0");
        setAdvancePayment("0");
        setPaymentMethod("cash");
        setShowFullAdvanceWarning(false);
      } else {
        setSelectedProduct(null);
        setQuantity("1");
        setPrice("");
        setDiscount("0");
        setCommissionRate("0");
        setAdvancePayment("0");
        setPaymentMethod("cash");
        setShowFullAdvanceWarning(false);
      }
    } else {
      setSelectedProduct(null);
      setQuantity("1");
      setPrice("");
      setDiscount("0");
      setCommissionRate("0");
      setAdvancePayment("0");
      setPaymentMethod("cash");
      setShowFullAdvanceWarning(false);
    }
  }, [selectedProductId, products]);

  // Format payment method for display
  const getPaymentMethodDisplay = useCallback((method) => {
    const methodMap = {
      cash: "Cash",
      hbl: "HBL Bank",
      jazzcash: "JazzCash",
      easypaisa: "EasyPaisa",
      meezan: "Meezan Bank",
    };
    return methodMap[method] || method;
  }, []);

  const validateFields = useCallback(() => {
    if (!selectedProduct) {
      toast.error("Please select a product!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      return false;
    }

    // NEW: Validate quantity
    const qty = parseInt(quantity) || 1;
    if (!quantity || isNaN(qty) || qty <= 0) {
      toast.error("Valid quantity is required!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      return false;
    }

    // NEW: Check if quantity is available
    const availableQty = parseInt(selectedProduct.quantity) || 0;
    if (qty > availableQty) {
      toast.error(`Only ${availableQty} units available in stock!`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      return false;
    }

    // Validate price (REQUIRED)
    const salePrice = parseFloat(price);
    if (!price || isNaN(salePrice) || salePrice <= 0) {
      toast.error("Valid selling price is required!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      return false;
    }

    // Validate discount (REQUIRED but can be 0)
    const discountPercent = parseFloat(discount) || 0;
    if (
      discount === "" ||
      isNaN(discountPercent) ||
      discountPercent < 0 ||
      discountPercent > 100
    ) {
      toast.error("Discount is required and must be between 0% and 100%!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      return false;
    }

    // Validate commission rate (REQUIRED but can be 0)
    const commissionPercent = parseFloat(commissionRate) || 0;
    if (
      commissionRate === "" ||
      isNaN(commissionPercent) ||
      commissionPercent < 0 ||
      commissionPercent > 100
    ) {
      toast.error(
        "Commission rate is required and must be between 0% and 100%!",
        {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        }
      );
      return false;
    }

    // Validate advance payment
    const advanceAmount = parseFloat(advancePayment) || 0;
    if (
      advancePayment === "" ||
      isNaN(advanceAmount) ||
      advanceAmount < 0 ||
      advanceAmount > finalTotal
    ) {
      toast.error(
        `Advance payment is required and must be between Rs 0 and ${(
          finalTotal
        )}!`,
        {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        }
      );
      return false;
    }

    // Validate payment method
    if (!paymentMethod) {
      toast.error("Please select a payment method!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      return false;
    }

    if (!selectedCustomerId) {
      toast.error("Please select a customer!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      return false;
    }

    // Validate customer status
    const customer = customers.find((c) => c.id === selectedCustomerId);
    if (customer) {
      if (customer.status === "Inactive") {
        toast.error(
          "Customer status is Inactive! Cannot process installment sale.",
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "dark",
          }
        );
        return false;
      } else if (customer.status === "Suspended") {
        toast.error(
          "Customer status is Suspended! Cannot process installment sale.",
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "dark",
          }
        );
        return false;
      }
    }

    if (!selectedGuarantorId) {
      toast.error("Please select a guarantor!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
      return false;
    }

    return true;
  }, [
    selectedProduct,
    quantity,
    price,
    discount,
    commissionRate,
    advancePayment,
    finalTotal,
    paymentMethod,
    selectedCustomerId,
    selectedGuarantorId,
    customers,
    ,
  ]);

  const processCheckout = useCallback(() => {
    const invoiceNumber = newInvoiceId || generateInvoiceNumber();
    const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
    const selectedGuarantor = guarantors.find(
      (g) => g.id === selectedGuarantorId
    );

    const transactionDetails = {
      id: crypto.randomUUID(),
      invoiceId: invoiceNumber,
      timestamp: new Date().toISOString(),
      type: "installment-sale",
      productId: selectedProduct.productId,
      productName: selectedProduct.name,
      productModel: selectedProduct.model,
      productCategory: selectedProduct.category,
      quantity: parseInt(quantity), // NEW: Include quantity in transaction
      customerType: "installment",
      customer: selectedCustomer?.name,
      customerId: selectedCustomer?.id,
      customerStatus: selectedCustomer?.status,
      guarantor: selectedGuarantor?.name,
      guarantorId: selectedGuarantor?.id,
      unitPrice: parseFloat(price), // NEW: Store unit price separately
      salePrice: totalSellingPrice, // CHANGED: Use total selling price
      discount: parseFloat(discount),
      discountAmount: discountAmount,
      subtotal: subtotal,
      commissionRate: `${commissionRate}%`,
      commissionAmount: commissionAmount,
      advancePayment: advancePaymentAmount,
      advancePaymentAmount: advancePaymentAmount,
      remainingAmount: remainingAmount,
      planMonths: planMonths,
      monthlyPayment: monthlyPayment,
      finalTotal: finalTotal,
      paymentTimeline: timeline,
      company: selectedProduct.company,
      pricePerUnit: selectedProduct.pricePerUnit,
      inventoryValue: selectedProduct.value,
      paymentMethod: paymentMethod,
      isFullAdvancePayment: isFullAdvancePayment,
    };

    // Update product stock in localStorage (reduce quantity for installment)
    const updatedProducts = products.map((p) => {
      if (p.productId === selectedProduct.productId) {
        const currentQty = parseInt(p.quantity) || 0;
        const soldQty = parseInt(quantity) || 1;
        const newQty = Math.max(0, currentQty - soldQty);
        
        return {
          ...p,
          quantity: newQty.toString(),
          updatedOn: new Date().toLocaleString(),
          updatedAt: new Date().toISOString(),
        };
      }
      return p;
    });

    localStorage.setItem("products", JSON.stringify(updatedProducts));
    setProducts(updatedProducts);

    // Add to sales history
    const existingSalesHistory =
      JSON.parse(localStorage.getItem("salesHistory")) || [];
    const updatedSalesHistory = [...existingSalesHistory, transactionDetails];
    localStorage.setItem("salesHistory", JSON.stringify(updatedSalesHistory));

    // Set current transaction for receipt
    setCurrentTransaction(transactionDetails);

    // Show success toast with different message for full advance payment
    if (isFullAdvancePayment) {
      toast.success(
        "Installment sale completed with 100% advance payment! Consider cash sales for full payments.",
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        }
      );
    } else {
      toast.success("Installment sale completed successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
      });
    }

    // Open receipt modal
    setIsReceiptModalOpen(true);
    setShowConfirmation(false);
    setShowFullAdvanceWarning(false);

    // Reset state for a new transaction
    setSelectedProductId("");
    setSelectedProduct(null);
    setQuantity("1"); // Reset quantity
    setPrice("");
    setDiscount("0");
    setSelectedCustomerId("");
    setSelectedGuarantorId("");
    setCommissionRate("0");
    setAdvancePayment("0");
    setPaymentMethod("cash");
    setPlanMonths(3);
    setNewInvoiceId(generateInvoiceNumber());
  }, [
    newInvoiceId,
    customers,
    selectedCustomerId,
    guarantors,
    selectedGuarantorId,
    selectedProduct,
    quantity,
    price,
    totalSellingPrice,
    discount,
    discountAmount,
    subtotal,
    commissionRate,
    commissionAmount,
    advancePaymentAmount,
    remainingAmount,
    planMonths,
    monthlyPayment,
    finalTotal,
    timeline,
    products,
    paymentMethod,
    isFullAdvancePayment,
  ]);

  const handleCheckout = useCallback(() => {
    if (!validateFields()) {
      return;
    }

    // Check for full advance payment and prevent proceeding
    if (isFullAdvancePayment) {
      setShowFullAdvanceWarning(true);
      toast.error(
        "Cannot process installment sale with 100% advance payment. Please make a cash sale instead or reduce the advance payment amount.",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        }
      );
      return; // Prevent proceeding to confirmation
    }

    setShowConfirmation(true);
  }, [validateFields, isFullAdvancePayment]);

  const handleConfirmCheckout = useCallback(() => {
    processCheckout();
  }, [processCheckout]);

  const handleCancelCheckout = useCallback(() => {
    setShowConfirmation(false);
  }, []);

  // NEW: Quantity change handler
  const handleQuantityChange = useCallback((e) => {
    const value = e.target.value;
    // Allow only positive integers
    if (value === "" || /^\d+$/.test(value)) {
      const qty = parseInt(value) || 1;
      if (qty >= 1) {
        setQuantity(value);
      }
    }
    setShowFullAdvanceWarning(false);
  }, []);

  const handlePriceChange = useCallback((e) => {
    const value = e.target.value;
    // Allow only numbers and decimal point with max 2 decimal places
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setPrice(value);
    }
    setShowFullAdvanceWarning(false);
  }, []);

  const handleDiscountChange = useCallback((e) => {
    const value = e.target.value;
    // Allow only numbers and decimal point with max 2 decimal places
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setDiscount(value);
    }
    setShowFullAdvanceWarning(false);
  }, []);

  const handleCommissionChange = useCallback((e) => {
    const value = e.target.value;
    // Allow only numbers and decimal point with max 2 decimal places
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setCommissionRate(value);
    }
    setShowFullAdvanceWarning(false);
  }, []);

  const handleAdvancePaymentChange = useCallback((e) => {
    const value = e.target.value;
    // Allow only numbers and decimal point with max 2 decimal places
    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
      setAdvancePayment(value);
    }
    setShowFullAdvanceWarning(false);
  }, []);

  const handlePaymentMethodChange = useCallback((e) => {
    setPaymentMethod(e.target.value);
    setShowFullAdvanceWarning(false);
  }, []);

  const handlePrint = useCallback(() => {
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.print();
    document.body.style.overflow = bodyOverflow;
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsReceiptModalOpen(false);
    navigate("/up-dashboard");
  }, [navigate]);

  const renderInputGroup = useCallback(
    ({ label, children }) => (
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-1">
          {label}
        </label>
        {children}
      </div>
    ),
    []
  );

  const renderTimelineTable = useCallback(
    () => (
      <div className="mt-6">
        <h3 className="text-xl font-semibold text-white mb-3 flex items-center">
          <span className="text-white mr-2">📅</span>
          Payment Timeline ({planMonths} Payments)
        </h3>
        <div className="overflow-x-auto shadow-lg rounded-md border border-white/20 backdrop-blur-mdb">
          <table className="min-w-full divide-y divide-white/20">
            <thead className=" bg-cyan-950/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                  Payment Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/5 divide-y divide-white/10">
              {timeline.map((item, index) => (
                <tr
                  key={index}
                  className={
                    index % 2 === 0 ? "bg-cyan-950/30" : "bg-cyan-950/30"
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                    {item.paymentNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {item.dueDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-white">
                    {(item.paymentAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ),
    [planMonths, timeline, ]
  );

  const isCheckoutEnabled =
    selectedProductId &&
    quantity &&
    parseInt(quantity) > 0 &&
    isQuantityAvailable &&
    price &&
    parseFloat(price) > 0 &&
    discount !== "" &&
    !isNaN(parseFloat(discount)) &&
    parseFloat(discount) >= 0 &&
    parseFloat(discount) <= 100 &&
    commissionRate !== "" &&
    !isNaN(parseFloat(commissionRate)) &&
    parseFloat(commissionRate) >= 0 &&
    parseFloat(commissionRate) <= 100 &&
    advancePayment !== "" &&
    !isNaN(parseFloat(advancePayment)) &&
    parseFloat(advancePayment) >= 0 &&
    parseFloat(advancePayment) <= finalTotal &&
    paymentMethod &&
    selectedCustomerId &&
    selectedGuarantorId;

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

      <div
        className={`bg-white/10 p-6 rounded-lg border border-white/20 backdrop-blur-md transition-all duration-300 ${
          isReceiptModalOpen || showConfirmation ? "backdrop-blur-md" : ""
        }`}
      >
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2" />
          Installment Sales
        </h2>

        {/* Product Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-white mb-1">
            Select Product *
          </label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
          >
            <option value="" className="bg-black/90">
              -- Select Product --
            </option>
            {products.map((p) => (
              <option
                key={p.productId}
                value={p.productId}
                className="bg-black/90"
              >
                {p.name.toUpperCase()} - {p.model.toUpperCase()} (Stock: {p.quantity})
              </option>
            ))}
          </select>
        </div>

        {/* Conditional rendering based on product selection */}
        {!selectedProduct ? (
          <div className="text-center py-12 border-2 border-dashed border-white/20 rounded-md bg-white/5 mb-6">
            <div className="text-white text-4xl mb-4">🛒</div>
            <p className="text-white italic text-base">
              Select a product to begin installment sale
            </p>
            <p className="text-white text-xs mt-2">
              Choose from the dropdown above to process an installment
              transaction
            </p>
          </div>
        ) : (
          <>
            {/* Product Information Section */}
            <div className="bg-cyan-800/70 backdrop-blur-md border border-cyan-800 rounded-md p-4 md:p-6 shadow-lg mb-6">
              <h3 className="text-lg md:text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-white">📋</span>
                Product Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm">Invoice No:</span>
                    <span className="font-mono font-bold text-white text-sm md:text-base">
                      {newInvoiceId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm">Product ID:</span>
                    <span className="font-mono font-semibold text-white text-sm md:text-base">
                      {selectedProduct.productId}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm">Name:</span>
                    <span className="font-semibold text-white text-sm md:text-base">
                      {selectedProduct.name.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm">Model:</span>
                    <span className="font-semibold text-white text-sm md:text-base">
                      {selectedProduct.model.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm">Category:</span>
                    <span className="font-semibold text-white text-sm md:text-base">
                      {selectedProduct.category.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white text-sm">Current Stock:</span>
                    <span className={`font-semibold text-sm md:text-base ${
                      parseInt(selectedProduct.quantity) > 0 ? 'text-white' : 'text-red-400'
                    }`}>
                      {selectedProduct.quantity} pcs
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* NEW: Quantity Input */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              {renderInputGroup({
                label: "Quantity *",
                children: (
                  <div>
                    <input
                      type="text"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                      placeholder="Enter quantity"
                      required
                    />
                    {!isQuantityAvailable && (
                      <div className="mt-1 text-xs text-white">
                        Only {selectedProduct.quantity} units available!
                      </div>
                    )}
                  </div>
                ),
              })}

              {renderInputGroup({
                label: "Unit Price (PKR) *",
                children: (
                  <input
                    type="text"
                    value={price}
                    onChange={handlePriceChange}
                    className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                    placeholder="Enter unit price"
                    required
                  />
                ),
              })}

              {renderInputGroup({
                label: "Discount (%) *",
                children: (
                  <input
                    type="text"
                    value={discount}
                    onChange={handleDiscountChange}
                    className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                    placeholder="Enter discount %"
                    required
                  />
                ),
              })}

              {renderInputGroup({
                label: "Commission Rate (%) *",
                children: (
                  <input
                    type="text"
                    value={commissionRate}
                    onChange={handleCommissionChange}
                    className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                    placeholder="Enter commission rate"
                    required
                  />
                ),
              })}

              {renderInputGroup({
                label: "Advance Payment *",
                children: (
                  <input
                    type="text"
                    value={advancePayment}
                    onChange={handleAdvancePaymentChange}
                    className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                    placeholder="Enter advance amount"
                    required
                  />
                ),
              })}
            </div>

            {/* Payment Method Dropdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {renderInputGroup({
                label: "Payment Method *",
                children: (
                  <select
                    value={paymentMethod}
                    onChange={handlePaymentMethodChange}
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
                ),
              })}

              {renderInputGroup({
                label: "Payment Plan (Months) *",
                children: (
                  <select
                    value={planMonths}
                    onChange={(e) => setPlanMonths(Number(e.target.value))}
                    className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                  >
                    {[...Array(24).keys()]
                      .map((i) => i + 1)
                      .map((m) => (
                        <option key={m} value={m} className="bg-black/90">
                          {m} {m === 1 ? "Month" : "Months"}
                        </option>
                      ))}
                  </select>
                ),
              })}
            </div>

            {/* Customer and Guarantor Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {renderInputGroup({
                label: "Select Customer *",
                children: (
                  <div>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                    >
                      <option value="" className="bg-black/90">
                        -- Select Customer --
                      </option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id} className="bg-black/90">
                          {c.name} {c.status && `(${c.status})`}
                        </option>
                      ))}
                    </select>
                    {selectedCustomerStatus && (
                      <div
                        className={`mt-1 text-xs font-medium ${
                          selectedCustomerStatus === "Active"
                            ? "text-green-400"
                            : selectedCustomerStatus === "Inactive"
                            ? "text-red-400"
                            : "text-yellow-400"
                        }`}
                      >
                        Status: {selectedCustomerStatus}
                      </div>
                    )}
                  </div>
                ),
              })}

              {renderInputGroup({
                label: "Select Guarantor *",
                children: (
                  <select
                    value={selectedGuarantorId}
                    onChange={(e) => setSelectedGuarantorId(e.target.value)}
                    className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                  >
                    <option value="" className="bg-black/90">
                      -- Select Guarantor --
                    </option>
                    {guarantors.map((g) => (
                      <option key={g.id} value={g.id} className="bg-black/90">
                        {g.name}
                      </option>
                    ))}
                  </select>
                ),
              })}
            </div>

            {/* Price Breakdown with Advance Payment */}
            <div className="bg-cyan-800/70 backdrop-blur-md border border-cyan-800 rounded-md p-4 mb-6">
              <h4 className="text-lg font-semibold text-white mb-3">
                Price Breakdown
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/80">Quantity:</span>
                  <span className="text-white font-medium">{quantity} units</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Unit Price:</span>
                  <span className="text-white font-medium">
                    {(parseFloat(price) || 0)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-white/80">Total Selling Price:</span>
                  <span className="text-white font-bold">
                    {(totalSellingPrice)}
                  </span>
                </div>
                {parseFloat(discount) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-white/80">
                      Discount ({discount}%):
                    </span>
                    <span className="text-white font-medium">
                      - {(discountAmount)}
                    </span>
                  </div>
                )}
                {parseFloat(commissionRate) > 0 && (
                  <div className="flex justify-between">
                    <span className="text-white/80">
                      Commission ({commissionRate}%):
                    </span>
                    <span className="text-white font-medium">
                      + {(commissionAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between ">
                  <span className="text-white/80">Subtotal:</span>
                  <span className="text-white font-medium">
                    {(subtotal)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-white/80">Payment Method:</span>
                  <span className="text-white font-medium">
                    {getPaymentMethodDisplay(paymentMethod)}
                  </span>
                </div>

                {advancePaymentAmount > 0 && (
                  <>
                    <div className="flex justify-between ">
                      <span className="text-white/80">Advance Payment:</span>
                      <span className="text-white font-medium">
                        - {(advancePaymentAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white font-semibold">
                        Remaining Amount:
                      </span>
                      <span className="text-white font-bold">
                        {(remainingAmount)}
                      </span>
                    </div>
                  </>
                )}

                <div className="flex justify-between text-white mb-2">
                  <span className="text-white/80">Monthly Payment:</span>
                  <span className=" font-semibold ">
                    {(monthlyPayment)}
                  </span>
                </div>
                
              </div>
              <div className="flex justify-between border-t border-white/10 pt-2 text-white ">
                <span className=" font-semibold">Final Total:</span>
                <span className=" font-bold text-lg">
                  {(finalTotal)}
                </span>
              </div>

              {/* Warning message for full advance payment - Only show when user tries to checkout */}
              {showFullAdvanceWarning && (
                <div className="mt-3 p-3 bg-red-500/20 border border-red-500/40 rounded-md">
                  <div className="flex items-center gap-2 text-red-300 text-sm">
                    <span>⚠️</span>
                    <span className="font-semibold">
                      Full Advance Payment Detected
                    </span>
                  </div>
                  <p className="text-red-200 text-xs mt-1">
                    You have paid 100% advance payment with no remaining
                    installments. Installment sales require ongoing payments.
                    Please make a cash sale instead or reduce the advance payment amount.
                  </p>
                </div>
              )}
            </div>

            {/* Payment Timeline - AUTO GENERATED */}
            {timeline.length > 0 && renderTimelineTable()}

            {/* Checkout Section */}
            <div className="mt-6 pt-6 border-t border-white/30">
              <button
                onClick={handleCheckout}
                disabled={
                  !isCheckoutEnabled ||
                  (selectedCustomerStatus &&
                    selectedCustomerStatus !== "Active") ||
                    !isQuantityAvailable
                }
                className={`w-full py-4 rounded-md text-lg transition-all duration-300 cursor-pointer font-bold flex justify-center items-center gap-3 shadow-lg ${
                  isCheckoutEnabled && selectedCustomerStatus === "Active" && isQuantityAvailable
                    ? "bg-cyan-950/80 hover:bg-cyan-950 border border-white/30 hover:shadow-cyan-500/25"
                    : "bg-gray-600 text-gray-400 cursor-not-allowed border border-gray-600"
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                Process Installment Sale
              </button>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md z-50 p-4">
          <div className="bg-cyan-800/90 backdrop-blur-md border border-cyan-900 rounded-md p-6 w-full max-w-md text-white">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-purple-300">⚠️</span>
              Confirm Installment Sale
            </h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-white">Product:</span>
                <span className="font-semibold">{selectedProduct?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Quantity:</span>
                <span className="font-semibold">{quantity} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Invoice ID:</span>
                <span className="font-mono font-bold text-white">
                  {newInvoiceId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Customer:</span>
                <span className="font-semibold text-white">
                  {customers.find((c) => c.id === selectedCustomerId)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Customer Status:</span>
                <span
                  className={`font-semibold ${
                    selectedCustomerStatus === "Active"
                      ? "text-green-400"
                      : selectedCustomerStatus === "Inactive"
                      ? "text-red-400"
                      : "text-yellow-400"
                  }`}
                >
                  {selectedCustomerStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Guarantor:</span>
                <span className="font-semibold text-white">
                  {guarantors.find((g) => g.id === selectedGuarantorId)?.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Unit Price:</span>
                <span className="font-semibold text-white">
                  {(parseFloat(price))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Total Selling Price:</span>
                <span className="font-semibold text-white">
                  {(totalSellingPrice)}
                </span>
              </div>
              {parseFloat(discount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-white">Discount:</span>
                  <span className="font-semibold text-white">
                    {discount}% ({(discountAmount)})
                  </span>
                </div>
              )}
              {parseFloat(commissionRate) > 0 && (
                <div className="flex justify-between">
                  <span className="text-white">Commission:</span>
                  <span className="font-semibold text-white">
                    {commissionRate}% ({(commissionAmount)})
                  </span>
                </div>
              )}
              {advancePaymentAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-white">Advance Payment:</span>
                  <span className="font-semibold text-white">
                    {(advancePaymentAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-white">Payment Method:</span>
                <span className="font-semibold text-white">
                  {getPaymentMethodDisplay(paymentMethod)}
                </span>
              </div>
              <div className="flex justify-between border-t border-white/20 pt-2">
                <span className="text-white">Final Amount:</span>
                <span className="font-bold text-white">
                  {(finalTotal)}
                </span>
              </div>
              {advancePaymentAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-white">Remaining Amount:</span>
                  <span className="font-semibold text-white">
                    {(remainingAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-white">Monthly Payment:</span>
                <span className="font-semibold text-white">
                  {(monthlyPayment)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Payment Plan:</span>
                <span className="font-semibold text-white">
                  {planMonths} months
                </span>
              </div>
            </div>

            <p className="text-white text-sm mb-6">
              Are you sure you want to process this installment sale
              transaction?
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCancelCheckout}
                className="flex-1 py-3 border border-white/30 rounded-md bg-red-700 hover:bg-red-800 transition-all duration-300 cursor-pointer font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmCheckout}
                className="flex-1 py-3 border border-white/30 rounded-md bg-cyan-950/70 hover:bg-cyan-950 transition-all duration-300 cursor-pointer font-semibold flex justify-center items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal with Advance Payment */}
      {isReceiptModalOpen && currentTransaction && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-2 md:p-4 backdrop-blur-md print:p-0">
          <div className="bg-white text-black rounded-lg w-full max-w-md mx-auto max-h-[95vh] overflow-y-auto scrollbar-hide relative font-sans text-sm border border-gray-300">
            <div className="p-4 space-y-3">
              {/* Header section with company info */}
              <div className="text-center border-b border-dashed border-gray-300 pb-3 mb-3">
                <h2 className="text-xl font-bold tracking-wider text-gray-900">
                  ZUBI ELECTRONICS
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Installment Sale Receipt
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-semibold text-gray-700">
                    Invoice: {currentTransaction.invoiceId}
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatDateTime(currentTransaction.timestamp)}
                  </p>
                </div>
              </div>

              {/* Product details section */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Product ID:</span>
                  <span className="text-gray-900 text-right font-mono">
                    {currentTransaction.productId}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="text-gray-900 text-right">
                    {currentTransaction.productName.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Model:</span>
                  <span className="text-gray-900 text-right">
                    {currentTransaction.productModel.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Category:</span>
                  <span className="text-gray-900 text-right">
                    {currentTransaction.productCategory.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Quantity:</span>
                  <span className="text-gray-900 text-right">
                    {currentTransaction.quantity} units
                  </span>
                </div>
              </div>

              {/* Customer and Guarantor Information */}
              <div className="border-t border-dashed border-gray-300 pt-3 mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    C-ID:
                  </span>
                  <span className="text-gray-900 text-right">
                    {currentTransaction.customerId}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Customer:</span>
                  <span className="text-gray-900 text-right">
                    {currentTransaction.customer.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    G-ID:
                  </span>
                  <span className="text-gray-900 text-right">
                    {currentTransaction.guarantorId}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Guarantor:</span>
                  <span className="text-gray-900 text-right">
                    {currentTransaction.guarantor.toUpperCase()}
                  </span>
                </div>
                
              </div>

              {/* Sale details section */}
              <div className="border-t border-dashed border-gray-300 pt-3 mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Unit Price:</span>
                  <span className="text-gray-900 text-right">
                    {(currentTransaction.unitPrice)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Total Price:</span>
                  <span className="text-gray-900 text-right">
                    {(currentTransaction.salePrice)}
                  </span>
                </div>
                {currentTransaction.discount > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-medium text-gray-700">Discount:</span>
                    <span className="text-gray-900 text-right">
                      {currentTransaction.discount}% (
                      {(currentTransaction.discountAmount)})
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Subtotal:</span>
                  <span className="text-gray-900 text-right">
                    {(currentTransaction.subtotal)}
                  </span>
                </div>
                {currentTransaction.commissionAmount > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-medium text-gray-700">
                      Commission:
                    </span>
                    <span className="text-gray-900 text-right">
                      {currentTransaction.commissionRate} (
                      {(currentTransaction.commissionAmount)})
                    </span>
                  </div>
                )}
                {currentTransaction.advancePaymentAmount > 0 && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium text-gray-700">
                        Advance Payment:
                      </span>
                      <span className="text-gray-900 text-right">
                        {(
                          currentTransaction.advancePaymentAmount
                        )}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <span className="font-medium text-gray-700">
                        Remaining Amount:
                      </span>
                      <span className="text-gray-900 text-right font-semibold">
                        {(currentTransaction.remainingAmount)}
                      </span>
                    </div>
                  </>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    Payment Method:
                  </span>
                  <span className="text-gray-900 text-right">
                    {getPaymentMethodDisplay(currentTransaction.paymentMethod)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    Payment Plan:
                  </span>
                  <span className="text-gray-900 text-right">
                    {currentTransaction.planMonths} months
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    Monthly Payment:
                  </span>
                  <span className="text-gray-900 text-right font-semibold">
                    {(currentTransaction.monthlyPayment)}
                  </span>
                </div>
              </div>

              {/* Total value highlight section */}
              <div className="bg-green-100 border border-green-200 rounded-md p-2 mt-3">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-bold text-green-900">
                    Total Amount:
                  </span>
                  <span className="font-bold text-green-900 text-right">
                    {(currentTransaction.finalTotal)}
                  </span>
                </div>
              </div>

              {/* Payment Timeline Summary */}
              <div className="border-t border-dashed border-gray-300 pt-3 mt-3">
                <h4 className="font-medium text-gray-700 mb-2">
                  Payment Schedule:
                </h4>
                <div className="text-xs text-gray-600 space-y-1">
                  {currentTransaction.paymentTimeline
                    .slice(0, 3)
                    .map((payment, index) => (
                      <div key={index} className="flex justify-between">
                        <span>Payment {payment.paymentNumber}:</span>
                        <span>
                          {payment.dueDate} -{" "}
                          {(payment.paymentAmount)}
                        </span>
                      </div>
                    ))}
                  {currentTransaction.paymentTimeline.length > 3 && (
                    <div className="text-center text-gray-500 italic">
                      ... and {currentTransaction.paymentTimeline.length - 3}{" "}
                      more payments
                    </div>
                  )}
                </div>
              </div>

              {/* Footer disclaimer */}
              <div className="text-center border-t border-dashed border-gray-300 pt-4 text-xs text-gray-600">
                <p>Thank you for your purchase!</p>
                <p>This is a computer-generated installment receipt.</p>
              </div>
            </div>

            {/* Modal action buttons (sticky footer) */}
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

// |===============================| Export |===============================|
export default Installment;