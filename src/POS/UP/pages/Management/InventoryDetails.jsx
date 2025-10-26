// |===============================| ProductsReports Component |===============================|
// Import necessary React hooks and external libraries
import React, { useState, useMemo, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Download, Printer } from "lucide-react";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
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

// Enhanced date parser for consistent sorting and filtering
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
      "Product ID",
      "Product Name",
      "Model",
      "Category",
      "Quantity",
      "Stock Level",
      "Purchase Price",
      "Price Per Unit",
      "Inventory Value",
      "Created Date",
      "Last Updated",
    ];

    // Convert data to CSV rows
    const csvRows = data.map((product) => [
      product.productId,
      product.name,
      product.model,
      product.category,
      product.quantity,
      product.stockLevel.label,
      product.price,
      product.displayPricePerUnit,
      product.displayValue,
      formatShortDate(product.createdAt),
      formatShortDate(product.updatedAt),
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

// Load products from localStorage with data validation and field completion
const loadProducts = () => {
  try {
    const raw = localStorage.getItem("products");
    const products = raw ? JSON.parse(raw) : [];

    // Ensure all products have createdAt and updatedAt fields for consistency
    return products.map((product) => {
      // Set createdAt to savedOn or current date if missing
      if (!product.createdAt) {
        product.createdAt = product.savedOn || new Date().toISOString();
      }
      // Set updatedAt to updatedOn, savedOn, or current date if missing
      if (!product.updatedAt) {
        product.updatedAt =
          product.updatedOn || product.savedOn || new Date().toISOString();
      }
      return product;
    });
  } catch {
    console.error("Error loading products from localStorage.");
    return [];
  }
};

// Calculate product value with priority on stored value field, fallback to calculation
const getProductValue = (product) => {
  // First priority: Use the stored value field (contains accumulated inventory value)
  if (product.value !== undefined && product.value !== null) {
    const storedValue = parseFloat(product.value);
    if (!isNaN(storedValue) && storedValue >= 0) {
      return storedValue.toFixed(2);
    }
  }

  // Fallback: Calculate from quantity × price (for backward compatibility)
  const quantity = parseInt(product.quantity || 0);
  const price = parseFloat(product.price || 0);
  return (quantity * price).toFixed(2);
};

// Calculate average price per unit with priority on stored field, fallback to calculation
const getPricePerUnit = (product) => {
  // First priority: Use the stored pricePerUnit field
  if (product.pricePerUnit !== undefined && product.pricePerUnit !== null) {
    const storedPricePerUnit = parseFloat(product.pricePerUnit);
    if (!isNaN(storedPricePerUnit) && storedPricePerUnit >= 0) {
      return storedPricePerUnit.toFixed(2);
    }
  }

  // Fallback: Calculate from total value ÷ quantity
  const totalValue = parseFloat(getProductValue(product));
  const quantity = parseInt(product.quantity || 0);

  // Return zero if no quantity to avoid division by zero
  if (quantity === 0) return "0.00";

  const calculatedPricePerUnit = totalValue / quantity;
  return calculatedPricePerUnit.toFixed(2);
};

// Determine stock level status based on quantity with visual indicators
const getStockLevel = (quantity) => {
  const qty = parseInt(quantity || 0);

  // Return appropriate status object based on quantity level
  if (qty === 0) {
    return {
      level: "out-of-stock",
      label: "OUT OF STOCK",
      color: "text-white",
      bgColor: "bg-red-500/80",
      borderColor: "border-white/20",
      icon: "❌",
    };
  } else if (qty <= 5) {
    return {
      level: "low",
      label: "LOW STOCK",
      color: "text-white",
      bgColor: "bg-orange-500/80",
      borderColor: "border-white/20",
      icon: "⚠️",
    };
  } else if (qty <= 15) {
    return {
      level: "medium",
      label: "MEDIUM STOCK",
      color: "text-white",
      bgColor: "bg-yellow-500/80",
      borderColor: "border-white/20",
      icon: "⚠️",
    };
  } else {
    return {
      level: "high",
      label: "IN STOCK",
      color: "text-white",
      bgColor: "bg-green-500",
      borderColor: "border-white/20",
      icon: "✓",
    };
  }
};

// Capitalize text utility function (preserves spaces)
const capitalizeText = (text) => {
  if (!text || typeof text !== "string") return "";

  return (
    text
      .toLowerCase()
      // Use regex to split and keep the spaces as separate tokens
      .split(/(\s+)/)
      .map(
        (word) =>
          word.trim() ? word.charAt(0).toUpperCase() + word.slice(1) : word // leave spaces untouched
      )
      .join("")
  );
};

// Main InventoryDetails component function
export default function InventoryDetails() {
  // State management for products data
  const [products, setProducts] = useState(loadProducts);

  // State for search functionality
  const [query, setQuery] = useState("");

  // State for category filtering
  const [categoryFilter, setCategoryFilter] = useState("All");

  // State for stock level filtering
  const [stockLevelFilter, setStockLevelFilter] = useState("All");

  // State for date range filtering
  const [dateRangeFilter, setDateRangeFilter] = useState("all");

  // State for modal visibility
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // State for report modal visibility
  const [isReportOpen, setIsReportOpen] = useState(false);

  // State for selected product details
  const [selectedProduct, setSelectedProduct] = useState(null);

  // State for form data in edit modal
  const [form, setForm] = useState({});
  const [originalProduct, setOriginalProduct] = useState(null);
  const [formChanges, setFormChanges] = useState({});

  // State for password verification
  const [password, setPassword] = useState("");
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'edit' or 'delete'

  // State for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Effect hook to handle body overflow when modal is open/closed
  useEffect(() => {
    if (isViewOpen || isEditOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    }

    // Cleanup function to reset overflow on component unmount
    return () => {
      document.body.style.overflow = "unset";
      document.documentElement.style.overflow = "unset";
    };
  }, [isViewOpen, isEditOpen]);

  // FIXED: Safe localStorage persistence without circular references
  useEffect(() => {
    try {
      // Create a safe copy of products without computed properties that cause circular references
      const safeProducts = products.map((product) => {
        // Return only the essential, serializable properties
        return {
          productId: product.productId,
          name: product.name,
          model: product.model,
          category: product.category,
          quantity: product.quantity,
          price: product.price,
          value: product.value,
          pricePerUnit: product.pricePerUnit,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          savedOn: product.savedOn,
          updatedOn: product.updatedOn,
          lastUpdateMessage: product.lastUpdateMessage,
        };
      });

      localStorage.setItem("products", JSON.stringify(safeProducts));
    } catch (error) {
      console.error("Error saving products to localStorage:", error);
    }
  }, [products]);

  // Get unique categories for filter dropdown
  const uniqueCategories = useMemo(() => {
    const categories = [...new Set(products.map((p) => p.category))].filter(
      Boolean
    );
    return categories.sort();
  }, [products]);

  // Memoized filtered products based on search query and filters
  const filtered = useMemo(() => {
    let arr = products.slice();

    // Apply search filter if query exists
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      arr = arr.filter((p) => {
        // Search across multiple product fields
        const searchableFields = [
          p.productId,
          p.name,
          p.model,
          p.category,
          p.createdAt,
          p.updatedAt,
        ]
          .filter(Boolean) // Remove null/undefined values
          .map((field) => field.toString().toLowerCase())
          .join(" ");

        return searchableFields.includes(q);
      });
    }

    // Apply category filter if not "All"
    if (categoryFilter !== "All") {
      arr = arr.filter((p) => p.category === categoryFilter);
    }

    // Apply stock level filter if not "All"
    if (stockLevelFilter !== "All") {
      arr = arr.filter((p) => {
        const stockLevel = getStockLevel(p.quantity);
        return stockLevel.level === stockLevelFilter;
      });
    }

    // Apply date range filter if not "all"
    if (dateRangeFilter !== "all") {
      const { start, end } = getDateRange(dateRangeFilter);
      if (start && end) {
        arr = arr.filter((p) => {
          const productDate = parseDateForSorting(p.updatedAt || p.createdAt);
          return productDate >= start && productDate <= end;
        });
      }
    }

    // Sort by product ID
    arr.sort((a, b) => a.productId.localeCompare(b.productId));
    return arr;
  }, [products, query, categoryFilter, stockLevelFilter, dateRangeFilter]);

  // Memoized products with calculated values for display
  const productsWithCalculatedValues = useMemo(() => {
    return filtered.map((product) => ({
      ...product,
      displayValue: getProductValue(product), // Use calculated value for display
      displayPricePerUnit: getPricePerUnit(product), // Add price per unit for display
      stockLevel: getStockLevel(product.quantity), // Add stock level information
    }));
  }, [filtered]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = filtered.length;
    const totalQuantity = filtered.reduce(
      (sum, p) => sum + parseInt(p.quantity || 0),
      0
    );
    const totalValue = filtered
      .reduce((sum, p) => {
        const productValue = getProductValue(p);
        return sum + parseFloat(productValue);
      }, 0)
      .toFixed(2);
    const outOfStockCount = filtered.filter(
      (p) => parseInt(p.quantity || 0) === 0
    ).length;
    const lowStockCount = filtered.filter(
      (p) => parseInt(p.quantity || 0) <= 5
    ).length;
    const mediumStockCount = filtered.filter((p) => {
      const qty = parseInt(p.quantity || 0);
      return qty > 5 && qty <= 15;
    }).length;
    const highStockCount = filtered.filter(
      (p) => parseInt(p.quantity || 0) > 15
    ).length;

    return {
      total,
      totalQuantity,
      totalValue,
      outOfStockCount,
      lowStockCount,
      mediumStockCount,
      highStockCount,
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

  // Field name mapper for display purposes
  const getFieldDisplayName = (field) => {
    const fieldNames = {
      name: "PRODUCT NAME",
      model: "MODEL",
      category: "CATEGORY",
      quantity: "QUANTITY",
      price: "PURCHASE PRICE",
    };
    return fieldNames[field] || field;
  };

  // Open edit modal with product data
  const handleOpenEdit = (product) => {
    setForm(product);
    setOriginalProduct(product);
    setFormChanges({});
    setIsEditOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  // Password change handler
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // Fixed: Verify password and execute pending action without page reload
  const verifyPasswordAndExecute = () => {
    // Temporary POS password - will be fetched from DB later
    const posPassword = "0000";

    if (password !== posPassword) {
      notifyError("Invalid Password. Action Aborted.");
      setPassword("");
      return;
    }

    // Show success toast first
    notifySuccess("Password Veryfied Successfully");

    // Password verified, proceed with action
    if (pendingAction === "edit") {
      saveChanges(); // This will close the modal and update the state
    } else if (pendingAction === "delete") {
      executeDelete(); // This will delete the product and update the state
    }

    // Close password prompt and reset states
    setShowPasswordPrompt(false);
    setPassword("");
    setPendingAction(null);
  };

  // Fixed: Save form changes handler - properly closes modals
  const saveChanges = () => {
    // Validate required fields
    if (!form.name?.trim()) {
      notifyError("Product Name is required");
      return;
    }

    // Validate quantity and price
    const quantity = parseInt(form.quantity);
    const price = parseFloat(form.price);
    if (isNaN(quantity) || quantity < 0) {
      notifyError("INVALID QUANTITY");
      return;
    }
    if (isNaN(price) || price < 0) {
      notifyError("INVALID PURCHASE PRICE");
      return;
    }

    // Apply capitalization only when saving
    const processedForm = {
      ...form,
      name: capitalizeText(form.name || ""),
      model: capitalizeText(form.model || ""),
      category: capitalizeText(form.category || ""),
      quantity: quantity,
      price: price,
      value: (quantity * price).toFixed(2), // Store calculated inventory value
      pricePerUnit: quantity > 0 ? price.toFixed(2) : "0.00", // Store price per unit
      updatedAt: formatDateTime(new Date()),
    };

    // Update products state
    setProducts((prev) =>
      prev.map((p) => (p.productId === form.productId ? processedForm : p))
    );

    // Close modal and reset states
    setIsEditOpen(false);
    setOriginalProduct(null);
    setFormChanges({});
    notifySuccess(`${form.productId} UPDATED SUCCESSFULLY.`);
  };

  // Handle save button click - show password prompt
  const handleSave = (e) => {
    e.preventDefault();

    setPendingAction("edit");
    setShowPasswordPrompt(true);
  };

  // Handle delete button click - show confirmation
  const handleDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  // Confirm delete - show password prompt
  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    setPendingAction("delete");
    setShowPasswordPrompt(true);
  };

  // Fixed: Execute delete after password verification - properly closes modals
  const executeDelete = () => {
    if (!productToDelete) return;

    // Remove product from state
    setProducts((prev) =>
      prev.filter((p) => p.productId !== productToDelete.productId)
    );

    // Show success message
    notifySuccess(`${productToDelete.productId} DELETED SUCCESSFULLY.`);

    // Reset states
    setProductToDelete(null);
  };

  // Close modals and reset states
  const handleCloseEditModal = () => {
    setIsEditOpen(false);
    setOriginalProduct(null);
    setFormChanges({});
    setPassword("");
    setShowPasswordPrompt(false);
  };

  const handleClosePasswordPrompt = () => {
    setShowPasswordPrompt(false);
    setPassword("");
    setPendingAction(null);
  };

  const handleCloseDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setProductToDelete(null);
  };

  const handleCloseViewModal = () => {
    setIsViewOpen(false);
  };

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

    const success = exportToExcel(
      productsWithCalculatedValues,
      `products-report-${new Date().toISOString().split("T")[0]}`
    );
    if (success) {
      notifySuccess("PRODUCTS REPORT EXPORTED TO EXCEL SUCCESSFULLY");
    }
  };

  // Open report summary modal
  const handleOpenReport = () => {
    setIsReportOpen(true);
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
            INVENTORY DETAILS
          </h1>
          <p className="text-white/80">
            ANALYZE AND EXPORT PRODUCTS DATA WITH ADVANCED FILTERING AND
            REPORTING.
          </p>
        </div>

        {/* Search and Filter Panel */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-md p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Search input with icon */}
          <div className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 md:col-span-2">
            <SearchIcon className="text-white" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH PRODUCTS..."
              className="flex-1 outline-none bg-transparent text-white placeholder-white/60"
            />
          </div>

          {/* Category filter dropdown */}
          <div className="flex items-center gap-2 justify-between">
            <label className="text-sm text-white/70">CATEGORY</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="p-2 border border-white/10 rounded bg-white/10 text-white flex-1  scrollbar-hide"
            >
              <option value="All" className="bg-black/95 text-white">
                ALL
              </option>
              {uniqueCategories.map((category) => (
                <option
                  key={category}
                  value={category}
                  className="bg-black/95 text-white"
                >
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Level filter dropdown */}
          <div className="flex items-center gap-2 justify-between">
            <label className="text-sm text-white/70">STOCK LEVEL</label>
            <select
              value={stockLevelFilter}
              onChange={(e) => setStockLevelFilter(e.target.value)}
              className="p-2 border border-white/10 rounded bg-white/10 text-white flex-1  scrollbar-hide"
            >
              <option value="All" className="bg-black/95 text-white">
                ALL
              </option>
              <option value="out-of-stock" className="bg-black/95 text-white">
                Out Of Stock
              </option>
              <option value="low" className="bg-black/95 text-white">
                Low Stock
              </option>
              <option value="medium" className="bg-black/95 text-white">
                Medium Stock
              </option>
              <option value="high" className="bg-black/95 text-white">
                In Stock
              </option>
            </select>
          </div>

          {/* Date range filter dropdown */}
          <div className="flex items-center gap-2 justify-between">
            <label className="text-sm text-white/70">DATE RANGE</label>
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              className="p-2 border border-white/10 rounded bg-white/10 text-white flex-1  scrollbar-hide"
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

        {/* Main Data Table Container */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-md overflow-x-auto scrollbar-hide ">
          {/* Products Table */}
          <table className="w-full text-white min-w-[1200px]  ">
            {/* Table Header with Column Labels */}
            <thead className="bg-white/10 text-left text-sm">
              <tr className="text-white/90">
                <th className="p-3">P-ID</th>
                <th className="p-3">NAME</th>
                <th className="p-3">CATEGORY</th>
                <th className="p-3">QTY</th>
                <th className="p-3">STOCK LEVEL</th>
                <th className="p-3">PURCHASE PRICE</th>
                <th className="p-3">VALUE</th>
                <th className="p-3">LAST UPDATED</th>
                <th className="p-3">ACTIONS</th>
              </tr>
            </thead>

            {/* Table Body with Product Records */}
            <tbody>
              {/* Map through filtered product records */}
              {productsWithCalculatedValues.map((p) => (
                <tr
                  key={p.productId}
                  className={` border-t border-white/15 transition bg-green-500/30 hover:bg-green-500/50 ${
                    // Different hover colors based on stock level
                    p.stockLevel.level === "out-of-stock"
                      ? " bg-red-500/30 hover:bg-red-500/50"
                      : p.stockLevel.level === "low"
                      ? " bg-orange-500/30 hover:bg-orange-500/50"
                      : p.stockLevel.level === "medium"
                      ? " bg-yellow-500/30 hover:bg-yellow-500/50"
                      : ""
                  }`}
                >
                  {/* Product ID Column */}
                  <td className="p-3 font-mono">{p.productId}</td>

                  {/* Product Name Column */}
                  <td className="p-3">{p.name}</td>

                  {/* Category Column */}
                  <td className="p-3">{p.category}</td>

                  {/* Quantity Column */}
                  <td className="p-3 font-semibold">{p.quantity}</td>

                  {/* Stock Level Column with Visual Indicator */}
                  <td className="p-3">
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${p.stockLevel.bgColor} ${p.stockLevel.borderColor} ${p.stockLevel.color}`}
                    >
                      {p.stockLevel.icon}
                      {p.stockLevel.label}
                    </div>
                  </td>

                  {/* Purchase Price Column */}
                  <td className="p-3">Rs: {p.price}/-</td>

                  {/* Inventory Value Column */}
                  <td className="p-3">Rs: {p.displayValue}/-</td>

                  {/* Last Updated Date Column */}
                  <td className="p-3 text-xs">
                    {formatShortDate(p.updatedAt)}
                  </td>

                  {/* Actions Column with View, Edit, and Delete Buttons */}
                  <td className="p-3 flex gap-2">
                    {/* View Button */}
                    <button
                      title="VIEW"
                      onClick={() => {
                        setSelectedProduct({
                          ...p,
                          value: p.displayValue, // Use display value in modal
                          pricePerUnit: p.displayPricePerUnit, // Add price per unit to modal
                          stockLevel: p.stockLevel, // Add stock level to modal
                        });
                        setIsViewOpen(true);
                      }}
                      className="p-2 rounded bg-cyan-900 text-white hover:bg-cyan-950 transition-colors cursor-pointer"
                    >
                      <VisibilityIcon fontSize="small" />
                    </button>

                    {/* Edit Button */}
                    <button
                      title="EDIT"
                      onClick={() => handleOpenEdit(p)}
                      className="p-2 rounded bg-yellow-400 text-gray-900 hover:bg-yellow-300 transition-colors cursor-pointer"
                    >
                      <EditIcon fontSize="small" />
                    </button>

                    {/* Delete Button */}
                    <button
                      title="DELETE"
                      onClick={() => handleDelete(p)}
                      className="p-2 rounded bg-red-600 text-white hover:bg-red-500 transition-colors cursor-pointer"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </td>
                </tr>
              ))}

              {/* Empty State Message */}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="9" className="p-4 text-center text-white/70">
                    NO PRODUCTS FOUND.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* // Edit Product Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 backdrop-blur-md">
          {/* Modal content container */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-lg text-white">
            {/* Modal header */}
            <h2 className="text-xl font-semibold mb-4">
              EDIT PRODUCT: {form.productId}
            </h2>

            {/* Edit form */}
            <form onSubmit={handleSave} className="space-y-3">
              {/* Product ID - Read Only */}
              <input
                name="productId"
                value={form.productId || ""}
                readOnly
                placeholder="PRODUCT ID"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none cursor-not-allowed opacity-70"
              />

              {/* Product Name - Normal input (no auto-capitalization) */}
              <input
                name="name"
                value={form.name || ""}
                onChange={handleChange}
                placeholder="PRODUCT NAME"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />

              {/* Model and Category - Normal inputs (no auto-capitalization) */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="model"
                  value={form.model || ""}
                  onChange={handleChange}
                  placeholder="MODEL"
                  className="p-2 rounded bg-black/30 border border-white/20 outline-none"
                />
                <input
                  name="category"
                  value={form.category || ""}
                  onChange={handleChange}
                  placeholder="CATEGORY"
                  className="p-2 rounded bg-black/30 border border-white/20 outline-none"
                />
              </div>

              {/* Quantity and Price - Editable inputs */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity || ""}
                  onChange={handleChange}
                  placeholder="QUANTITY"
                  className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none cursor-not-allowed opacity-70"
                  readOnly
                  min="0"
                />
                <input
                  type="number"
                  name="price"
                  value={form.price || ""}
                  onChange={handleChange}
                  placeholder="PURCHASE PRICE"
                  className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none cursor-not-allowed opacity-70"
                  readOnly
                  min="0"
                  step="0.01"
                />
              </div>

              {/* Form action buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="submit"
                  className="px-4 py-2 rounded border border-white/40 transition hover:cursor-pointer bg-cyan-800/80 hover:bg-cyan-900"
                >
                  SAVE CHANGES
                </button>

                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="px-4 py-2 rounded border border-white/40 bg-red-600 hover:bg-red-700 transition hover:cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && productToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50 p-2 md:p-4 backdrop-blur-md">
          <div className="bg-white/10 backdrop-blur-md text-black rounded-lg shadow-2xl w-full max-w-md mx-auto font-sans text-sm border border-gray-300/20">
            <div className="p-6 space-y-4">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-red-100">
                  <ErrorIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-white mt-3">
                  CONFIRM DELETE
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  ARE YOU SURE YOU WANT TO DELETE THIS PRODUCT?
                </p>
              </div>

              <div className="bg-red-600/60 border border-white/10 rounded-md p-3">
                <p className="text-sm text-white font-medium text-center">
                  {productToDelete.productId} - {productToDelete.name} -{" "}
                  {productToDelete.model}
                </p>
                <p className="text-xs text-white text-center mt-1">
                  This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={handleCloseDeleteConfirm}
                  className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700 transition hover:cursor-pointer font-medium"
                >
                  CANCEL
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition hover:cursor-pointer font-medium"
                >
                  DELETE PRODUCT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Password Verification Modal */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50 backdrop-blur-md">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-md text-white">
            <h3 className="text-xl font-semibold mb-4 text-center">
              PASSWORD VERIFICATION REQUIRED
            </h3>

            <div className="space-y-4">
              <p className="text-white/80 text-center">
                {pendingAction === "edit"
                  ? "PLEASE ENTER YOUR POS PASSWORD TO CONFIRM CHANGES"
                  : "PLEASE ENTER YOUR POS PASSWORD TO CONFIRM DELETION"}
              </p>

              <div className="space-y-2">
                <label className="block text-sm text-white/70">
                  POS PASSWORD
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Enter POS password"
                  className="w-full p-3 rounded bg-black/20 border border-white/20 text-white outline-none focus:ring-2 focus:ring-white/30"
                  autoFocus
                  autoComplete="new-password"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  onClick={handleClosePasswordPrompt}
                  className="px-4 py-2 rounded border border-white/40 bg-red-600 hover:bg-red-700 transition hover:cursor-pointer"
                >
                  CANCEL
                </button>

                <button
                  onClick={verifyPasswordAndExecute}
                  disabled={!password.trim()}
                  className={`px-4 py-2 rounded border border-white/40 transition hover:cursor-pointer ${
                    password.trim()
                      ? pendingAction === "delete"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-cyan-800/80 hover:bg-cyan-900"
                      : "bg-gray-600/50 cursor-not-allowed opacity-50"
                  }`}
                >
                  {pendingAction === "delete"
                    ? "VERIFY & DELETE"
                    : "VERIFY & SAVE"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Product Details View Modal */}
      {isViewOpen && selectedProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-2 md:p-4 backdrop-blur-md print:p-0">
          {/* Modal Content Container */}
          <div className="bg-white text-black rounded-lg shadow-2xl w-full max-w-md mx-auto max-h-[95vh] overflow-y-auto scrollbar-hide relative font-sans text-sm border border-gray-300">
            {/* Modal Body Content */}
            <div className="p-4 space-y-4">
              {/* Company Header Section */}
              <div className="text-center border-b border-dashed border-gray-300 pb-3 mb-3">
                <h2 className="text-xl font-bold tracking-wider text-gray-900">
                  ZUBI ELECTRONICS
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  PRODUCT & STOCK DETAILS
                </p>
              </div>

              {/* Product Information Section */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">ID:</span>
                  <span className="text-gray-900 text-right">
                    {selectedProduct.productId}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">NAME:</span>
                  <span className="text-gray-900 text-right">
                    {selectedProduct.name}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">MODEL:</span>
                  <span className="text-gray-900 text-right">
                    {selectedProduct.model}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">CATEGORY:</span>
                  <span className="text-gray-900 text-right">
                    {selectedProduct.category}
                  </span>
                </div>
              </div>

              {/* Pricing and Stock Section */}
              <div className="border-t border-dashed border-gray-300 pt-3 mt-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">QUANTITY:</span>
                  <span className="text-gray-900 text-right font-semibold">
                    {selectedProduct.quantity} PIECE(S)
                  </span>
                </div>

                {/* Stock Level Display */}
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    STOCK STATUS:
                  </span>
                  <span className="text-right">
                    <div
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${selectedProduct.stockLevel.bgColor} ${selectedProduct.stockLevel.borderColor} ${selectedProduct.stockLevel.color}`}
                    >
                      {selectedProduct.stockLevel.icon}
                      {selectedProduct.stockLevel.label}
                    </div>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    PURCHASE PRICE:
                  </span>
                  <span className="text-gray-900 text-right">
                    Rs: {selectedProduct.price}/-
                  </span>
                </div>

                {/* Average Price Per Unit Display */}
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">
                    AVERAGE PRICE PER UNIT:
                  </span>
                  <span className="text-right font-semibold text-orange-600">
                    Rs: {selectedProduct.pricePerUnit}/-
                  </span>
                </div>
              </div>

              {/* Total Inventory Value Highlight */}
              <div className="bg-blue-200 border border-blue-900 rounded-lg p-3 mt-3">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-bold text-blue-900">
                    INVENTORY VALUE:
                  </span>
                  <span className="font-bold text-blue-900 text-right">
                    Rs: {selectedProduct.value}/-
                  </span>
                </div>
              </div>

              {/* Timestamp Information Section */}
              <div className="text-xs text-gray-500 italic border-t border-dashed border-gray-300 pt-3 mt-3 space-y-2">
                {/* Creation Date */}
                <div className="grid grid-cols-2 gap-2">
                  <span>CREATED:</span>
                  <span className="text-right">
                    {formatDateTime(selectedProduct.createdAt)}
                  </span>
                </div>

                {/* Last Update Date */}
                <div className="grid grid-cols-2 gap-2">
                  <span>LAST UPDATED:</span>
                  <span className="text-right">
                    {formatDateTime(selectedProduct.updatedAt)}
                  </span>
                </div>
              </div>

              {/* Footer Disclaimer */}
              <div className="text-center border-t border-dashed border-gray-300 pt-4 text-xs text-gray-600">
                <p>THIS IS A COMPUTER-GENERATED RECORD.</p>
                <p>CONTAINS PRODUCT AND STOCK DETAILS ONLY.</p>
              </div>
            </div>

            {/* Modal Action Buttons (Sticky Footer) */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 rounded-b-lg p-2 print:hidden">
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                {/* Print Button */}
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded bg-blue-600 cursor-pointer text-white hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <span>🖨️</span>
                  <span>PRINT</span>
                </button>

                {/* Close Modal Button */}
                <button
                  onClick={handleCloseViewModal}
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
                  PRODUCTS REPORT SUMMARY
                </p>
                <div className="mt-3 space-y-1 text-sm">
                  <p className="font-semibold text-gray-700">
                    REPORT GENERATED: {formatDateTime(new Date())}
                  </p>
                  <p className="text-gray-600">
                    TOTAL PRODUCTS: {filtered.length} | DATE RANGE:{" "}
                    {dateRangeFilter === "all"
                      ? "ALL TIME"
                      : dateRangeFilter === "7days"
                      ? "LAST 7 DAYS"
                      : dateRangeFilter === "15days"
                      ? "LAST 15 DAYS"
                      : dateRangeFilter === "30days"
                      ? "LAST 30 DAYS"
                      : "LAST 90 DAYS"}
                  </p>
                </div>
              </div>

              {/* Statistics Summary */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-900">
                    {stats.total}
                  </div>
                  <div className="text-blue-700 text-sm">TOTAL PRODUCTS</div>
                </div>
                <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-900">
                    {stats.totalQuantity}
                  </div>
                  <div className="text-green-700 text-sm">TOTAL QUANTITY</div>
                </div>
                <div className="bg-purple-100 border border-purple-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-900">
                    Rs: {stats.totalValue}/-
                  </div>
                  <div className="text-purple-700 text-sm">TOTAL VALUE</div>
                </div>
                <div className="bg-red-100 border border-red-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-900">
                    {stats.outOfStockCount}
                  </div>
                  <div className="text-red-700 text-sm">OUT OF STOCK</div>
                </div>
                <div className="bg-orange-100 border border-orange-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-orange-900">
                    {stats.lowStockCount}
                  </div>
                  <div className="text-orange-700 text-sm">LOW STOCK</div>
                </div>
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-900">
                    {stats.mediumStockCount}
                  </div>
                  <div className="text-yellow-700 text-sm">MEDIUM STOCK</div>
                </div>
              </div>

              {/* Footer Information */}
              <div className="text-center border-t border-dashed border-gray-300 pt-4 text-xs text-gray-600">
                <p>THIS IS A COMPUTER-GENERATED PRODUCTS REPORT.</p>
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
