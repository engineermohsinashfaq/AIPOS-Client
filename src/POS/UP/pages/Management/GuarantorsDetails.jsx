// |===============================| GuarantorsReports Component |===============================|
// Import necessary React hooks and external libraries
import React, { useState, useMemo, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Download, Printer } from "lucide-react";
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

// Capitalize case utility function
const toCapitalizeCase = (str) => {
  if (!str || typeof str !== "string") return str;
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
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
      "Guarantor ID",
      "First Name",
      "Last Name",
      "Contact Number",
      "CNIC",
      "City",
      "Address",
      "Date Added",
      "Last Updated",
    ];

    // Convert data to CSV rows
    const csvRows = data.map((guarantor) => [
      guarantor.guarantorId,
      guarantor.firstName,
      guarantor.lastName,
      guarantor.contact,
      guarantor.cnic,
      guarantor.city,
      guarantor.address || "",
      formatShortDate(guarantor.dateAdded),
      guarantor.updatedAt ? formatShortDate(guarantor.updatedAt) : "",
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

// Main GuarantorsDetails component function
export default function GuarantorsDetails() {
  // State management for guarantors data with localStorage initialization and date fixing
  const [guarantors, setGuarantors] = useState(() => {
    try {
      const raw = localStorage.getItem("all_guarantors_data");
      const data = raw ? JSON.parse(raw) : [];

      // Fix date format for existing guarantors with incomplete dates
      const fixedData = data.map((guarantor) => {
        if (guarantor.dateAdded && !guarantor.dateAdded.includes(":")) {
          return {
            ...guarantor,
            dateAdded: formatDateTime(new Date()),
          };
        }
        return guarantor;
      });

      // Update localStorage if dates were fixed
      if (
        data.length > 0 &&
        fixedData.some((g, i) => g.dateAdded !== data[i].dateAdded)
      ) {
        localStorage.setItem("all_guarantors_data", JSON.stringify(fixedData));
      }

      return fixedData;
    } catch {
      return [];
    }
  });

  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for view modal visibility
  const [isViewOpen, setIsViewOpen] = useState(false);

  // State for report modal visibility
  const [isReportOpen, setIsReportOpen] = useState(false);

  // State for edit mode
  const [editing, setEditing] = useState(false);

  // State for search query
  const [query, setQuery] = useState("");

  // State for city filtering
  const [cityFilter, setCityFilter] = useState("All");

  // State for date range filtering
  const [dateRangeFilter, setDateRangeFilter] = useState("all");

  // State for selected guarantor details
  const [selectedGuarantor, setSelectedGuarantor] = useState(null);

  // State for form data
  const [form, setForm] = useState({});

  // State for tracking original guarantor data before edits
  const [originalGuarantor, setOriginalGuarantor] = useState(null);

  // State for tracking form changes
  const [formChanges, setFormChanges] = useState({});

  // State for password verification
  const [password, setPassword] = useState("");
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  // Effect hook to persist guarantors data to localStorage
  useEffect(() => {
    localStorage.setItem("all_guarantors_data", JSON.stringify(guarantors));
  }, [guarantors]);

  // Get unique cities for filter dropdown
  const uniqueCities = useMemo(() => {
    const cities = [...new Set(guarantors.map((g) => g.city))].filter(Boolean);
    return cities.sort();
  }, [guarantors]);

  // Memoized filtered guarantors based on search query and filters
  const filteredGuarantors = useMemo(() => {
    let arr = guarantors.slice();

    // Apply search filter if query exists
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      arr = arr.filter((g) => {
        // Search across multiple guarantor fields
        const searchableFields = [
          g.guarantorId,
          g.firstName,
          g.lastName,
          g.contact,
          g.cnic,
          g.city,
          g.address,
        ]
          .filter(Boolean) // Remove null/undefined values
          .map((field) => field.toString().toLowerCase())
          .join(" ");

        return searchableFields.includes(q);
      });
    }

    // Apply city filter if not "All"
    if (cityFilter !== "All") {
      arr = arr.filter((g) => g.city === cityFilter);
    }

    // Apply date range filter if not "all"
    if (dateRangeFilter !== "all") {
      const { start, end } = getDateRange(dateRangeFilter);
      if (start && end) {
        arr = arr.filter((g) => {
          const guarantorDate = parseDateForSorting(g.dateAdded);
          return guarantorDate >= start && guarantorDate <= end;
        });
      }
    }

    // Sort by date added (newest first)
    return arr.sort((a, b) => {
      const dateA = parseDateForSorting(a.dateAdded);
      const dateB = parseDateForSorting(b.dateAdded);
      return dateB - dateA;
    });
  }, [guarantors, query, cityFilter, dateRangeFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = filteredGuarantors.length;
    const withAddress = filteredGuarantors.filter(
      (g) => g.address && g.address.trim() !== ""
    ).length;
    const recentlyUpdated = filteredGuarantors.filter((g) => {
      if (!g.updatedAt) return false;
      const updateDate = parseDateForSorting(g.updatedAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return updateDate >= thirtyDaysAgo;
    }).length;
    const recentlyAdded = filteredGuarantors.filter((g) => {
      const addDate = parseDateForSorting(g.dateAdded);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return addDate >= thirtyDaysAgo;
    }).length;

    return {
      total,
      withAddress,
      recentlyUpdated,
      recentlyAdded,
    };
  }, [filteredGuarantors]);

  // Toast notification configuration
  const toastConfig = {
    position: "top-right",
    theme: "dark",
    autoClose: 2000,
  };
  const notifySuccess = (msg) => toast.success(msg, toastConfig);
  const notifyError = (msg) => toast.error(msg, toastConfig);

  // Generate guarantor initials from first and last name
  const initials = (g) =>
    `${(g.firstName || "").charAt(0)}${(g.lastName || "").charAt(
      0
    )}`.toUpperCase();

  // Field name mapper for display purposes
  const getFieldDisplayName = (field) => {
    const fieldNames = {
      contact: "CONTACT",
      city: "CITY",
      address: "ADDRESS",
    };
    return fieldNames[field] || field.toUpperCase();
  };

  // Open edit modal with guarantor data
  const handleOpenEdit = (guarantor) => {
    setForm(guarantor);
    setOriginalGuarantor(guarantor);
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
      // Keep contact as-is (contact has special format)
      contact: form.contact,
      updatedAt: formatDateTime(new Date()),
    };

    // Generate update message based on changed fields
    const changedFields = Object.keys(formChanges);
    const updateMessage =
      changedFields.length > 0
        ? `UPDATED: ${changedFields
            .map((field) => getFieldDisplayName(field))
            .join(", ")}`
        : "RECORD UPDATED";

    // Prepare updated guarantor data with metadata
    const updatedForm = {
      ...processedForm,
      lastUpdateMessage: updateMessage,
    };

    // Update guarantors state
    setGuarantors((prev) =>
      prev.map((g) => (g.guarantorId === form.guarantorId ? updatedForm : g))
    );

    // Close modal and reset states
    setIsModalOpen(false);
    setOriginalGuarantor(null);
    setFormChanges({});
    notifySuccess(`Guarantor updated successfully.`);
  };

  // Handle save button click - show password prompt
  const handleSave = (e) => {
    e.preventDefault();

    setShowPasswordPrompt(true);
  };

  // Close modal handler
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setOriginalGuarantor(null);
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
    if (filteredGuarantors.length === 0) {
      notifyError("No data available to export");
      return;
    }

    const success = exportToExcel(
      filteredGuarantors,
      `guarantors-report-${new Date().toISOString().split("T")[0]}`
    );
    if (success) {
      notifySuccess("Guarantors report exported successfully");
    }
  };

  // Open report summary modal
  const handleOpenReport = () => {
    setIsReportOpen(true);
  };

  // Effect hook to fix existing guarantor dates on component mount
  useEffect(() => {
    const fixExistingGuarantorDates = () => {
      const raw = localStorage.getItem("all_guarantors_data");
      if (!raw) return;

      try {
        const data = JSON.parse(raw);
        let needsFix = false;

        // Fix dates that are missing time component
        const fixedData = data.map((guarantor) => {
          if (
            guarantor.dateAdded &&
            (guarantor.dateAdded.length <= 10 ||
              !guarantor.dateAdded.includes(":"))
          ) {
            const originalDate = new Date(guarantor.dateAdded);
            if (!isNaN(originalDate.getTime())) {
              needsFix = true;
              return {
                ...guarantor,
                dateAdded: formatDateTime(originalDate),
              };
            }
          }
          return guarantor;
        });

        // Update localStorage and state if fixes were applied
        if (needsFix) {
          localStorage.setItem(
            "all_guarantors_data",
            JSON.stringify(fixedData)
          );
          setGuarantors(fixedData);
        }
      } catch (error) {
        console.error("Error fixing guarantor dates:", error);
      }
    };

    fixExistingGuarantorDates();
  }, []);

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
          <h1 className="text-3xl font-bold mb-2">GUARANTORS DETAILS</h1>
          <p className="text-white/80">
            ANALYZE AND EXPORT GUARANTORS DATA WITH ADVANCED FILTERING AND
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
              placeholder="SEARCH GUARANTORS..."
              className="flex-1 outline-none bg-transparent text-white placeholder-white/60"
            />
          </div>

          {/* City filter dropdown */}
          <div className="flex items-center gap-2 justify-between">
            <label className="text-sm text-white/70">CITY</label>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="p-2 border border-white/10 rounded bg-white/10 text-white flex-1  scrollbar-hide"
            >
              <option value="All" className="bg-black/95 text-white">
                ALL
              </option>
              {uniqueCities.map((city) => (
                <option
                  key={city}
                  value={city}
                  className="bg-black/95 text-white"
                >
                  {city}
                </option>
              ))}
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
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-md overflow-x-auto scrollbar-hide ">
          {/* Guarantors table */}
          <table className="w-full text-white/90 min-w-[900px]">
            {/* Table header with column labels */}
            <thead className="bg-white/10 text-left text-sm">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">NAME</th>
                <th className="p-3">CONTACT</th>
                <th className="p-3">CNIC</th>
                <th className="p-3">CITY</th>
                <th className="p-3">DATE ADDED</th>
                <th className="p-3">ACTIONS</th>
              </tr>
            </thead>

            {/* Table body with guarantor records */}
            <tbody>
              {/* Map through filtered guarantor records */}
              {filteredGuarantors.length > 0 ? (
                filteredGuarantors.map((g) => (
                  <tr
                    key={g.guarantorId}
                    className="border-t border-white/15 hover:bg-white/5 transition"
                  >
                    {/* Guarantor ID column */}
                    <td className="p-3">{g.guarantorId}</td>

                    {/* Guarantor name with avatar */}
                    <td className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <span className="font-medium text-white">
                          {initials(g)}
                        </span>
                      </div>
                      <div>
                        {g.firstName} {g.lastName}
                      </div>
                    </td>

                    {/* Contact column */}
                    <td className="p-3">{g.contact}</td>

                    {/* CNIC column */}
                    <td className="p-3">{g.cnic}</td>

                    {/* City column */}
                    <td className="p-3">{g.city}</td>

                    {/* Date added column with short format */}
                    <td className="p-3 text-sm">
                      {formatShortDate(g.dateAdded)}
                    </td>

                    {/* Actions column with view and edit buttons */}
                    <td className="p-3 flex gap-2">
                      {/* View button */}
                      <button
                        title="VIEW"
                        onClick={() => {
                          setSelectedGuarantor(g);
                          setIsViewOpen(true);
                        }}
                        className="p-2 rounded bg-cyan-900 text-white hover:bg-cyan-950 transition-colors cursor-pointer"
                      >
                        <VisibilityIcon fontSize="small" />
                      </button>

                      {/* Edit button */}
                      <button
                        title="EDIT"
                        onClick={() => handleOpenEdit(g)}
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
                    {guarantors.length === 0
                      ? "NO GUARANTORS ADDED YET."
                      : "NO GUARANTORS MATCH YOUR SEARCH CRITERIA."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Guarantor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 backdrop-blur-md p-2">
          {/* Modal content container */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-lg text-white">
            {/* Modal header with guarantor info */}
            <div className="mb-4">
              <h2 className="text-xl font-semibold">EDIT GUARANTOR</h2>
              <div className="text-sm text-white/80 mt-2 space-y-1">
                <p>
                  <strong>GUARANTOR ID:</strong> {form.guarantorId}
                </p>
                <p>
                  <strong>DATE ADDED:</strong> {formatDateTime(form.dateAdded)}
                </p>
              </div>
            </div>

            {/* Edit form */}
            <form onSubmit={handleSave} className="space-y-3">
              {/* Read-only name fields */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="firstName"
                  value={form.firstName}
                  readOnly
                  placeholder="FIRST NAME"
                  className="p-2 rounded bg-black/30 border border-white/20 outline-none cursor-not-allowed opacity-70"
                />
                <input
                  name="lastName"
                  value={form.lastName}
                  readOnly
                  placeholder="LAST NAME"
                  className="p-2 rounded bg-black/30 border border-white/20 outline-none cursor-not-allowed opacity-70"
                />
              </div>

              {/* Read-only guarantor ID */}
              <input
                name="guarantorId"
                value={form.guarantorId}
                readOnly
                placeholder="GUARANTOR ID"
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

              {/* Editable contact field */}
              <input
                name="contact"
                value={form.contact}
                onChange={handleChange}
                placeholder="CONTACT (+92...)"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />

              {/* Editable city field */}
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="CITY"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />

              {/* Editable address field */}
              <input
                name="address"
                value={form.address || ""}
                onChange={handleChange}
                placeholder="ADDRESS"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />

              {/* Form action buttons */}
              <div className="flex justify-end gap-3 pt-4">
                {/* Save button (disabled if no changes) */}
                <button
                  type="submit"
                  className={`px-4 py-2 rounded border border-white/40 transition hover:cursor-pointer "bg-cyan-800/80 hover:bg-cyan-900"
                  }`}
                >
                  SAVE CHANGES
                </button>

                {/* Cancel button */}
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

      {/* View Guarantor Details Modal */}
      {isViewOpen && selectedGuarantor && (
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
                  GUARANTOR INFORMATION
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-semibold text-gray-700">
                    GUARANTOR ID: {selectedGuarantor.guarantorId}
                  </p>
                </div>
              </div>

              {/* Guarantor details section */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">FIRST NAME:</span>
                  <span className="text-gray-900 text-right">
                    {selectedGuarantor.firstName}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">LAST NAME:</span>
                  <span className="text-gray-900 text-right">
                    {selectedGuarantor.lastName}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">CONTACT:</span>
                  <span className="text-gray-900 text-right">
                    {selectedGuarantor.contact}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">CNIC:</span>
                  <span className="text-gray-900 text-right">
                    {selectedGuarantor.cnic}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">CITY:</span>
                  <span className="text-gray-900 text-right">
                    {selectedGuarantor.city}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">ADDRESS:</span>
                  <span className="text-gray-900 text-right">
                    {selectedGuarantor.address || "—"}
                  </span>
                </div>
              </div>

              {/* Timestamp and update history section */}
              <div className="text-xs text-gray-500 italic border-t border-dashed border-gray-300 pt-3 mt-3">
                <div className="grid grid-cols-2 gap-2">
                  <span>DATE ADDED:</span>
                  <span className="text-right">
                    {formatDateTime(selectedGuarantor.dateAdded)}
                  </span>
                </div>
                {/* Show update timestamp if available */}
                {selectedGuarantor.updatedAt && (
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <span>LAST UPDATED:</span>
                    <span className="text-right">
                      {formatDateTime(selectedGuarantor.updatedAt)}
                    </span>
                  </div>
                )}
              </div>

              {/* Footer disclaimer */}
              <div className="text-center border-t border-dashed border-gray-300 pt-4 text-xs text-gray-600">
                <p>THIS IS A COMPUTER-GENERATED GUARANTOR RECORD.</p>
                <p>CONTAINS PERSONAL AND CONTACT INFORMATION ONLY.</p>
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
                  <span>PRINT</span>
                </button>

                {/* Close modal button */}
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
                  GUARANTORS REPORT SUMMARY
                </p>
                <div className="mt-3 space-y-1 text-sm">
                  <p className="font-semibold text-gray-700">
                    REPORT GENERATED: {formatDateTime(new Date())}
                  </p>
                  <p className="text-gray-600">
                    Total Guarantors: {filteredGuarantors.length} | Date Range:{" "}
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-900">
                    {stats.total}
                  </div>
                  <div className="text-blue-700 text-sm">TOTAL GUARANTORS</div>
                </div>
                <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-900">
                    {stats.withAddress}
                  </div>
                  <div className="text-green-700 text-sm">WITH ADDRESS</div>
                </div>
                <div className="bg-purple-100 border border-purple-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-900">
                    {stats.recentlyAdded}
                  </div>
                  <div className="text-purple-700 text-sm">RECENTLY ADDED</div>
                </div>
                <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-900">
                    {stats.recentlyUpdated}
                  </div>
                  <div className="text-yellow-700 text-sm">
                    RECENTLY UPDATED
                  </div>
                </div>
              </div>

              {/* City Distribution */}
              {uniqueCities.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-bold text-gray-800 mb-3">
                    CITY DISTRIBUTION
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {uniqueCities.slice(0, 6).map((city) => {
                      const cityCount = filteredGuarantors.filter(
                        (g) => g.city === city
                      ).length;
                      return (
                        <div
                          key={city}
                          className="flex justify-between items-center"
                        >
                          <span className="text-gray-700">{city}</span>
                          <span className="font-semibold text-gray-900">
                            {cityCount}
                          </span>
                        </div>
                      );
                    })}
                    {uniqueCities.length > 6 && (
                      <div className="col-span-2 text-center text-gray-600 italic">
                        ... AND {uniqueCities.length - 6} MORE CITIES
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Footer Information */}
              <div className="text-center border-t border-dashed border-gray-300 pt-4 text-xs text-gray-600">
                <p>THIS IS A COMPUTER-GENERATED GUARANTORS REPORT.</p>
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
