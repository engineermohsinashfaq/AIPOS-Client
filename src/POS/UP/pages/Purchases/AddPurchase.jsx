// |===============================| AddPurchase Component |===============================|
// Import necessary React hooks and external libraries
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddIcon from "@mui/icons-material/Add";

// Define empty product object template for form initialization
const emptyProduct = {
  productId: "",
  invoiceId: "",
  name: "",
  model: "",
  category: "",
  company: "",
  price: "",
  quantity: "",
  supplier: "",
  supplierContact: "",
  total: "",
  value: "",
  paymentMethod: "",
};

// Payment methods list
const PAYMENT_METHODS = [
  "Cash",
  "Credit",
  "Easypaisa",
  "JazzCash",
  "Al Baraka Bank (Pakistan) Limited",
  "Allied Bank",
  "Askari Bank",
  "Bank AL Habib Limited",
  "Bank Alfalah",
  "Bank Islami",
  "Bank of Punjab",
  "Bank of Khyber",
  "Dubai Islamic Bank Pakistan Limited",
  "Faysal Bank Limited",
  "First Women Bank",
  "Habib Bank Limited",
  "Habib Metropolitan Bank Limited",
  "HBL Bank",
  "Industrial and Commercial Bank of China",
  "Industrial Development Bank of Pakistan",
  "JS Bank",
  "MCB Bank",
  "MCB Islamic Bank",
  "Meezan Bank",
  "NBP (National Bank of Pakistan)",
  "Punjab Provincial Cooperative Bank Ltd.",
  "Samba Bank",
  "Silkbank Limited",
  "Sindh Bank Limited",
  "SME Bank Limited",
  "Soneri Bank Limited",
  "Standard Chartered Bank (Pakistan) Ltd",
  "Summit Bank Limited",
  "UBL (United Bank Limited)",
  "United Bank Limited",
  "Zarai Taraqiati Bank Limited",
];

// Product ID generator function - creates sequential IDs based on existing data
const generateProductId = () => {
  // Retrieve existing products from localStorage or initialize empty array
  const existing = JSON.parse(localStorage.getItem("products") || "[]");

  // Find the highest existing product ID number
  const lastSavedId = existing.reduce((max, prod) => {
    const num = parseInt(prod.productId?.replace("P-", ""), 10);
    return !isNaN(num) && num > max ? num : max;
  }, 0);

  // Generate next sequential ID
  const nextId = lastSavedId + 1;

  // Return formatted product ID (e.g., P-001)
  return `P-${String(nextId).padStart(3, "0")}`;
};

