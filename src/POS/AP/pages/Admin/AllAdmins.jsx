import React, { useEffect, useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X } from "lucide-react";

import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

export default function AllAdmins() {
  const [admins, setAdmins] = useState(() => {
    try {
      const raw = localStorage.getItem("manage_admins_data");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [form, setForm] = useState({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);

  useEffect(() => {
    localStorage.setItem("manage_admins_data", JSON.stringify(admins));
  }, [admins]);

  const filtered = useMemo(() => {
    let arr = admins.slice();
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((a) =>
        [a.firstName, a.lastName, a.cnic, a.phone]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }
    arr.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    return arr;
  }, [admins, query]);

  // ✅ Toast settings for consistent dark theme and timing
  const toastConfig = {
    position: "top-right",
    theme: "dark",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  };

  const notifySuccess = (msg) => toast.success(msg, toastConfig);
  const notifyError = (msg) => toast.error(msg, toastConfig);

  const initials = (a) =>
    `${(a.firstName || "").charAt(0)}${(a.lastName || "").charAt(
      0
    )}`.toUpperCase();

  const handleOpenEdit = (admin) => {
    setForm(admin);
    setEditing(true);
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      let val = value.replace(/[^\d+]/g, "");
      if (val && val[0] !== "+") val = "+" + val.replace(/\+/g, "");
      setForm((s) => ({ ...s, phone: val }));
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
    if (!form.firstName.trim()) return notifyError("First name is required");
    if (!form.lastName.trim()) return notifyError("Last name is required");
    if (!form.email.trim()) return notifyError("Email is required");
    if (!form.phone.trim()) return notifyError("Contact number is required");
    if (!form.cnic.trim()) return notifyError("CNIC is required");
    if (!/^\d{5}-\d{7}-\d{1}$/.test(form.cnic))
      return notifyError("Invalid CNIC format (e.g., 12345-6789012-3)");

    setAdmins((prev) => prev.map((a) => (a.id === form.id ? form : a)));
    setIsModalOpen(false);
    notifySuccess(`${form.firstName} ${form.lastName} updated successfully.`);
  };

  const handleDelete = (admin) => {
    setAdminToDelete(admin);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!adminToDelete) return;
    setAdmins((prev) => prev.filter((a) => a.id !== adminToDelete.id));
    notifySuccess(
      `Admin ${adminToDelete.firstName} ${adminToDelete.lastName} deleted.`
    );
    setIsDeleteModalOpen(false);
    setAdminToDelete(null);
  };

  const cancelDelete = () => {
    setAdminToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return `${date.getDate().toString().padStart(2, "0")}-${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${date.getFullYear()}`;
  };

  return (
    <div className="p-2 min-h-screen text-white">
      {/* ✅ Toast container with dark theme */}
      <ToastContainer
        position="top-right"
        theme="dark"
        autoClose={2000}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
      />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">All Admins</h1>
          <p className="text-white/80">
            View, edit, and manage admin accounts.
          </p>
        </div>

        {/* Search & Filters */}
        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-md p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 md:col-span-2">
            <SearchIcon className="text-white" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="flex-1 outline-none bg-transparent text-white placeholder-white/60"
            />
          </div>

        </div>
        {/* Admins Table */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-md overflow-x-auto">
  <table className="w-full text-white/90 min-w-[800px]">
    <thead className="bg-white/10 text-left text-sm">
      <tr>
        <th className="p-3">ID</th>
        <th className="p-3">Name</th>
        <th className="p-3">CNIC</th>
        <th className="p-3">Contact</th>
        <th className="p-3">Actions</th>
      </tr>
    </thead>

    <tbody>
      {filtered.length === 0 ? (
        <tr>
          <td
            colSpan="5"
            className="text-center p-5 text-white/70 italic border-t border-white/5"
          >
            No admin found
          </td>
        </tr>
      ) : (
        filtered.map((a) => (
          <tr
            key={a.id}
            className="border-t border-white/5 hover:bg-white/5 transition"
          >
            <td className="p-3">{a.id}</td>
            <td className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <span className="font-medium text-white">{initials(a)}</span>
              </div>
              <div>
                <div className="font-medium text-white">
                  {a.firstName} {a.lastName}
                </div>
              </div>
            </td>
            <td className="p-3">{a.cnic}</td>
            <td className="p-3">{a.phone}</td>
            <td className="p-3 flex gap-2">
              <button
                title="View"
                onClick={() => {
                  setSelectedAdmin(a);
                  setIsViewOpen(true);
                }}
                className="p-2 rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors cursor-pointer"
              >
                <VisibilityIcon fontSize="small" />
              </button>
              <button
                title="Edit"
                onClick={() => handleOpenEdit(a)}
                className="p-2 rounded bg-yellow-400 text-gray-900 hover:bg-yellow-300 transition-colors cursor-pointer"
              >
                <EditIcon fontSize="small" />
              </button>
              <button
                title="Delete"
                onClick={() => handleDelete(a)}
                className="p-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
              >
                <DeleteIcon fontSize="small" />
              </button>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>

      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 backdrop-blur-md">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-lg text-white">
            <h2 className="text-xl font-semibold mb-4">Edit Admin</h2>
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
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Contact (+92...)"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />
              <input
                name="cnic"
                value={form.cnic}
                onChange={handleChange}
                placeholder="CNIC (12345-6789012-3)"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />
              <input
                name="address"
                value={form.address || ""}
                onChange={handleChange}
                placeholder="Address"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />
              <input
                name="password"
                value={form.password || ""}
                onChange={handleChange}
                placeholder="Password"
                type="text"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-white/40 rounded bg-red-600 hover:bg-red-700 transition hover:cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-white/40 rounded bg-cyan-800/80 hover:bg-cyan-900 transition hover:cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ View Modal - Receipt Style */}
      {isViewOpen && selectedAdmin && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/10 z-50 p-2 backdrop-blur-md print:p-0">
          <div className="bg-white text-black rounded-md shadow-xl w-full max-w-md p-6 relative font-mono text-sm border border-white/30">
            <button
              onClick={() => setIsViewOpen(false)}
              className="absolute top-2 right-2 text-black transition p-1 cursor-pointer rounded-full print:hidden"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="text-center border-b border-dashed border-black pb-3 mb-3">
              <h2 className="text-xl font-bold tracking-wider">
                ZUBI ELECTRONICS
              </h2>
              <p className="text-xs mt-1">
                Contact: +92 300 1234567 | Email: info@zubielectronics.com
              </p>
              <p className="text-xs">123 Market Road, Lahore, Pakistan</p>
            </div>

            {/* Body */}
            <div className="space-y-2 leading-6">
              <div className="flex justify-between">
                <span>Admin ID:</span>
                <span>{selectedAdmin.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Name:</span>
                <span>
                  {selectedAdmin.firstName} {selectedAdmin.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <span>{selectedAdmin.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Contact:</span>
                <span>{selectedAdmin.phone}</span>
              </div>
              <div className="flex justify-between">
                <span>CNIC:</span>
                <span>{selectedAdmin.cnic}</span>
              </div>
              <div className="flex justify-between">
                <span>Address:</span>
                <span>{selectedAdmin.address || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Password:</span>
                <span className="bg-black/5 px-2 py-1 rounded text-blue-700 font-mono">
                  {selectedAdmin.password || "—"}
                </span>
              </div>
              <div className="flex justify-between border-t border-dashed border-black/90 mt-2 pt-2">
                <span>Date Created:</span>
                <span>{formatDate(selectedAdmin.created)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center border-t border-dashed border-black/90 mt-2 pt-6 text-xs">
              <p>
                Thank you for being part of <strong>ZUBI ELECTRONICS</strong>!
              </p>
              <p>This is a computer-generated receipt.</p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-5 print:hidden">
              <button
                onClick={() => window.print()}
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

      {/* Delete Modal */}
      {isDeleteModalOpen && adminToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 backdrop-blur-md">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-sm text-white">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-4">
              Are you sure you want to delete{" "}
              <strong>
                {adminToDelete.firstName} {adminToDelete.lastName}
              </strong>
              ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-white/40 rounded bg-cyan-800/80 hover:bg-cyan-900 hover:cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 border border-white/40 rounded bg-red-600 hover:bg-red-700 hover:cursor-pointer transition"
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
