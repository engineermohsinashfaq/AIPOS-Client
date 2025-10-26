// |===============================| CustomerReports Component |===============================|
// Import necessary React hooks and external libraries
import React, { useState, useMemo, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X, Download, Printer } from "lucide-react";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
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
      "Customer ID",
      "First Name",
      "Last Name",
      "CNIC",
      "Contact",
      "City",
      "Address",
      "Status",
      "Date Added",
      "Last Updated",
    ];

    // Convert data to CSV rows
    const csvRows = data.map((customer) => [
      customer.customerId,
      customer.firstName,
      customer.lastName,
      customer.cnic,
      customer.contact,
      customer.city,
      customer.address || "",
      customer.status,
      formatShortDate(customer.dateAdded),
      customer.updatedAt ? formatShortDate(customer.updatedAt) : "",
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

// Capitalize case utility function
const toCapitalizeCase = (str) => {
  if (!str || typeof str !== "string") return str;
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// Main CustomerDetails component function
export default function CustomersDetails() {
  // State management for customers data with localStorage initialization
  const [customers, setCustomers] = useState(() => {
    try {
      const raw = localStorage.getItem("all_customers_data");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // State for search functionality
  const [query, setQuery] = useState("");

  // State for status filtering
  const [statusFilter, setStatusFilter] = useState("All");

  // State for date range filtering
  const [dateRangeFilter, setDateRangeFilter] = useState("all");

  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for view modal visibility
  const [isViewOpen, setIsViewOpen] = useState(false);

  // State for report modal visibility
  const [isReportOpen, setIsReportOpen] = useState(false);

  // State for edit mode
  const [editing, setEditing] = useState(false);

  // State for selected customer details
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // State for form data
  const [form, setForm] = useState({});

  // State for tracking original customer data before edits
  const [originalCustomer, setOriginalCustomer] = useState(null);

  // State for tracking form changes
  const [formChanges, setFormChanges] = useState({});

  // State for password verification
  const [password, setPassword] = useState("");
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  // Effect hook to persist customers data to localStorage
  useEffect(() => {
    localStorage.setItem("all_customers_data", JSON.stringify(customers));
  }, [customers]);

  // Memoized filtered customers based on search query, status filter, and date range
  const filtered = useMemo(() => {
    let arr = customers.slice();

    // Apply search filter if query exists
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((c) =>
        // Search across multiple customer fields
        [
          c.customerId,
          c.firstName,
          c.lastName,
          c.contact,
          c.cnic,
          c.city,
          c.address,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    // Apply status filter if not "All"
    if (statusFilter !== "All")
      arr = arr.filter((c) => c.status === statusFilter);

    // Apply date range filter if not "all"
    if (dateRangeFilter !== "all") {
      const { start, end } = getDateRange(dateRangeFilter);
      if (start && end) {
        arr = arr.filter((c) => {
          const customerDate = new Date(
            c.dateAdded || c.createdAt || c.updatedAt
          );
          return customerDate >= start && customerDate <= end;
        });
      }
    }

    // Sort by customer ID
    arr.sort((a, b) => a.customerId.localeCompare(b.customerId));
    return arr;
  }, [customers, query, statusFilter, dateRangeFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = filtered.length;
    const active = filtered.filter((c) => c.status === "Active").length;
    const inactive = filtered.filter((c) => c.status === "Inactive").length;
    const suspended = filtered.filter((c) => c.status === "Suspended").length;

    return { total, active, inactive, suspended };
  }, [filtered]);

  // Toast notification configuration
  const toastConfig = {
    position: "top-right",
    theme: "dark",
    autoClose: 2000,
  };
  const notifySuccess = (msg) => toast.success(msg, toastConfig);
  const notifyError = (msg) => toast.error(msg, toastConfig);

  // Generate customer initials from first and last name
  const initials = (c) =>
    `${(c.firstName || "").charAt(0)}${(c.lastName || "").charAt(
      0
    )}`.toUpperCase();

  // Field name mapper for display purposes
  const getFieldDisplayName = (field) => {
    const fieldNames = {
      contact: "CONTACT",
      city: "CITY",
      address: "ADDRESS",
      status: "STATUS",
    };
    return fieldNames[field] || field;
  };

  // Get password for display - can be replaced with DB fetch later
  const getCustomerPassword = (customer) => {
    return "pakistan@123"; // This will be fetched from DB later
  };

  // Get status color class
  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-600 border border-white/30";
      case "Inactive":
        return "bg-yellow-600 border border-white/30";
      case "Suspended":
        return "bg-red-600 border border-white/30";
      default:
        return "bg-gray-600 border border-white/30";
    }
  };

  // Get status background color for view modal
  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-200 border border-green-900 ";
      case "Inactive":
        return "bg-yellow-200 border border-yellow-900 ";
      case "Suspended":
        return "bg-red-200 border border-red-900 ";
      default:
        return "bg-gray-200 border border-gray-900 ";
    }
  };

  // Get status text color for view modal
  const getStatusTextColor = (status) => {
    switch (status) {
      case "Active":
        return "text-green-900";
      case "Inactive":
        return "text-yellow-900";
      case "Suspended":
        return "text-red-900";
      default:
        return "text-gray-900";
    }
  };

  // Open edit modal with customer data
  const handleOpenEdit = (customer) => {
    setForm(customer);
    setOriginalCustomer(customer);
    setFormChanges({});
    setEditing(true);
    setIsModalOpen(true);
  };

  // Form input change handler with special handling for contact field
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for contact field - enforce + prefix
    if (name === "contact") {
      let val = value.replace(/[^\d+]/g, "");
      if (val && val[0] !== "+") val = "+" + val.replace(/\+/g, "");
      setForm((s) => ({ ...s, contact: val }));
      return;
    }

    // Default handling for other fields - keep input as-is (no auto-capitalization)
    setForm((s) => ({ ...s, [name]: value }));
  };

  // Password change handler
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  // Verify password and save changes
  const verifyPasswordAndSave = () => {
    // Temporary POS password - will be fetched from DB later
    const posPassword = "0000";

    if (password !== posPassword) {
      notifyError("Invalid password. Changes not saved.");
      setPassword("");
      return;
    }

    // Password verified, proceed with save
    saveChanges();
    setShowPasswordPrompt(false);
    setPassword("");
  };

  // Save form changes handler
  const saveChanges = () => {
    // Validate required fields
    if (!form.contact?.trim()) {
      notifyError("Contact number is required.");
      return;
    }

    // Apply Capitalize case to text fields before saving
    const processedForm = {
      ...form,
      // Apply Capitalize case to name fields
      firstName: toCapitalizeCase(form.firstName || ""),
      lastName: toCapitalizeCase(form.lastName || ""),
      // Apply Capitalize case to city and address
      city: toCapitalizeCase(form.city || ""),
      address: toCapitalizeCase(form.address || ""),
      // Keep contact and status as-is (contact has special format, status is from dropdown)
      contact: form.contact,
      status: form.status,
      updatedAt: formatDateTime(new Date()),
    };

    // Update customers state - FIXED: Use processedForm instead of updatedForm
    setCustomers((prev) =>
      prev.map((c) => (c.customerId === form.customerId ? processedForm : c))
    );

    // Close modal and reset states
    setIsModalOpen(false);
    setOriginalCustomer(null);
    setFormChanges({});
    notifySuccess(`${form.customerId} UPDATED SUCCESSFULLY.`);
  };
  // Handle save button click - show password prompt
  const handleSave = (e) => {
    e.preventDefault();

    setShowPasswordPrompt(true);
  };

  // Close modal handler
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setOriginalCustomer(null);
    setFormChanges({});
    setPassword("");
    setShowPasswordPrompt(false);
  };

  // Close password prompt
  const handleClosePasswordPrompt = () => {
    setShowPasswordPrompt(false);
    setPassword("");
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
      filtered,
      `customer-report-${new Date().toISOString().split("T")[0]}`
    );
    if (success) {
      notifySuccess("REPORT EXPORTED TO EXCEL SUCCESSFULLY");
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
            CUSTOMER DETAILS
          </h1>
          <p className="text-white/80">
            VIEW, ANALYZE, AND EXPORT CUSTOMER DATA WITH ADVANCED FILTERING.
          </p>
        </div>

        {/* Search and filter panel */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-md p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
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
              placeholder="SEARCH CUSTOMERS..."
              className="flex-1 outline-none bg-transparent text-white placeholder-white/60"
            />
          </div>

          {/* Status filter dropdown */}
          <div className="flex items-center gap-2 justify-between">
            <label className="text-sm text-white/70">STATUS</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border border-white/10 rounded bg-white/10 text-white flex-1  scrollbar-hide"
            >
              <option className="bg-black/95 text-white">All</option>
              <option className="bg-black/95 text-white">Active</option>
              <option className="bg-black/95 text-white">Inactive</option>
              <option className="bg-black/95 text-white">Suspended</option>
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

        {/* Main data table container */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-md overflow-x-auto scrollbar-hide">
          {/* Customers table */}
          <table className="w-full text-white/90 min-w-[900px]">
            {/* Table header with column labels */}
            <thead className="bg-white/10 text-left text-sm">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">NAME</th>
                <th className="p-3">CNIC</th>
                <th className="p-3">CONTACT</th>
                <th className="p-3">CITY</th>
                <th className="p-3">STATUS</th>
                <th className="p-3">DATE ADDED</th>
                <th className="p-3">ACTIONS</th>
              </tr>
            </thead>

            {/* Table body with customer records */}
            <tbody>
              {/* Map through filtered customer records */}
              {filtered.length > 0 ? (
                filtered.map((c) => (
                  <tr
                    key={c.customerId}
                    className={`border-t border-white/15 transition ${
                      c.status === "Inactive"
                        ? "bg-yellow-700/30 hover:bg-yellow-700/50"
                        : c.status === "Suspended"
                        ? "bg-red-700/30 hover:bg-red-700/50"
                        : "bg-green-700/30 hover:bg-green-700/50"
                    }`}
                  >
                    {/* Customer ID column */}
                    <td className="p-3">{c.customerId}</td>

                    {/* Customer name with avatar */}
                    <td className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 border border-white/20 flex items-center justify-center">
                        <span className="font-medium text-white">
                          {initials(c)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {c.firstName} {c.lastName}
                        </div>
                      </div>
                    </td>

                    {/* CNIC column */}
                    <td className="p-3">{c.cnic}</td>

                    {/* Contact column */}
                    <td className="p-3">{c.contact}</td>

                    {/* City column */}
                    <td className="p-3">{c.city}</td>

                    {/* Status column */}
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium text-white  ${getStatusColor(
                          c.status
                        )}`}
                      >
                        {c.status}
                      </span>
                    </td>

                    {/* Date Added column */}
                    <td className="p-3">{formatShortDate(c.dateAdded)}</td>

                    {/* Actions column with view and edit buttons */}
                    <td className="p-3 flex gap-2">
                      {/* View button */}
                      <button
                        title="VIEW"
                        onClick={() => {
                          setSelectedCustomer(c);
                          setIsViewOpen(true);
                        }}
                        className="p-2 rounded bg-cyan-900 text-white hover:bg-cyan-950 transition-colors cursor-pointer"
                      >
                        <VisibilityIcon fontSize="small" />
                      </button>

                      {/* Edit button */}
                      <button
                        title="EDIT"
                        onClick={() => handleOpenEdit(c)}
                        className="p-2 rounded bg-yellow-400 text-gray-900 hover:bg-yellow-300 transition-colors cursor-pointer"
                      >
                        <EditIcon fontSize="small" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                // Empty state message
                <tr>
                  <td colSpan="8" className="text-center py-6 text-white/60">
                    {customers.length === 0
                      ? "NO CUSTOMERS ADDED YET."
                      : "NO CUSTOMERS MATCH YOUR SEARCH CRITERIA."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 backdrop-blur-md">
          {/* Modal content container */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-lg text-white">
            {/* Modal header */}
            <h2 className="text-xl font-semibold mb-4">
              EDIT CUSTOMER: {form.customerId}
            </h2>

            {/* Edit form */}
            <form onSubmit={handleSave} className="space-y-3">
              {/* Form fields remain the same as in AllCustomers */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="firstName"
                  value={form.firstName || ""}
                  readOnly
                  placeholder="FIRST NAME"
                  className="p-2 rounded bg-black/30 border border-white/20 outline-none cursor-not-allowed opacity-70"
                />
                <input
                  name="lastName"
                  value={form.lastName || ""}
                  readOnly
                  placeholder="LAST NAME"
                  className="p-2 rounded bg-black/30 border border-white/20 outline-none cursor-not-allowed opacity-70"
                />
              </div>

              <input
                name="customerId"
                value={form.customerId || ""}
                readOnly
                placeholder="CUSTOMER ID"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none cursor-not-allowed opacity-70"
              />

              <input
                name="cnic"
                value={form.cnic || ""}
                readOnly
                placeholder="CNIC"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none cursor-not-allowed opacity-70"
              />

              <input
                name="password"
                value={getCustomerPassword(form)}
                readOnly
                placeholder="PASSWORD"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none cursor-not-allowed opacity-70"
              />

              <input
                name="contact"
                value={form.contact || ""}
                onChange={handleChange}
                placeholder="CONTACT (+92...)"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />

              <input
                name="city"
                value={form.city || ""}
                onChange={handleChange}
                placeholder="CITY"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />

              <input
                name="address"
                value={form.address || ""}
                onChange={handleChange}
                placeholder="ADDRESS"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />

              <select
                name="status"
                value={form.status || ""}
                onChange={handleChange}
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none  scrollbar-hide"
              >
                <option className="bg-black/90">Active</option>
                <option className="bg-black/90">Inactive</option>
                <option className="bg-black/90">Suspended</option>
              </select>

              {/* Form action buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="submit"
                  className={`px-4 py-2 rounded border border-white/40 transition hover:cursor-pointer bg-cyan-800/80 hover:bg-cyan-900"
                  }`}
                >
                  SAVE CHANGES
                </button>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded border border-white/40 bg-red-600 hover:bg-red-700 transition hover:cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </form>
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
                PLEASE ENTER YOUR POS PASSWORD TO CONFIRM CHANGES
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
                  onClick={verifyPasswordAndSave}
                  disabled={!password.trim()}
                  className={`px-4 py-2 rounded border border-white/40 transition hover:cursor-pointer ${
                    password.trim()
                      ? "bg-cyan-800/80 hover:bg-cyan-900"
                      : "bg-gray-600/50 cursor-not-allowed opacity-50"
                  }`}
                >
                  VERIFY & SAVE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Customer Details Modal */}
      {isViewOpen && selectedCustomer && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-2 md:p-4 backdrop-blur-md print:p-0">
          <div className="bg-white text-black rounded-lg w-full max-w-md mx-auto max-h-[95vh] overflow-y-auto scrollbar-hide relative font-sans text-sm border border-gray-300">
            <div className="p-4 space-y-3">
              <div className="text-center border-b border-dashed border-gray-300 pb-3 mb-3">
                <h2 className="text-xl font-bold tracking-wider text-gray-900">
                  ZUBI ELECTRONICS
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  CUSTOMER INFORMATION
                </p>
                <div className="mt-1 space-y-1">
                  <p className="text-xs font-semibold text-gray-700">
                    CUSTOMER ID: {selectedCustomer.customerId}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">FIRST NAME:</span>
                  <span className="text-gray-900 text-right">
                    {selectedCustomer.firstName}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">LAST NAME:</span>
                  <span className="text-gray-900 text-right">
                    {selectedCustomer.lastName}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">CONTACT:</span>
                  <span className="text-gray-900 text-right">
                    {selectedCustomer.contact}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">CNIC:</span>
                  <span className="text-gray-900 text-right">
                    {selectedCustomer.cnic}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">CITY:</span>
                  <span className="text-gray-900 text-right">
                    {selectedCustomer.city}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">ADDRESS:</span>
                  <span className="text-gray-900 text-right">
                    {selectedCustomer.address || "—"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2  border-t border-b border-dashed border-gray-300 py-3 ">
                  <span className="font-medium text-gray-700">PASSWORD:</span>
                  <span className="text-gray-900 text-right">
                    {getCustomerPassword(selectedCustomer)}
                  </span>
                </div>
              </div>

              <div
                className={`rounded-md p-2 mt-3 ${getStatusBackgroundColor(
                  selectedCustomer.status
                )}`}
              >
                <div className="grid grid-cols-2 gap-2">
                  <span
                    className={`font-bold ${getStatusTextColor(
                      selectedCustomer.status
                    )}`}
                  >
                    ACCOUNT STATUS:
                  </span>
                  <span
                    className={`font-bold text-right ${getStatusTextColor(
                      selectedCustomer.status
                    )}`}
                  >
                    {selectedCustomer.status}
                  </span>
                </div>
              </div>

              <div className="text-xs text-gray-500 italic border-t border-dashed border-gray-300 pt-3 mt-3">
                <div className="grid grid-cols-2 gap-2">
                  <span>DATE ADDED:</span>
                  <span className="text-right">
                    {formatDateTime(selectedCustomer.dateAdded)}
                  </span>
                </div>
                {selectedCustomer.updatedAt && (
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <span>LAST UPDATED:</span>
                    <span className="text-right">
                      {formatDateTime(selectedCustomer.updatedAt)}
                    </span>
                  </div>
                )}
              </div>

              <div className="text-center border-t border-dashed border-gray-300 pt-4 text-xs text-gray-600">
                <p>THIS IS A COMPUTER-GENERATED CUSTOMER RECORD.</p>
                <p>CONTAINS PERSONAL AND CONTACT INFORMATION ONLY.</p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 rounded-b-lg p-2 print:hidden">
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded bg-blue-600 cursor-pointer text-white hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <span>🖨️</span>
                  <span>PRINT</span>
                </button>

                <button
                  onClick={() => setIsViewOpen(false)}
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
                  CUSTOMER REPORT SUMMARY
                </p>
                <div className="mt-3 space-y-1 text-sm">
                  <p className="font-semibold text-gray-700">
                    REPORT GENERATED: {formatDateTime(new Date())}
                  </p>
                  <p className="text-gray-600">
                    Total Records: {filtered.length} | Date Range:{" "}
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

              {/* Statistics Summary Only */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-900">
                    {stats.total}
                  </div>
                  <div className="text-blue-700 text-sm">TOTAL CUSTOMERS</div>
                </div>
                <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-900">
                    {stats.active}
                  </div>
                  <div className="text-green-700 text-sm">Active</div>
                </div>
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-900">
                    {stats.inactive}
                  </div>
                  <div className="text-yellow-700 text-sm">Inactive</div>
                </div>
                <div className="bg-red-100 border border-red-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-900">
                    {stats.suspended}
                  </div>
                  <div className="text-red-700 text-sm">Suspended</div>
                </div>
              </div>

              {/* Footer Information */}
              <div className="text-center border-t border-dashed border-gray-300 pt-4 text-xs text-gray-600">
                <p>THIS IS A COMPUTER-GENERATED CUSTOMER REPORT.</p>
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