// Invoice ID generator function - creates sequential invoice IDs across products and purchase history
const generateInvoiceId = () => {
  // Retrieve existing products and purchase history
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

// Load products from localStorage utility function
const loadProducts = () => {
  const stored = localStorage.getItem("products");
  return stored ? JSON.parse(stored) : [];
};

// Helper function to capitalize text (first letter of each word)
const capitalizeText = (text) => {
  if (!text || typeof text !== 'string') return text;
  
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim();
};

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

// Main AddPurchase component function
export default function AddPurchase({ onSave }) {
  // State management for product form data
  const [product, setProduct] = useState(emptyProduct);

  // State for existing products list
  const [products, setProducts] = useState(loadProducts());

  // Navigation hook for programmatic routing

  // Effect hook to generate product and invoice IDs on component mount
  useEffect(() => {
    const productId = generateProductId();
    const invoiceId = generateInvoiceId();
    setProduct((prev) => ({
      ...prev,
      productId,
      invoiceId,
    }));
  }, []);

  // Effect hook to auto-calculate total value based on price and quantity
  useEffect(() => {
    const price = parseFloat(product.price) || 0;
    const qty = parseInt(product.quantity) || 0;
    const total = (price * qty).toFixed(2);
    setProduct((prev) => ({ ...prev, total, value: total }));
  }, [product.price, product.quantity]);

  // Form input change handler with special formatting for numeric fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for price field - only allow numbers and decimal point
    if (name === "price") {
      const cleanedValue = value.replace(/[^\d.]/g, "");
      setProduct((prev) => ({ ...prev, [name]: cleanedValue }));
      return;
    }

    // Special handling for quantity field - only allow digits
    if (name === "quantity") {
      const cleanedValue = value.replace(/\D/g, "");
      setProduct((prev) => ({ ...prev, [name]: cleanedValue }));
      return;
    }

    // Special handling for supplier contact field - only allow digits and limit length
    if (name === "supplierContact") {
      let digits = value.replace(/\D/g, "").slice(0, 15);
      setProduct((prev) => ({ ...prev, [name]: digits }));
      return;
    }

    // For all other fields - keep genuine case as entered by user (no capitalization during typing)
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  // Form submission handler with comprehensive validation
  const handleSubmit = (e) => {
    e.preventDefault();

    const toastOptions = {
      position: "top-right",
      theme: "dark",
      autoClose: 2000,
    };

    // Create capitalized version for validation and saving (but keep original for display)
    const capitalizedProduct = {
      ...product,
      name: capitalizeText(product.name),
      model: capitalizeText(product.model),
      category: capitalizeText(product.category),
      company: capitalizeText(product.company),
      supplier: capitalizeText(product.supplier),
      paymentMethod: product.paymentMethod, // Keep payment method as-is (from predefined list)
    };

    // Validate Product ID
    if (!/^P-\d+$/.test(capitalizedProduct.productId))
      return toast.error("Invalid Product ID", toastOptions);

    // Validate Invoice ID
    if (!/^Inv-\d+$/.test(capitalizedProduct.invoiceId))
      return toast.error("Invalid or missing Invoice ID", toastOptions);

    // Required fields
    const requiredFields = [
      { key: "name", label: "Name" },
      { key: "model", label: "Model" },
      { key: "category", label: "Category" },
      { key: "company", label: "Company" },
      { key: "supplier", label: "Supplier" },
      { key: "paymentMethod", label: "Payment Method" },
    ];

    for (const field of requiredFields) {
      if (!capitalizedProduct[field.key].trim())
        return toast.error(`${field.label} is required`, toastOptions);
    }

    // Price validation
    if (!capitalizedProduct.price || parseFloat(capitalizedProduct.price) <= 0)
      return toast.error("Valid Purchase Price required", toastOptions);

    // Quantity validation
    if (!capitalizedProduct.quantity || parseInt(capitalizedProduct.quantity) <= 0)
      return toast.error("Valid Quantity required", toastOptions);

    // Supplier contact validation
    const fullSupplierContact = "+" + capitalizedProduct.supplierContact;
    if (!/^\+\d{7,15}$/.test(fullSupplierContact))
      return toast.error(
        "Supplier Contact must start with '+' and 7–15 digits",
        toastOptions
      );

    // Unique model validation (case-insensitive for comparison)
    if (
      products.some(
        (p) => p.model?.toLowerCase() === capitalizedProduct.model.toLowerCase()
      )
    )
      return toast.error("Model must be unique!", toastOptions);

    // Check if supplier already exists (same supplier, company, and contact)
    const existingSupplier = products.find(
      (p) =>
        p.supplier?.toLowerCase() === capitalizedProduct.supplier.toLowerCase() &&
        p.company?.toLowerCase() === capitalizedProduct.company.toLowerCase() &&
        p.supplierContact === fullSupplierContact
    );

    const timestamp = formatDateTime(new Date());

    // If supplier exists, reuse supplier details (to ensure data consistency)
    const supplierData = existingSupplier
      ? {
          supplier: existingSupplier.supplier,
          company: existingSupplier.company,
          supplierContact: existingSupplier.supplierContact,
        }
      : {
          supplier: capitalizedProduct.supplier,
          company: capitalizedProduct.company,
          supplierContact: fullSupplierContact,
        };

    const newProduct = {
      ...capitalizedProduct, // Use the capitalized version for saving
      ...supplierData,
      price: parseFloat(capitalizedProduct.price),
      quantity: parseInt(capitalizedProduct.quantity),
      savedOn: timestamp,
      updatedOn: timestamp,
      type: "new-purchase",
    };

    // Update localStorage
    const updatedProducts = [...products, newProduct];
    localStorage.setItem("products", JSON.stringify(updatedProducts));
    setProducts(updatedProducts);

    // Add to purchase history
    const existingHistory = JSON.parse(
      localStorage.getItem("purchaseHistory") || "[]"
    );
    localStorage.setItem(
      "purchaseHistory",
      JSON.stringify([...existingHistory, newProduct])
    );

    // Generate next IDs
    const nextInvoiceId = generateInvoiceId();
    const nextProductId = generateProductId();

    // ✅ Show unified success message
    toast.success(
      existingSupplier
        ? `Supplier Exist — product saved with Invoice ${capitalizedProduct.invoiceId}`
        : `Product saved with Invoice ${capitalizedProduct.invoiceId}`,
      {
        ...toastOptions,
        onClose: () => {
          setProduct({
            ...emptyProduct,
            productId: nextProductId,
            invoiceId: nextInvoiceId,
          });

          // ✅ Redirect using window.location.href
          window.location.href = "/up-dashboard";
        },
      }
    );

    // Optional callback
    onSave?.(newProduct);
  };

  // Form clear/reset handler
  const handleClear = () => {
    // Reset form with new generated IDs
    const productId = generateProductId();
    const invoiceId = generateInvoiceId();
    setProduct({
      ...emptyProduct,
      productId,
      invoiceId,
    });
    toast.info("Form cleared", {
      position: "top-right",
      theme: "dark",
      autoClose: 1500,
    });
  };

  // Component render method
  return (
    // Main container with padding and full height
    <div className="px-4 py-2 min-h-[100%]">
      {/* Toast notifications container */}
      <ToastContainer position="top-right" theme="dark" autoClose={2000} />

      {/* Content wrapper with max width constraint */}
      <div className="max-w-8xl mx-auto space-y-3">
        {/* Page header section */}
        <div>
          <h1 className="text-3xl font-bold text-white">Add Purchase</h1>
          <p className="text-white/80">
            Fill in the product details below to record a purchase.
          </p>
        </div>

        {/* Main form container with glassmorphism effect */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-4 text-white shadow-lg mt-6">
          {/* Form element with submit handler */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* All form fields organized in responsive grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Invoice Number field (read-only) */}
              <div>
                <label className="block mb-1 text-sm text-white/80">
                  Invoice No
                </label>
                <input
                  type="text"
                  name="invoiceId"
                  value={product.invoiceId}
                  readOnly
                  className="w-full p-3 rounded-md bg-black/40 border border-white/30 text-white outline-none cursor-not-allowed"
                />
              </div>

              {/* Product ID field (read-only) */}
              <div>
                <label className="block mb-1 text-sm text-white/80">
                  Product ID
                </label>
                <input
                  type="text"
                  name="productId"
                  value={product.productId}
                  readOnly
                  className="w-full p-3 rounded-md bg-black/40 border border-white/30 text-white outline-none cursor-not-allowed"
                />
              </div>

              {/* Product Name input */}
              <div>
                <label
                  htmlFor="name"
                  className="block mb-1 text-sm text-white/80"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter product name"
                  value={product.name} // Display original input
                  onChange={handleChange}
                  className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                />
              </div>

              {/* Product Model input */}
              <div>
                <label
                  htmlFor="model"
                  className="block mb-1 text-sm text-white/80"
                >
                  Model
                </label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  placeholder="Enter model"
                  value={product.model} // Display original input
                  onChange={handleChange}
                  className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                />
              </div>

              {/* Product Category input */}
              <div>
                <label
                  htmlFor="category"
                  className="block mb-1 text-sm text-white/80"
                >
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  placeholder="Enter category"
                  value={product.category} // Display original input
                  onChange={handleChange}
                  className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                />
              </div>

              {/* Quantity input */}
              <div>
                <label
                  htmlFor="quantity"
                  className="block mb-1 text-sm text-white/80"
                >
                  Quantity
                </label>
                <input
                  type="text"
                  id="quantity"
                  name="quantity"
                  placeholder="Enter quantity"
                  value={product.quantity}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                />
              </div>

              {/* Purchase Price input */}
              <div>
                <label
                  htmlFor="price"
                  className="block mb-1 text-sm text-white/80"
                >
                  Purchase Price
                </label>
                <input
                  type="text"
                  id="price"
                  name="price"
                  placeholder="Enter purchase price"
                  value={product.price}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                />
              </div>

              {/* Total Value field (read-only, auto-calculated) */}
              <div>
                <label
                  htmlFor="value"
                  className="block mb-1 text-sm text-white/80"
                >
                  Value
                </label>
                <input
                  type="text"
                  id="value"
                  name="value"
                  value={product.value}
                  placeholder="0.0"
                  readOnly
                  className="w-full p-3 rounded-md bg-black/40 border border-white/30 text-white outline-none cursor-not-allowed"
                />
              </div>

              {/* Supplier Name input */}
              <div>
                <label
                  htmlFor="supplier"
                  className="block mb-1 text-sm text-white/80"
                >
                  Supplier
                </label>
                <input
                  type="text"
                  id="supplier"
                  name="supplier"
                  placeholder="Enter supplier name"
                  value={product.supplier} // Display original input
                  onChange={handleChange}
                  className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                />
              </div>

              {/* Company Name input */}
              <div>
                <label
                  htmlFor="company"
                  className="block mb-1 text-sm text-white/80"
                >
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  placeholder="Enter company name"
                  value={product.company} // Display original input
                  onChange={handleChange}
                  className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                />
              </div>

              {/* Supplier Contact input with country code prefix */}
              <div>
                <label
                  htmlFor="supplierContact"
                  className="block mb-1 text-sm text-white/80"
                >
                  Supplier Contact
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 select-none">
                    +
                  </span>
                  <input
                    type="text"
                    id="supplierContact"
                    name="supplierContact"
                    placeholder="923001234567"
                    maxLength={15}
                    value={product.supplierContact}
                    onChange={handleChange}
                    className="w-full pl-6 p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                  />
                </div>
              </div>

              {/* Payment Method dropdown */}
              <div>
                <label
                  htmlFor="paymentMethod"
                  className="block mb-1 text-sm text-white/80"
                >
                  Payment Method
                </label>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={product.paymentMethod}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none scrollbar-hide"
                >
                  <option value="" className="bg-black/90">
                    Select a payment method
                  </option>
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method} className="bg-black/90">
                      {method}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Form action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              {/* Save button with icon */}
              <button
                type="submit"
                className="w-full sm:w-1/2 py-3 rounded-md bg-cyan-800/80 hover:bg-cyan-900 transition cursor-pointer font-semibold flex justify-center items-center gap-3"
              >
                <AddIcon />
                Save
              </button>

              {/* Clear form button */}
              <button
                type="button"
                onClick={handleClear}
                className="w-full sm:w-1/2 py-3 rounded-md bg-red-700/80 hover:bg-red-800 transition cursor-pointer font-semibold flex justify-center items-center gap-3"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}