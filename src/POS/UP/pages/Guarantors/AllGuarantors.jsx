import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X } from "lucide-react";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";



const formatDate = (dateString) => {
  if (!dateString) return "—";

  // Convert to local date safely (handles ISO or locale strings)
  const date = new Date(dateString);
  if (isNaN(date)) return "Invalid Date";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
};

export default function AllGuarantors() {
  const [guarantors, setGuarantors] = useState(() => {
  try {
    const raw = localStorage.getItem("all_guarantors_data");
    return raw ? JSON.parse(raw) : []; // ✅ Return empty array if nothing found
  } catch {
    return []; // ✅ Safe fallback
  }
});


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedGuarantor, setSelectedGuarantor] = useState(null);
  const [guarantorToDelete, setGuarantorToDelete] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => {
    localStorage.setItem("all_guarantors_data", JSON.stringify(guarantors));
  }, [guarantors]);

  const toastConfig = {
    position: "top-right",
    theme: "dark",
    autoClose: 2000,
  };
  const notifySuccess = (msg) => toast.success(msg, toastConfig);
  const notifyError = (msg) => toast.error(msg, toastConfig);

  const initials = (g) =>
    `${(g.firstName || "").charAt(0)}${(g.lastName || "").charAt(
      0
    )}`.toUpperCase();

  const handleOpenEdit = (guarantor) => {
    setForm(guarantor);
    setEditing(true);
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "contact") {
      let val = value.replace(/[^\d+]/g, "");
      if (val && val[0] !== "+") val = "+" + val.replace(/\+/g, "");
      setForm((s) => ({ ...s, contact: val }));
      return;
    }

    if (name === "cnic") {
      let digits = value.replace(/\D/g, "").slice(0, 13);
      let formatted = digits;
      if (digits.length > 5 && digits.length <= 12)
        formatted = `${digits.slice(0, 5)}-${digits.slice(5)}`;
      if (digits.length === 13)
        formatted = `${digits.slice(0, 5)}-${digits.slice(
          5,
          12
        )}-${digits.slice(12)}`;
      setForm((s) => ({ ...s, cnic: formatted }));
      return;
    }

    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!form.firstName?.trim()) return notifyError("First name is required");
    if (!form.lastName?.trim()) return notifyError("Last name is required");
    if (!form.contact?.trim()) return notifyError("Contact number is required");
    if (!form.cnic?.trim()) return notifyError("CNIC is required");
    if (!/^\d{5}-\d{7}-\d{1}$/.test(form.cnic))
      return notifyError("Invalid CNIC format (e.g., 12345-6789012-3)");

    // 🧠 Detect if any field actually changed (using .trim() for text fields)
    const current = guarantors.find((g) => g.guarantorId === form.guarantorId);

    // Check if the current data and the new data (form) are different
    const hasChanged = Object.keys(form).some((key) => {
      const formValue = String(form[key] || "");
      const currentValue = String(current[key] || "");

      // Only compare the actual content for string fields by using .trim()
      if (
        key !== "guarantorId" && // Don't trim/compare ID this way
        key !== "dateAdded" && // Don't trim/compare date strings this way
        typeof current[key] === "string" &&
        typeof form[key] === "string"
      ) {
        // Compare trimmed values for fields like name, contact, city, address, cnic
        return formValue.trim() !== currentValue.trim();
      }

      // For other keys (like ID, date strings), compare directly
      // Note: address can be null/undefined on the initial guarantor, so we use String(g.address || "") above
      return formValue !== currentValue;
    });

    if (!hasChanged) {
      // Close modal silently (no toast)
      setIsModalOpen(false);
      return;
    }

    // ✅ Store the current precise time as ISO string for lastUpdated
    setGuarantors((prev) =>
      prev.map((g) =>
        g.guarantorId === form.guarantorId
          ? {
              ...form,
              // Ensure all string fields are saved trimmed of extra space
              firstName: form.firstName.trim(),
              lastName: form.lastName.trim(),
              contact: form.contact.trim(),
              cnic: form.cnic.trim(),
              city: form.city.trim(),
              address: form.address ? form.address.trim() : "",
              lastUpdated: new Date().toISOString(),
            }
          : g
      )
    );

    setIsModalOpen(false);
    notifySuccess(`${form.firstName} ${form.lastName} updated successfully.`);
  };

  const handleDelete = (guarantor) => {
    setGuarantorToDelete(guarantor);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!guarantorToDelete) return;
    setGuarantors((prev) =>
      prev.filter((g) => g.guarantorId !== guarantorToDelete.guarantorId)
    );
    notifySuccess(
      `Guarantor ${guarantorToDelete.firstName} ${guarantorToDelete.lastName} deleted.`
    );
    setIsDeleteModalOpen(false);
    setGuarantorToDelete(null);
  };

  const cancelDelete = () => {
    setGuarantorToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handlePrint = () => {
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.print();
    document.body.style.overflow = bodyOverflow;
  };

  // ✅ Filter guarantors based on search
  const filteredGuarantors = guarantors.filter((g) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;

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

  return (
    <div className="p-2 min-h-screen text-white">
      <ToastContainer position="top-right" theme="dark" autoClose={2000} />
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">All Guarantors</h1>
          <p className="text-white/80">
            View, edit, and manage guarantor accounts.
          </p>
        </div>

        {/* 🔍 Search Filter */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-md p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 md:col-span-2">
            <SearchIcon className="text-white" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ID, name, CNIC, or city..."
              className="flex-1 outline-none bg-transparent text-white placeholder-white/60"
            />
          </div>
        </div>

        {/* ✅ Filtered Table */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-md overflow-x-auto">
          <table className="w-full text-white/90 min-w-[900px]">
            <thead className="bg-white/10 text-left text-sm">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Contact</th>
                <th className="p-3">CNIC</th>
                <th className="p-3">City</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuarantors.length > 0 ? (
                filteredGuarantors.map((g) => (
                  <tr
                    key={g.guarantorId}
                    className="border-t border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="p-3">{g.guarantorId}</td>
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
                    <td className="p-3">{g.contact}</td>
                    <td className="p-3">{g.cnic}</td>
                    <td className="p-3">{g.city}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        title="View"
                        onClick={() => {
                          setSelectedGuarantor(g);
                          setIsViewOpen(true);
                        }}
                        className="p-2 rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors cursor-pointer"
                      >
                        <VisibilityIcon fontSize="small" />
                      </button>
                      <button
                        title="Edit"
                        onClick={() => handleOpenEdit(g)}
                        className="p-2 rounded bg-yellow-400 text-gray-900 hover:bg-yellow-300 transition-colors cursor-pointer"
                      >
                        <EditIcon fontSize="small" />
                      </button>
                      <button
                        title="Delete"
                        onClick={() => handleDelete(g)}
                        className="p-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-white/60">
                    No guarantors found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✏️ Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 backdrop-blur-md">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-lg text-white">
            <h2 className="text-xl font-semibold mb-4">
               Edit Guarantor: {form.guarantorId}
            </h2>
            <form onSubmit={handleSave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  className="p-2 rounded bg-black/30 border border-white/20 outline-none"
                />
                <input
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className="p-2 rounded bg-black/30 border border-white/20 outline-none"
                />
              </div>
              <input
                name="contact"
                value={form.contact}
                onChange={handleChange}
                placeholder="Contact (+92...)"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />
              <input
                name="cnic"
                value={form.cnic}
                onChange={handleChange}
                placeholder="CNIC"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />
              <input
                name="address"
                value={form.address || ""}
                onChange={handleChange}
                placeholder="Address"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="submit"
                  className="px-4 py-2 rounded border border-white/40 bg-cyan-800/80 hover:bg-cyan-900 transition hover:cursor-pointer"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded border border-white/40 bg-red-600 hover:bg-red-700 transition hover:cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 👁️ View Modal */}
      {isViewOpen && selectedGuarantor && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/10 z-50 p-2 backdrop-blur-md print:p-0">
          <div className="bg-white text-black rounded-md shadow-xl w-full max-w-md p-6 relative font-mono text-sm border border-white/30">
            <button
              onClick={() => setIsViewOpen(false)}
              className="absolute top-2 right-2 text-black transition p-1 cursor-pointer rounded-full print:hidden"
            >
              <X size={18} />
            </button>

            <div className="text-center border-b border-dashed border-black pb-3 mb-3">
              <h2 className="text-xl font-bold tracking-wider">
                ZUBI ELECTRONICS
              </h2>
              <p className="text-xs mt-1">
                Contact: +92 300 1234567 | Email: info@zubielectronics.com
              </p>
              <p className="text-xs">123 Market Road, Lahore, Pakistan</p>
            </div>

            <div className="space-y-2 leading-6">
              <div className="flex justify-between">
                <span>G-ID:</span>
                <span>{selectedGuarantor.guarantorId}</span>
              </div>
              <div className="flex justify-between">
                <span>Name:</span>
                <span>
                  {selectedGuarantor.firstName} {selectedGuarantor.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Contact:</span>
                <span>{selectedGuarantor.contact}</span>
              </div>
              <div className="flex justify-between">
                <span>CNIC:</span>
                <span>{selectedGuarantor.cnic}</span>
              </div>
              <div className="flex justify-between">
                <span>City:</span>
                <span>{selectedGuarantor.city}</span>
              </div>
              <div className="flex justify-between">
                <span>Address:</span>
                <span>{selectedGuarantor.address || "—"}</span>
              </div>

              <div className="flex justify-between border-t border-dashed border-black/90 mt-2 pt-2">
                <span>Date Added:</span>
                {/* Use formatDate to display human-readable date and time (00:00:00) */}
                <span>{formatDate(selectedGuarantor.dateAdded)}</span>
              </div>

              {selectedGuarantor.lastUpdated && (
                <div className="flex justify-between text-xs text-black/70 italic">
                  <span>Last Updated:</span>
                  {/* Use formatDate to display human-readable current time */}
                  <span>{formatDate(selectedGuarantor.lastUpdated)}</span>
                </div>
              )}
            </div>

            <div className="text-center border-t border-dashed border-black/90 mt-2 pt-6 text-xs">
              <p>
                Thank you for choosing <strong>ZUBI ELECTRONICS</strong>!
              </p>
              <p>This is a computer-generated receipt.</p>
            </div>

            <div className="flex justify-end gap-3 pt-5 print:hidden">
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded bg-blue-700 cursor-pointer text-white hover:bg-blue-600 transition"
              >
                🖨️ Print
              </button>
              <button
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 rounded cursor-pointer bg-red-600 text-white hover:bg-red-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ❌ Delete Modal */}
      {isDeleteModalOpen && guarantorToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 backdrop-blur-md">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-sm text-white">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-4">
              Are you sure you want to delete{" "}
              <strong>
                {guarantorToDelete.firstName} {guarantorToDelete.lastName}
              </strong>
              ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 rounded border border-white/40 bg-cyan-900/50 hover:bg-cyan-900 transition hover:cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded border border-white/40 bg-red-700 hover:bg-red-800 transition hover:cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
