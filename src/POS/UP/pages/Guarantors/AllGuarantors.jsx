// |===============================| AllGuarantors Component |===============================|
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

// Main AllGuarantors component function
export default function AllGuarantors() {
  // State management for guarantors data with localStorage initialization and date fixing
  const [guarantors, setGuarantors] = useState(() => {
    try {
      const raw = localStorage.getItem("all_guarantors_data");
      const data = raw ? JSON.parse(raw) : [];
      
      // Fix date format for existing guarantors with incomplete dates
      const fixedData = data.map(guarantor => {
        if (guarantor.dateAdded && !guarantor.dateAdded.includes(':')) {
          return {
            ...guarantor,
            dateAdded: formatDateTime(new Date())
          };
        }
        return guarantor;
      });
      
      // Update localStorage if dates were fixed
      if (data.length > 0 && fixedData.some((g, i) => g.dateAdded !== data[i].dateAdded)) {
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
  
  // State for edit mode
  const [editing, setEditing] = useState(false);
  
  // State for search query
  const [query, setQuery] = useState("");
  
  // State for selected guarantor details
  const [selectedGuarantor, setSelectedGuarantor] = useState(null);
  
  // State for form data
  const [form, setForm] = useState({});
  
  // State for tracking original guarantor data before edits
  const [originalGuarantor, setOriginalGuarantor] = useState(null);
  
  // State for tracking form changes
  const [formChanges, setFormChanges] = useState({});

  // Effect hook to persist guarantors data to localStorage
  useEffect(() => {
    localStorage.setItem("all_guarantors_data", JSON.stringify(guarantors));
  }, [guarantors]);

  // Memoized form modification checker - tracks changes between original and current form
  const isFormModified = useMemo(() => {
    if (!originalGuarantor || !form) return false;

    // Fields to compare for changes
    const fieldsToCompare = [
      "contact",
      "city",
      "address",
    ];

    const changes = {};
    let hasChanges = false;

    // Compare each field for changes
    fieldsToCompare.forEach((field) => {
      const originalValue = String(originalGuarantor[field] || "").trim();
      const formValue = String(form[field] || "").trim();
      if (originalValue !== formValue) {
        changes[field] = {
          from: originalValue,
          to: formValue
        };
        hasChanges = true;
      }
    });

    setFormChanges(changes);
    return hasChanges;
  }, [form, originalGuarantor]);

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

    // Default handling for other fields
    setForm((s) => ({ ...s, [name]: value }));
  };

  // Save form changes handler
  const handleSave = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!form.contact?.trim()) return notifyError("CONTACT NUMBER IS REQUIRED");

    // Generate update message based on changed fields
    const changedFields = Object.keys(formChanges);
    const updateMessage = changedFields.length > 0 
      ? `UPDATED: ${changedFields.map(field => getFieldDisplayName(field)).join(', ')}`
      : "RECORD UPDATED";

    // Update guarantors state with modified data
    setGuarantors((prev) =>
      prev.map((g) =>
        g.guarantorId === form.guarantorId
          ? {
              ...form,
              contact: form.contact.trim(),
              city: form.city.trim(),
              address: form.address ? form.address.trim() : "",
              updatedAt: formatDateTime(new Date()),
              lastUpdateMessage: updateMessage,
            }
          : g
      )
    );

    // Close modal and reset states
    setIsModalOpen(false);
    setOriginalGuarantor(null);
    setFormChanges({});
    notifySuccess(`GUARANTOR UPDATED SUCCESSFULLY!`);
  };

  // Close modal handler
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setOriginalGuarantor(null);
    setFormChanges({});
  };

  // Print functionality handler
  const handlePrint = () => {
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.print();
    document.body.style.overflow = bodyOverflow;
  };

  // Memoized filtered guarantors based on search query
  const filteredGuarantors = useMemo(() => {
    let arr = guarantors.filter((g) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;

      // Search across multiple guarantor fields
      const combined = [
        g.guarantorId,
        g.firstName,
        g.lastName,
        g.contact,
        g.cnic,
        g.city,
        g.address,
      ]
        .map((v) => String(v || "").toLowerCase())
        .join(" ");

      return combined.includes(q);
    });
    
    // Sort by date added (newest first)
    return arr.sort((a, b) => {
      const dateA = new Date(a.dateAdded);
      const dateB = new Date(b.dateAdded);
      return dateB - dateA;
    });
  }, [guarantors, query]);

  // Effect hook to fix existing guarantor dates on component mount
  useEffect(() => {
    const fixExistingGuarantorDates = () => {
      const raw = localStorage.getItem("all_guarantors_data");
      if (!raw) return;

      try {
        const data = JSON.parse(raw);
        let needsFix = false;
        
        // Fix dates that are missing time component
        const fixedData = data.map(guarantor => {
          if (guarantor.dateAdded && 
              (guarantor.dateAdded.length <= 10 ||
               !guarantor.dateAdded.includes(':'))) {
            
            const originalDate = new Date(guarantor.dateAdded);
            if (!isNaN(originalDate.getTime())) {
              needsFix = true;
              return {
                ...guarantor,
                dateAdded: formatDateTime(originalDate)
              };
            }
          }
          return guarantor;
        });

        // Update localStorage and state if fixes were applied
        if (needsFix) {
          localStorage.setItem("all_guarantors_data", JSON.stringify(fixedData));
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
          <h1 className="text-3xl font-bold mb-2">ALL GUARANTORS</h1>
          <p className="text-white/80">
            VIEW, EDIT, AND MANAGE GUARANTOR ACCOUNTS.
          </p>
        </div>

        {/* Search and statistics panel */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-md p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search input with icon */}
          <div className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 md:col-span-2">
            <SearchIcon className="text-white" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH"
              className="flex-1 outline-none bg-transparent text-white placeholder-white/60"
            />
          </div>
          
          {/* Record count display */}
          <div className="text-white/80 text-lg flex items-center">
            TOTAL RECORDS: {filteredGuarantors.length}
          </div>
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
                    <td className="p-3">{g.guarantorId.toUpperCase()}</td>
                    
                    {/* Guarantor name with avatar */}
                    <td className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <span className="font-medium text-white">
                          {initials(g)}
                        </span>
                      </div>
                      <div>
                        {g.firstName.toUpperCase()} {g.lastName.toUpperCase()}
                      </div>
                    </td>
                    
                    {/* Contact column */}
                    <td className="p-3">{g.contact.toUpperCase()}</td>
                    
                    {/* CNIC column */}
                    <td className="p-3">{g.cnic.toUpperCase()}</td>
                    
                    {/* City column */}
                    <td className="p-3">{g.city.toUpperCase()}</td>
                    
                    {/* Date added column with short format */}
                    <td className="p-3 text-sm">{formatShortDate(g.dateAdded)}</td>
                    
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
                      : "NO GUARANTORS MATCH YOUR SEARCH."}
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
                  <strong>GUARANTOR ID:</strong> {form.guarantorId.toUpperCase()}
                </p>
                <p>
                  <strong>DATE ADDED:</strong> {formatDateTime(form.dateAdded)}
                </p>
                
                {/* Changes detection display */}
                {isFormModified && (
                  <div className="mt-3 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded">
                    <p className="font-medium text-yellow-300">CHANGES DETECTED:</p>
                    <ul className="text-xs mt-1 space-y-1">
                      {Object.entries(formChanges).map(([field, change]) => (
                        <li key={field} className="flex justify-between">
                          <span>{getFieldDisplayName(field)}:</span>
                          <span className="text-yellow-200">
                            "{change.from.toUpperCase()}" → "{change.to.toUpperCase()}"
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Edit form */}
            <form onSubmit={handleSave} className="space-y-3">
              {/* Read-only name fields */}
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="firstName"
                  value={form.firstName.toUpperCase()}
                  readOnly
                  placeholder="FIRST NAME"
                  className="p-2 rounded bg-black/30 border border-white/20 outline-none cursor-not-allowed opacity-70"
                />
                <input
                  name="lastName"
                  value={form.lastName.toUpperCase()}
                  readOnly
                  placeholder="LAST NAME"
                  className="p-2 rounded bg-black/30 border border-white/20 outline-none cursor-not-allowed opacity-70"
                />
              </div>
              
              {/* Read-only guarantor ID */}
              <input
                name="guarantorId"
                value={form.guarantorId.toUpperCase()}
                readOnly
                placeholder="GUARANTOR ID"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none cursor-not-allowed opacity-70"
              />
              
              {/* Read-only CNIC */}
              <input
                name="cnic"
                value={form.cnic.toUpperCase()}
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
                value={form.city.toUpperCase()}
                onChange={handleChange}
                placeholder="CITY"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />
              
              {/* Editable address field */}
              <input
                name="address"
                value={form.address.toUpperCase() || ""}
                onChange={handleChange}
                placeholder="ADDRESS"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />

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
                    GUARANTOR ID: {selectedGuarantor.guarantorId.toUpperCase()}
                  </p>
                </div>
              </div>

              {/* Guarantor details section */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">FIRST NAME:</span>
                  <span className="text-gray-900 text-right">
                    {selectedGuarantor.firstName.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">LAST NAME:</span>
                  <span className="text-gray-900 text-right">
                    {selectedGuarantor.lastName.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">CONTACT:</span>
                  <span className="text-gray-900 text-right">
                    {selectedGuarantor.contact.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">CNIC:</span>
                  <span className="text-gray-900 text-right">
                    {selectedGuarantor.cnic.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">CITY:</span>
                  <span className="text-gray-900 text-right">
                    {selectedGuarantor.city.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">ADDRESS:</span>
                  <span className="text-gray-900 text-right">
                    {selectedGuarantor.address.toUpperCase() || "—"}
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
                {/* Show update message if available */}
                {selectedGuarantor.lastUpdateMessage && (
                  <div className="col-span-2 mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800">
                    <span className="font-medium">UPDATE NOTE: </span>
                    {selectedGuarantor.lastUpdateMessage.toUpperCase()}
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
    </div>
  );
}