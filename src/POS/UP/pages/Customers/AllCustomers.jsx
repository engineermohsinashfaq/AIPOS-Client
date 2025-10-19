// |===============================| AllCustomers Component |===============================|
// Import necessary React hooks and external libraries
import React, { useState, useMemo, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X } from "lucide-react";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

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

// Main AllCustomers component function
export default function AllCustomers() {
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

  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for view modal visibility
  const [isViewOpen, setIsViewOpen] = useState(false);

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

  // Effect hook to persist customers data to localStorage
  useEffect(() => {
    localStorage.setItem("all_customers_data", JSON.stringify(customers));
  }, [customers]);

  // Memoized filtered customers based on search query and status filter
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

    // Sort by customer ID
    arr.sort((a, b) => a.customerId.localeCompare(b.customerId));
    return arr;
  }, [customers, query, statusFilter]);

  // Memoized form modification checker - tracks changes between original and current form
  const isFormModified = useMemo(() => {
    if (!originalCustomer || !form) return false;

    // Fields to compare for changes
    const fieldsToCompare = ["contact", "city", "address", "status"];

    const changes = {};
    let hasChanges = false;

    // Compare each field for changes
    fieldsToCompare.forEach((field) => {
      const originalValue = String(originalCustomer[field] || "").trim();
      const formValue = String(form[field] || "").trim();
      if (originalValue !== formValue) {
        changes[field] = {
          from: originalValue,
          to: formValue,
        };
        hasChanges = true;
      }
    });

    setFormChanges(changes);
    return hasChanges;
  }, [form, originalCustomer]);

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
      contact: "Contact",
      city: "City",
      address: "Address",
      status: "Status",
    };
    return fieldNames[field] || field;
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

    // Default handling for other fields
    setForm((s) => ({ ...s, [name]: value }));
  };

  // Save form changes handler
  const handleSave = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!form.contact?.trim()) return notifyError("Contact number is required");

    // Generate update message based on changed fields
    const changedFields = Object.keys(formChanges);
    const updateMessage =
      changedFields.length > 0
        ? `Updated: ${changedFields
            .map((field) => getFieldDisplayName(field))
            .join(", ")}`
        : "Record updated";

    // Prepare updated customer data with metadata
    const updatedForm = {
      ...form,
      updatedAt: formatDateTime(new Date()),
      lastUpdateMessage: updateMessage,
    };

    // Update customers state
    setCustomers((prev) =>
      prev.map((c) => (c.customerId === form.customerId ? updatedForm : c))
    );

    // Close modal and reset states
    setIsModalOpen(false);
    setOriginalCustomer(null);
    setFormChanges({});
    notifySuccess(`${form.customerId} updated successfully.`);
  };

  // Close modal handler
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setOriginalCustomer(null);
    setFormChanges({});
  };

  // Print functionality handler
  const handlePrint = () => {
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.print();
    document.body.style.overflow = bodyOverflow;
  };

  // Component render method
  return (
    // Main container with responsive padding and dark background
    <div className="p-2 min-h-screen text-white">
      {/* Toast notifications container */}
      <ToastContainer position="top-right" theme="dark" autoClose={2000} />

      {/* Content wrapper with max width constraint */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page header section */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">All Customers</h1>
          <p className="text-white/80">
            View, edit, and manage customer accounts.
          </p>
        </div>

        {/* Search and filter panel */}
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

          {/* Status filter dropdown */}
          <div className="flex items-center gap-2 justify-between md:justify-end">
            <label className="text-sm text-white/70">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-2 border border-white/10 rounded bg-white/10 text-white"
            >
              <option className="bg-black/95 text-white">All</option>
              <option className="bg-black/95 text-white">Active</option>
              <option className="bg-black/95 text-white">Inactive</option>
              <option className="bg-black/95 text-white">Suspended</option>
            </select>
          </div>
        </div>

        {/* Main data table container */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-md overflow-x-auto scrollbar-hide ">
          {/* Customers table */}
          <table className="w-full text-white/90 min-w-[900px]">
            {/* Table header with column labels */}
            <thead className="bg-white/10 text-left text-sm">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">CNIC</th>
                <th className="p-3">Contact</th>
                <th className="p-3">City</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            {/* Table body with customer records */}
            <tbody>
              {/* Map through filtered customer records */}
              {filtered.length > 0 ? (
                filtered.map((c) => (
                  <tr
                    key={c.customerId}
                    className={`border-t border-white/15 transition
        hover:bg-green-500/50
        ${
          // Different hover colors based on customer status
          c.status === "Inactive"
            ? "hover:bg-yellow-500/50"
            : c.status === "Suspended"
            ? "hover:bg-red-500/50"
            : ""
        }`}
                  >
                    {/* Customer ID column */}
                    <td className="p-3">{c.customerId}</td>

                    {/* Customer name with avatar */}
                    <td className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <span className="font-medium text-white">
                          {initials(c)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {c.firstName.toUpperCase()} {c.lastName.toUpperCase()}
                        </div>
                      </div>
                    </td>

                    {/* CNIC column */}
                    <td className="p-3">{c.cnic}</td>

                    {/* Contact column */}
                    <td className="p-3">{c.contact}</td>

                    {/* City column */}
                    <td className="p-3">{c.city.toUpperCase()}</td>

                    {/* Status column */}
                    <td className="p-3">{c.status}</td>

                    {/* Actions column with view and edit buttons */}
                    <td className="p-3 flex gap-2">
                      {/* View button */}
                      <button
                        title="View"
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
                        title="Edit"
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
                  <td colSpan="7" className="text-center py-6 text-white/60">
                    {customers.length === 0
                      ? "No customers added yet."
                      : "No customers match your search."}
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
              Edit Customer: {form.customerId}
            </h2>

            {/* Changes detection display */}
            {isFormModified && (
              <div className="mb-4 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded">
                <p className="font-medium text-yellow-300">Changes detected:</p>
                <ul className="text-xs mt-1 space-y-1">
                  {Object.entries(formChanges).map(([field, change]) => (
                    <li key={field} className="flex justify-between">
                      <span>{getFieldDisplayName(field)}:</span>
                      <span className="text-yellow-200">
                        "{change.from}" → "{change.to}"
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Edit form */}
            <form onSubmit={handleSave} className="space-y-3">
              {/* Read-only name fields */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="firstName"
                  value={form.firstName.toUpperCase()}
                  readOnly
                  placeholder="First Name"
                  className="p-2 rounded bg-black/30 border border-white/20 outline-none cursor-not-allowed opacity-70"
                />
                <input
                  name="lastName"
                  value={form.lastName.toUpperCase()}
                  readOnly
                  placeholder="Last Name"
                  className="p-2 rounded bg-black/30 border border-white/20 outline-none cursor-not-allowed opacity-70"
                />
              </div>

              {/* Read-only customer ID */}
              <input
                name="customerId"
                value={form.customerId}
                readOnly
                placeholder="Customer ID"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none cursor-not-allowed opacity-70"
              />

              {/* Read-only CNIC */}
              <input
                name="cnic"
                value={form.cnic}
                readOnly
                placeholder="CNIC"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none cursor-not-allowed opacity-70"
              />

              {/* Read-only password */}
              <input
                name="password"
                value="default123"
                readOnly
                placeholder="Password"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none cursor-not-allowed opacity-70"
              />

              {/* Editable contact field */}
              <input
                name="contact"
                value={form.contact}
                onChange={handleChange}
                placeholder="Contact (+92...)"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />

              {/* Editable city field */}
              <input
                name="city"
                value={form.city.toUpperCase()}
                onChange={handleChange}
                placeholder="City"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />

              {/* Editable address field */}
              <input
                name="address"
                value={form.address.toUpperCase() || ""}
                onChange={handleChange}
                placeholder="Address"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />

              {/* Editable status dropdown */}
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              >
                <option className="bg-black/90">Active</option>
                <option className="bg-black/90">Inactive</option>
                <option className="bg-black/90">Suspended</option>
              </select>

              {/* Form action buttons */}
              <div className="flex justify-end gap-3 pt-4">
                {/* Save button (disabled if no changes) */}
                <button
                  type="submit"
                  disabled={!isFormModified}
                  className={`px-4 py-2 rounded border border-white/40 transition hover:cursor-pointer ${
                    isFormModified
                      ? "bg-cyan-800/80 hover:bg-cyan-900"
                      : "bg-gray-600/50 cursor-not-allowed opacity-50"
                  }`}
                >
                  Save Changes
                </button>

                {/* Cancel button */}
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded border border-white/40 bg-red-600 hover:bg-red-700 transition hover:cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Customer Details Modal */}
      {isViewOpen && selectedCustomer && (
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
                  Customer Information
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-semibold text-gray-700">
                    Customer ID: {selectedCustomer.customerId}
                  </p>
                </div>
              </div>

              {/* Customer details section */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">First Name:</span>
                  <span className="text-gray-900 text-right">
                    {selectedCustomer.firstName.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Last Name:</span>
                  <span className="text-gray-900 text-right">
                    {selectedCustomer.lastName.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Contact:</span>
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
                  <span className="font-medium text-gray-700">City:</span>
                  <span className="text-gray-900 text-right">
                    {selectedCustomer.city.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">Address:</span>
                  <span className="text-gray-900 text-right">
                    {selectedCustomer.address.toUpperCase() || "—"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2  border-t border-b border-dashed border-gray-300 py-3 ">
                  <span className="font-medium text-gray-700">Password:</span>
                  <span className="text-gray-900 text-right">customer@321</span>
                </div>
              </div>

              {/* Status highlight section with color coding */}
              <div
                className={`rounded-md p-2 mt-3 ${
                  selectedCustomer.status === "Active"
                    ? "bg-green-200 border border-green-300"
                    : selectedCustomer.status === "Inactive"
                    ? "bg-yellow-200 border border-yellow-300"
                    : "bg-red-200 border border-red-300"
                }`}
              >
                <div className="grid grid-cols-2 gap-2">
                  <span
                    className={`font-bold ${
                      selectedCustomer.status === "Active"
                        ? "text-green-900"
                        : selectedCustomer.status === "Inactive"
                        ? "text-yellow-900"
                        : "text-red-900"
                    }`}
                  >
                    Account Status:
                  </span>
                  <span
                    className={`font-bold text-right ${
                      selectedCustomer.status === "Active"
                        ? "text-green-900"
                        : selectedCustomer.status === "Inactive"
                        ? "text-yellow-900"
                        : "text-red-900"
                    }`}
                  >
                    {selectedCustomer.status}
                  </span>
                </div>
              </div>

              {/* Timestamp and update history section */}
              <div className="text-xs text-gray-500 italic border-t border-dashed border-gray-300 pt-3 mt-3">
                <div className="grid grid-cols-2 gap-2">
                  <span>Date Added:</span>
                  <span className="text-right">
                    {formatDateTime(selectedCustomer.dateAdded)}
                  </span>
                </div>
                {/* Show update timestamp if available */}
                {selectedCustomer.updatedAt && (
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <span>Last Updated:</span>
                    <span className="text-right">
                      {formatDateTime(selectedCustomer.updatedAt)}
                    </span>
                  </div>
                )}
                {/* Show update message if available */}
                {selectedCustomer.lastUpdateMessage && (
                  <div className="col-span-2 mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800">
                    <span className="font-medium">Update Note: </span>
                    {selectedCustomer.lastUpdateMessage}
                  </div>
                )}
              </div>

              {/* Footer disclaimer */}
              <div className="text-center border-t border-dashed border-gray-300 pt-4 text-xs text-gray-600">
                <p>This is a computer-generated customer record.</p>
                <p>Contains personal and contact information only.</p>
              </div>
            </div>

            {/* Modal action buttons (sticky footer) */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 rounded-b-lg p-2 print:hidden">
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                {/* Print button */}
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded bg-blue-600 cursor-pointer text-white hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <span>🖨️</span>
                  <span>Print</span>
                </button>

                {/* Close modal button */}
                <button
                  onClick={() => setIsViewOpen(false)}
                  className="px-4 py-2 rounded bg-gray-600 cursor-pointer text-white hover:bg-gray-700 transition font-medium"
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
