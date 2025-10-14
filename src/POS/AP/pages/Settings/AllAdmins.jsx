import React, { useEffect, useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

  const notifySuccess = (msg) => toast.success(msg, { position: "top-right" });
  const notifyError = (msg) => toast.error(msg, { position: "top-right" });

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
    <div className="p-2 min-h-screen text-black">
      <ToastContainer />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">All Admins</h1>
          <p className="text-white/80">
            View, edit, and manage admin accounts.
          </p>
        </div>

        {/* Search Filter */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-md p-4 flex items-center gap-2 max-w-md">
          <SearchIcon className="text-white" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, CNIC, or contact"
            className="flex-1 outline-none bg-transparent text-white"
          />
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
              {filtered.map((a) => (
                <tr
                  key={a.id}
                  className="border-t border-white/5 hover:bg-white/5 transition"
                >
                  <td className="p-3">{a.id}</td>
                  <td className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="font-medium text-white">
                        {initials(a)}
                      </span>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6 w-full max-w-lg text-white">
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
                  className="px-4 py-2 rounded bg-cyan-800/80 hover:bg-cyan-900 transition hover:cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-cyan-800/80 hover:bg-cyan-900 transition hover:cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern View Modal */}
      {isViewOpen && selectedAdmin && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-2">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-full max-w-lg p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
            <h2 className="text-2xl font-semibold mb-4 text-center">
              👤 Admin Details
            </h2>

            <div className="space-y-3 text-sm sm:text-base">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 sm:gap-x-3">
                <p>
                  <strong>ID:</strong> {selectedAdmin.id}
                </p>
                <p>
                  <strong>Name:</strong> {selectedAdmin.firstName}{" "}
                  {selectedAdmin.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {selectedAdmin.email}
                </p>
                <p>
                  <strong>Contact:</strong> {selectedAdmin.phone}
                </p>
                <p>
                  <strong>CNIC:</strong> {selectedAdmin.cnic}
                </p>
                <p>
                  <strong>Address:</strong> {selectedAdmin.address || "—"}
                </p>
                <p>
                  <strong>Password:</strong>{" "}
                  <span className="bg-black/30 px-2 py-1 rounded text-yellow-300 font-mono">
                    {selectedAdmin.password || "—"}
                  </span>
                </p>
                <p>
                  <strong>Created:</strong> {formatDate(selectedAdmin.created)}
                </p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsViewOpen(false)}
                className="px-5 py-2 rounded bg-cyan-800/80 hover:bg-cyan-900 transition hover:cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && adminToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6 w-full max-w-sm text-white">
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
                className="px-4 py-2 rounded bg-cyan-800/80 hover:bg-cyan-900 hover:cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 hover:cursor-pointer transition"
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
