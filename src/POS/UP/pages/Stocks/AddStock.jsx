// |===============================| AddStock Component |===============================|
// Import necessary React hooks and external libraries
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";

// Predefined payment methods list
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
// Load products from localStorage utility function
const loadProducts = () => {
  const stored = localStorage.getItem("products");
  return stored ? JSON.parse(stored) : [];
};

// Invoice ID generator function - creates sequential invoice IDs across products and purchase history
const generateInvoiceId = () => {
  const existingProducts = JSON.parse(localStorage.getItem("products") || "[]");
  const existingHistory = JSON.parse(
    localStorage.getItem("purchaseHistory") || "[]"
  );

  // Extract all invoice IDs from both sources
  const allInvoices = [...existingProducts, ...existingHistory]
    .map((item) => item.invoiceId)
    .filter((id) => id && id.startsWith("Inv-"));

  // Return first invoice ID if no existing invoices
  if (allInvoices.length === 0) return "Inv-001";

  // Find the highest existing invoice number
  const lastSavedNum = allInvoices.reduce((max, id) => {
    const num = parseInt(id.replace("Inv-", ""), 10);
    return !isNaN(num) && num > max ? num : max;
  }, 0);

  // Generate next sequential invoice ID
  const nextNum = lastSavedNum + 1;
  return `Inv-${String(nextNum).padStart(3, "0")}`;
};

// Helper function to capitalize text (first letter of each word)
const capitalizeText = (text) => {
  if (!text || typeof text !== "string") return text;

  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .trim();
};

// Date formatting utility function - converts various date formats to standardized string
const formatDateTime = (dateInput) => {
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

// Calculate average price per unit when adding new stock to existing inventory
const calculatePricePerUnit = (
  previousValue,
  currentPurchaseValue,
  previousQuantity,
  additionalQuantity
) => {
  const totalValue =
    parseFloat(previousValue || 0) + parseFloat(currentPurchaseValue || 0);
  const totalQuantity =
    parseInt(previousQuantity || 0) + parseInt(additionalQuantity || 0);

  // Return zero if no quantity
  if (totalQuantity === 0) return "0.00";

  // Calculate weighted average price per unit
  const pricePerUnit = totalValue / totalQuantity;
  return pricePerUnit.toFixed(2);
};

// Main AddStock component function
export default function AddStock() {
  // Navigation hook for programmatic routing

  // State for existing products list
  const [products, setProducts] = useState(loadProducts());

  // State for selected product ID
  const [selectedId, setSelectedId] = useState("");

  // State for selected product details
  const [product, setProduct] = useState(null);

  // State for additional quantity to add
  const [additionalQty, setAdditionalQty] = useState("");

  // State for new invoice ID
  const [newInvoiceId, setNewInvoiceId] = useState("");

  // State for confirmation modal visibility
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // State for new stock purchase price (not from existing product)
  const [newPurchasePrice, setNewPurchasePrice] = useState("");

  // State for new supplier information
  const [newSupplier, setNewSupplier] = useState("");
  const [displayNewSupplier, setDisplayNewSupplier] = useState("");

  // State for new supplier contact information
  const [newSupplierContact, setNewSupplierContact] = useState("");

  // State for company information
  const [company, setCompany] = useState("");
  const [displayCompany, setDisplayCompany] = useState("");

  // State for payment method
  const [paymentMethod, setPaymentMethod] = useState("");

  // State for calculated average price per unit
  const [pricePerUnit, setPricePerUnit] = useState("0.00");

  // Effect hook to generate invoice ID on component mount
  useEffect(() => {
    setNewInvoiceId(generateInvoiceId());
  }, []);

  // Effect hook to load product details when selection changes
  useEffect(() => {
    if (!selectedId) return;

    // Find selected product in products list
    const found = products.find((p) => p.productId === selectedId);
    if (found) {
      // Set basic product info from localStorage
      setProduct({
        productId: found.productId,
        name: found.name,
        model: found.model,
        category: found.category,
        quantity: found.quantity,
        company: found.company,
        value: found.value || "0.00",
      });

      // Reset new stock fields for fresh input
      setNewPurchasePrice("");
      setAdditionalQty("");
      setNewSupplier("");
      setDisplayNewSupplier("");
      setNewSupplierContact("");
      setCompany("");
      setDisplayCompany("");
      setPaymentMethod("");
      setPricePerUnit("0.00");
    } else {
      setProduct(null);
      toast.error("Product not found!", {
        position: "top-right",
        theme: "dark",
        autoClose: 2000,
      });
    }
  }, [selectedId, products]);

  // Effect hook to calculate financial values when inputs change
  useEffect(() => {
    if (!product) return;

    const price = parseFloat(newPurchasePrice) || 0;
    const currentQty = parseInt(product.quantity) || 0;
    const addQty = parseInt(additionalQty) || 0;
    const newTotalQty = currentQty + addQty;

    // Calculate purchase value for additional quantity only
    const purchaseValue = (price * addQty).toFixed(2);

    // Calculate total inventory value (previous + current purchase)
    const previousValue = parseFloat(product.value) || 0;
    const totalInventoryValue = (
      previousValue + parseFloat(purchaseValue)
    ).toFixed(2);

    // Calculate weighted average price per unit
    const calculatedPricePerUnit = calculatePricePerUnit(
      product.value,
      purchaseValue,
      product.quantity,
      additionalQty
    );
    setPricePerUnit(calculatedPricePerUnit);

    // Update product with calculated values
    setProduct((prev) => ({
      ...prev,
      purchaseValue, // Value for additional quantity only
      totalInventoryValue, // Previous + current purchase value
      additionTotal: purchaseValue,
      pricePerUnit: calculatedPricePerUnit,
    }));
  }, [newPurchasePrice, additionalQty, product?.quantity, product?.value]);

  // Form input change handler with special formatting for numeric fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for purchase price - only allow numbers and decimal point
    if (name === "newPurchasePrice") {
      const val = value.replace(/[^\d.]/g, "");
      setNewPurchasePrice(val);
      return;
    }

    // Special handling for quantity - only allow digits
    if (name === "additionalQty") {
      const val = value.replace(/\D/g, "");
      setAdditionalQty(val);
      return;
    }

    // Special handling for supplier contact - only allow digits and limit length
    if (name === "newSupplierContact") {
      let digits = value.replace(/\D/g, "");
      if (digits.length > 15) digits = digits.slice(0, 15);
      setNewSupplierContact(digits);
      return;
    }

    // For fields that should be displayed as-is but saved capitalized
    if (name === "newSupplier") {
      setNewSupplier(value);
      setDisplayNewSupplier(value); // Display original input
      return;
    }

    // Handle company input
    if (name === "company") {
      setCompany(value);
      setDisplayCompany(value); // Display original input
      return;
    }

    // Handle payment method selection
    if (name === "paymentMethod") {
      setPaymentMethod(value);
      return;
    }
  };

  // Form clear/reset handler
  const handleClear = () => {
    setSelectedId("");
    setProduct(null);
    setNewPurchasePrice("");
    setAdditionalQty("");
    setNewSupplier("");
    setDisplayNewSupplier("");
    setNewSupplierContact("");
    setCompany("");
    setDisplayCompany("");
    setPaymentMethod("");
    setPricePerUnit("0.00");
    toast.info("Form cleared", {
      position: "top-right",
      theme: "dark",
      autoClose: 1500,
    });
  };

  // Form submission handler with validation
  const handleSave = (e) => {
    e.preventDefault();

    // Validate product selection
    if (!product)
      return toast.error("No product selected!", {
        position: "top-right",
        theme: "dark",
      });

    const toastOptions = {
      position: "top-right",
      theme: "dark",
      autoClose: 2000,
    };

    // Validate purchase price
    if (
      !newPurchasePrice ||
      isNaN(newPurchasePrice) ||
      parseFloat(newPurchasePrice) <= 0
    )
      return toast.error("Valid Purchase Price is required", toastOptions);

    // Validate additional quantity
    if (!additionalQty || isNaN(additionalQty) || parseInt(additionalQty) <= 0)
      return toast.error("Valid Additional Quantity is required", toastOptions);

    // Validate supplier name
    if (!newSupplier.trim())
      return toast.error("Supplier is required", toastOptions);

    // Validate supplier contact format with country code
    const fullSupplierContact = "+" + newSupplierContact;
    if (!/^\+\d{7,15}$/.test(fullSupplierContact))
      return toast.error(
        "Supplier Contact must start with '+' followed by 7–15 digits",
        toastOptions
      );

    // Validate company
    if (!company.trim())
      return toast.error("Company is required", toastOptions);

    // Validate payment method
    if (!paymentMethod.trim())
      return toast.error("Payment Method is required", toastOptions);

    // Show confirmation modal instead of directly saving
    setShowConfirmModal(true);
  };

  // Confirm and execute stock update
  const confirmSave = () => {
    if (!product) return;

    // Create capitalized versions for saving
    const capitalizedSupplier = capitalizeText(newSupplier);
    const capitalizedCompany = capitalizeText(company);

    // Calculate new total quantity
    const currentQty = parseInt(product.quantity) || 0;
    const addQty = parseInt(additionalQty) || 0;
    const newTotalQty = currentQty + addQty;

    // Calculate financial values
    const purchasePrice = parseFloat(newPurchasePrice);
    const purchaseValue = purchasePrice * addQty; // Only for additional quantity

    // Previous inventory value from localStorage
    const previousValue = parseFloat(product.value) || 0;
    const totalInventoryValue = previousValue + purchaseValue;

    // Calculate final weighted average price per unit
    const finalPricePerUnit = calculatePricePerUnit(
      product.value,
      purchaseValue,
      product.quantity,
      additionalQty
    );

    // Check if supplier already exists in products
    const fullSupplierContact = "+" + newSupplierContact;
    const existingSupplier = products.find(
      (p) =>
        p.supplier === capitalizedSupplier &&
        p.company === capitalizedCompany &&
        p.supplierContact === fullSupplierContact
    );

    // Update product list in localStorage
    const updatedProducts = products.map((p) =>
      p.productId === product.productId
        ? {
            ...p,
            price: newPurchasePrice, // Use new purchase price
            quantity: newTotalQty.toString(),
            supplier: capitalizedSupplier, // Use capitalized supplier
            supplierContact: "+" + newSupplierContact, // Use new supplier contact
            company: capitalizedCompany, // Use capitalized company
            value: totalInventoryValue.toFixed(2), // Total inventory value
            pricePerUnit: finalPricePerUnit, // Store weighted average price per unit
            updatedOn: formatDateTime(new Date()),
          }
        : p
    );

    localStorage.setItem("products", JSON.stringify(updatedProducts));
    setProducts(updatedProducts);

    // Add entry to purchase history
    const existingHistory =
      JSON.parse(localStorage.getItem("purchaseHistory")) || [];

    const newPurchaseEntry = {
      ...product,
      productId: product.productId,
      invoiceId: newInvoiceId,
      quantity: additionalQty, // Only additional quantity
      price: newPurchasePrice, // Use new purchase price
      supplierContact: "+" + newSupplierContact, // Use new supplier contact
      company: capitalizedCompany, // Use capitalized company
      total: purchaseValue.toFixed(2), // Value for additional quantity only
      value: purchaseValue.toFixed(2),
      pricePerUnit: finalPricePerUnit, // Include price per unit in history
      savedOn: formatDateTime(new Date()),
      name: product.name,
      model: product.model,
      category: product.category,
      supplier: capitalizedSupplier, // Use capitalized supplier
      paymentMethod: paymentMethod, // Include payment method
      type: "stock-addition", // Mark as stock addition type
    };

    const updatedHistory = [...existingHistory, newPurchaseEntry];
    localStorage.setItem("purchaseHistory", JSON.stringify(updatedHistory));

    // Close modal and show appropriate success message
    setShowConfirmModal(false);

    if (existingSupplier) {
      toast.success(
        `Supplier already exists and product stock updated with Invoice ${newInvoiceId}`,
        {
          position: "top-right",
          theme: "dark",
          autoClose: 2000,
          onClose: () => (window.location.href = "/up-dashboard"),
        }
      );
    } else {
      toast.success(`Product stock updated with Invoice ${newInvoiceId}`, {
        position: "top-right",
        theme: "dark",
        autoClose: 2000,
        onClose: () => (window.location.href = "/up-dashboard"),
      });
    }
  };

  // Cancel save operation
  const cancelSave = () => {
    setShowConfirmModal(false);
  };

  // Calculate purchase value for display
  const getPurchaseValue = () => {
    if (!product) return "0.00";
    const price = parseFloat(newPurchasePrice) || 0;
    const addQty = parseInt(additionalQty) || 0;
    return (price * addQty).toFixed(2);
  };

  // Calculate total inventory value for display
  const getTotalInventoryValue = () => {
    if (!product) return "0.00";
    const previousValue = parseFloat(product.value) || 0;
    const purchaseValue = parseFloat(getPurchaseValue()) || 0;
    return (previousValue + purchaseValue).toFixed(2);
  };

  // Get previous inventory value for display
  const getPreviousInventoryValue = () => {
    if (!product) return "0.00";
    return parseFloat(product.value || "0").toFixed(2);
  };

  // Component render method
  return (
    // Main container with responsive padding
    <div className="px-4 py-2 min-h-screen ">
      {/* Toast notifications container */}
      <ToastContainer position="top-right" theme="dark" autoClose={2000} />

      {/* Content wrapper with max width constraint */}
      <div className="max-w-8xl mx-auto">
        {/* Page header section */}
        <div className="mb-4 ">
          <h1 className="text-3xl font-bold text-white">Add Stock</h1>
          <p className="text-white">
            Select a Product ID to update stock and pricing details.
          </p>
        </div>

        {/* Main form container with glassmorphism effect */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          {/* Card content area */}
          <div className="p-4 md:p-6 h-full overflow-y-auto">
            {/* Product selection dropdown */}
            <div className="mb-6">
              <label
                htmlFor="productId"
                className="block mb-2 text-sm font-medium text-white"
              >
                Select Product ID
              </label>
              <select
                id="productId"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
              >
                <option value="" className="bg-black/90">
                  -- Select Product --
                </option>
                {/* Map through available products */}
                {products.map((p) => (
                  <option
                    className="bg-black/90"
                    key={p.productId}
                    value={p.productId}
                  >
                    {p.name} - {p.model}{" "}
                  </option>
                ))}
              </select>
            </div>

            {/* Conditional rendering based on product selection */}
            {!product ? (
              // Empty state when no product is selected
              <div className="text-center py-12 md:py-16 border-2 border-dashed border-white/20  rounded-md bg-white/5">
                <div className="text-white text-4xl md:text-6xl mb-4">📦</div>
                <p className="text-white italic text-base md:text-lg">
                  Select a Product ID to view details
                </p>
                <p className="text-white text-xs md:text-sm mt-2">
                  Choose from the dropdown above to begin adding stock
                </p>
              </div>
            ) : (
              // Stock addition form when product is selected
              <form onSubmit={handleSave} className="space-y-4 md:space-y-6">
                {/* Product Information Section */}
                <div className="bg-cyan-800/70 backdrop-blur-md border border-cyan-800 rounded-md p-4 md:p-6 shadow-lg">
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
                          {product.productId}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white text-sm">Name:</span>
                        <span className="font-semibold text-white text-sm md:text-base">
                          {product.name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white text-sm">Model:</span>
                        <span className="font-semibold text-white text-sm md:text-base">
                          {product.model}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white text-sm">Category:</span>
                        <span className="font-semibold text-white text-sm md:text-base">
                          {product.category}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white text-sm">Stock:</span>
                        <span className="font-semibold text-white text-sm md:text-base">
                          {product.quantity} pcs
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Supplier and Stock Management Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  {/* Supplier Information Section */}
                  <div className="bg-cyan-800/70 backdrop-blur-md border border-cyan-800 rounded-md p-4 md:p-6">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="text-cyan-900">💰</span>
                      Supplier Information (New Stock)
                    </h4>

                    <div className="grid grid-cols-1 gap-4">
                      {/* Company input */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-white">
                          Company
                        </label>
                        <input
                          type="text"
                          name="company"
                          value={displayCompany} // Display original input
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                          placeholder="Enter company name"
                        />
                      </div>
                      {/* Supplier Name input */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-white">
                          Supplier Name
                        </label>
                        <input
                          type="text"
                          name="newSupplier"
                          value={displayNewSupplier} // Display original input
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                          placeholder="Enter supplier name"
                        />
                      </div>

                      {/* Supplier Contact input with country code prefix */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-white">
                          Supplier Contact
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white select-none text-lg">
                            +
                          </span>
                          <input
                            type="text"
                            name="newSupplierContact"
                            value={newSupplierContact}
                            onChange={handleChange}
                            className="w-full pl-10 p-3 rounded-lg bg-black/30 border border-white/20 text-white outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                            placeholder="923001234567"
                          />
                        </div>
                      </div>

                      {/* Payment Method dropdown */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-white">
                          Payment Method
                        </label>
                        <select
                          name="paymentMethod"
                          value={paymentMethod}
                          onChange={handleChange}
                          className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all scrollbar-hide"
                        >
                          <option value="" className="bg-black/90">
                            Select a payment method
                          </option>
                          {PAYMENT_METHODS.map((method) => (
                            <option
                              key={method}
                              value={method}
                              className="bg-black/90"
                            >
                              {method}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Stock Management Section */}
                  <div className="bg-cyan-800/70 backdrop-blur-md border border-cyan-800   rounded-md p-4 md:p-6">
                    <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <span className="text-yellow-300">📊</span>
                      Stock Management
                    </h4>

                    <div className="space-y-2">
                      {/* Current stock display */}
                      <div className="text-center p-2 bg-black/20 rounded-lg border border-cyan-900">
                        <label className="block mb-2 text-sm font-medium text-white">
                          Current Stock
                        </label>
                        <div className="text-2xl md:text-2xl font-bold text-yellow-300">
                          {product.quantity} pcs
                        </div>
                      </div>

                      {/* Additional quantity input */}
                      <div>
                        <label className="block mb-2 text-sm font-medium text-white">
                          Additional Quantity
                        </label>
                        <input
                          type="text"
                          name="additionalQty"
                          value={additionalQty}
                          onChange={handleChange}
                          placeholder="Enter quantity to add"
                          className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                        />
                      </div>

                      {/* New total stock display */}
                      <div className="text-center p-3 bg-black/20 rounded-lg border border-cyan-900">
                        <label className="block mb-1 text-sm font-medium text-white">
                          New Total Stock
                        </label>
                        <div className="text-lg font-bold text-yellow-300">
                          {parseInt(product.quantity) +
                            parseInt(additionalQty || 0)}{" "}
                          pcs
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Details Section */}
                <div className="bg-cyan-800/70 backdrop-blur-md border border-cyan-800   rounded-md p-4 md:p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-blue-300">🏢</span>
                    Pricing Details (New Stock)
                  </h4>

                  <div className="space-y-4">
                    {/* Purchase price input */}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-white">
                        Purchase Price (for new stock)
                      </label>
                      <input
                        type="text"
                        name="newPurchasePrice"
                        value={newPurchasePrice}
                        onChange={handleChange}
                        className="w-full p-3 rounded-lg bg-black/30 border border-white/20 text-white outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                        placeholder="0.00"
                      />
                      <p className="text-xs text-white mt-1">
                        Applies only to additional quantity
                      </p>
                    </div>
                  </div>
                </div>

                {/* Financial Summary Section */}
                <div className="bg-cyan-800/70 backdrop-blur-md border border-cyan-800   rounded-md p-4 md:p-6">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="text-cyan-300">📈</span>
                    Financial Summary
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left column - detailed financial breakdown */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-cyan-800/90 backdrop-blur-md border border-cyan-900 rounded-md">
                        <span className="text-white">
                          Current Purchase Value:
                        </span>
                        <span className="font-bold text-white">
                          Rs {getPurchaseValue()}/-
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-cyan-800/90 backdrop-blur-md border border-cyan-900 rounded-md">
                        <span className="text-white">
                          Per Unit Cost (New Stock):
                        </span>
                        <span className="font-semibold text-white">
                          Rs {parseFloat(newPurchasePrice) || "0.00"}/-
                        </span>
                      </div>
                      {/* Average price per unit display */}
                      <div className="flex justify-between items-center p-3  bg-cyan-800/90 backdrop-blur-md border border-cyan-900 rounded-md">
                        <span className="text-white">
                          Average Price Per Unit:
                        </span>
                        <span className="font-bold text-white">
                          Rs {pricePerUnit}/-
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-cyan-800/90 backdrop-blur-md border border-cyan-900 rounded-md">
                        <span className="text-white">
                          Previous Inventory Value:
                        </span>
                        <span className="font-semibold text-white">
                          Rs {getPreviousInventoryValue()}/-
                        </span>
                      </div>
                    </div>

                    {/* Right column - total inventory value highlight */}
                    <div className="flex flex-col justify-center p-4  bg-cyan-800/90 backdrop-blur-md border border-cyan-900 rounded-md">
                      <span className="text-white text-sm md:text-base mb-2">
                        Total Inventory Value:
                      </span>
                      <span className="text-xl md:text-2xl font-bold text-white">
                        Rs {getTotalInventoryValue()}/-
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Save button */}
                  <button
                    type="submit"
                    className="w-full py-3 md:py-4  rounded-md bg-cyan-950/80 hover:bg-cyan-950  border border-white/30 transition-all duration-300 cursor-pointer font-bold text-base md:text-lg flex justify-center items-center gap-3 shadow-lg hover:shadow-purple-500/25"
                  >
                    <AddIcon />
                    Save
                  </button>

                  {/* Clear form button */}
                  <button
                    type="button"
                    onClick={handleClear}
                    className="w-full py-3 md:py-4  rounded-md bg-red-700/80 hover:bg-red-800 border border-white/30  transition-all duration-300 cursor-pointer font-bold text-base md:text-lg flex justify-center items-center gap-3 shadow-lg hover:shadow-red-500/25"
                  >
                    <ClearIcon />
                    Clear
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md z-50 p-4">
            <div className="bg-cyan-800/90 backdrop-blur-md border border-cyan-900 rounded-md p-6 w-full max-w-md text-white ">
              {/* Modal header */}
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-purple-300">⚠️</span>
                Confirm Stock Update
              </h3>

              {/* Confirmation details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-white">Product:</span>
                  <span className="font-semibold">{product.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white">Invoice ID:</span>
                  <span className="font-mono font-bold text-white">
                    {newInvoiceId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white">Additional Quantity:</span>
                  <span className="font-semibold text-white">
                    {additionalQty} pcs
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white">New Total Stock:</span>
                  <span className="font-semibold text-white">
                    {parseInt(product.quantity) + parseInt(additionalQty || 0)}{" "}
                    pcs
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white">Company:</span>
                  <span className="font-semibold text-white">
                    {displayCompany}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white">Supplier:</span>
                  <span className="font-semibold text-white">
                    {displayNewSupplier}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white">Payment Method:</span>
                  <span className="font-semibold text-black rounded-full px-2 bg-white/70">
                    {paymentMethod}
                  </span>
                </div>
                {/* Average price per unit in confirmation */}
                <div className="flex justify-between">
                  <span className="text-white">Average Price Per Unit:</span>
                  <span className="font-bold text-white">
                    Rs {pricePerUnit}/-
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/20 pt-2">
                  <span className="text-white">Purchase Value:</span>
                  <span className="font-bold text-white">
                    Rs {getPurchaseValue()}/-
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white">Total Inventory Value:</span>
                  <span className="font-bold text-white">
                    Rs {getTotalInventoryValue()}/-
                  </span>
                </div>
              </div>

              {/* Confirmation message */}
              <p className="text-white text-sm mb-6">
                Are you sure you want to update the stock and create this
                purchase record?
              </p>

              {/* Modal action buttons */}
              <div className="flex gap-3">
                {/* Cancel button */}
                <button
                  onClick={cancelSave}
                  className="flex-1 py-3 border border-white/30  rounded-md bg-red-700 hover:bg-red-800 transition-all duration-300 cursor-pointer font-semibold"
                >
                  Cancel
                </button>

                {/* Confirm button */}
                <button
                  onClick={confirmSave}
                  className="flex-1 py-3 border border-white/30  rounded-md bg-cyan-950/70 hover:bg-cyan-950  transition-all duration-300 cursor-pointer font-semibold flex justify-center items-center gap-2"
                >
                  <AddIcon />
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
