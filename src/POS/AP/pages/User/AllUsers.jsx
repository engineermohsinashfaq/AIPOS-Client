import React, { useEffect, useMemo, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

const sampleUsers = [
  {
    id: "01",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+15551234",
    cnic: "12345-6789012-3",
    address: "123 Main St, New York, NY",
    role: "Admin",
    branch: "Headquarters",
    location: "New York",
    password: "zubi@pakistani",
    status: "Active",
    created: new Date().toISOString(),
  },
  {
    id: "02",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "+15555678",
    cnic: "98765-4321098-7",
    address: "456 Sunset Blvd, Los Angeles, CA",
    role: "Manager",
    branch: "Regional Office",
    location: "Los Angeles",
    password: "zubi@pakistani",
    status: "Inactive",
    created: new Date().toISOString(),
  },
];

export default function AllUsers() {
  const [users, setUsers] = useState(() => {
    try {
      const raw = localStorage.getItem("manage_users_data");
      return raw ? JSON.parse(raw) : sampleUsers;
    } catch (e) {
      return sampleUsers;
    }
  });

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false);
  const [pendingForm, setPendingForm] = useState(null);

  useEffect(() => {
    localStorage.setItem("manage_users_data", JSON.stringify(users));
  }, [users]);

  const filtered = useMemo(() => {
    let arr = users.slice();
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((u) =>
        [u.firstName, u.lastName, u.phone].join(" ").toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "All")
      arr = arr.filter((u) => u.status === statusFilter);
    arr.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    return arr;
  }, [users, query, statusFilter]);

  // ✅ Toast helpers
  function notifySuccess(msg) {
    toast.success(msg);
  }
  function notifyError(msg) {
    toast.error(msg);
  }

  function handleOpenEdit(user) {
    setForm(user);
    setEditing(true);
    setIsModalOpen(true);
  }

  function handleDelete(user) {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  }

  function confirmDelete() {
    if (!userToDelete) return;
    setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    notifySuccess(
      `${userToDelete.firstName} ${userToDelete.lastName} has been deleted.`
    );
    setUserToDelete(null);
    setIsDeleteModalOpen(false);
  }

  function cancelDelete() {
    setUserToDelete(null);
    setIsDeleteModalOpen(false);
  }

  function handleChange(e) {
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
  }

  function initials(u) {
    return `${(u.firstName || "").charAt(0)}${(u.lastName || "").charAt(
      0
    )}`.toUpperCase();
  }

  function formatDate(dateString) {
    if (!dateString) return "—";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  function handleSave(e) {
    e.preventDefault();
    if (!form.firstName.trim()) return notifyError("First name is required");
    if (!form.lastName.trim()) return notifyError("Last name is required");
    if (!form.email.trim()) return notifyError("Email is required");
    if (!/\S+@\S+\.\S+/.test(form.email)) return notifyError("Invalid email");
    if (!/^\+\d+$/.test(form.phone))
      return notifyError("Phone must start with +");
    if (!/^\d{5}-\d{7}-\d{1}$/.test(form.cnic))
      return notifyError("Invalid CNIC");

    setPendingForm({ ...form });
    setIsSaveConfirmOpen(true);
  }

  function handleSaveConfirm() {
    const userData = pendingForm;
    if (!userData) return;

    setUsers((prev) => prev.map((u) => (u.id === userData.id ? userData : u)));
    notifySuccess(
      `${userData.firstName} ${userData.lastName} has been updated.`
    );

    setIsModalOpen(false);
    setIsSaveConfirmOpen(false);
    setPendingForm(null);
  }

  function cancelSaveConfirm() {
    setIsSaveConfirmOpen(false);
    setPendingForm(null);
  }

  return (
    <div className="p-2 min-h-screen text-black">
      {/* ✅ Dark toast, auto close in 2s */}
      <ToastContainer theme="dark" autoClose={2000} />

      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">All Users</h1>
          <p className="text-white/80">View, edit, and remove users.</p>
        </div>

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

          {/* Status Filter */}
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

        {/* Users Table */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-md overflow-x-auto scrollbar-hide">
          <table className="w-full text-white/90 min-w-[900px]">
            <thead className="bg-white/10 text-left text-sm">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">User</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th> 
                <th className="p-3">Branch</th>
                <th className="p-3">Location</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
           <tbody>
  {filtered.length === 0 ? (
    <tr>
      <td
        colSpan="8"
        className="text-center p-5 text-white/70 italic border-t border-white/5"
      >
        No user found
      </td>
    </tr>
  ) : (
    filtered.map((u) => (
      <tr
        key={u.id}
        className="border-t border-white/5 hover:bg-white/5 transition"
      >
        <td className="p-3">{u.id}</td>
        <td className="p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <span className="font-medium text-white">{initials(u)}</span>
          </div>
          <div>
            <div className="font-medium text-white">
              {u.firstName} {u.lastName}
            </div>
          </div>
        </td>
        <td className="p-3">{u.email}</td>
        <td className="p-3">{u.role}</td>
        <td className="p-3">{u.branch || "—"}</td>
        <td className="p-3">{u.location || "—"}</td>
        <td className="p-3">{u.status}</td>
        <td className="p-3 flex gap-2">
          <button
            title="View"
            onClick={() => {
              setSelectedUser(u);
              setIsViewOpen(true);
            }}
            className="p-2 rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors cursor-pointer"
          >
            <VisibilityIcon fontSize="small" />
          </button>
          <button
            title="Edit"
            onClick={() => handleOpenEdit(u)}
            className="p-2 rounded bg-yellow-400 text-gray-900 hover:bg-yellow-300 transition-colors cursor-pointer"
          >
            <EditIcon fontSize="small" />
          </button>
          <button
            title="Delete"
            onClick={() => handleDelete(u)}
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
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md z-50">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-lg text-white">
            <h2 className="text-xl font-semibold mb-4">Edit User</h2>
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
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Contact"
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
                name="address"
                value={form.address || ""}
                onChange={handleChange}
                placeholder="Address"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />
              <input
                name="password"
                type="text"
                value={form.password || ""}
                onChange={handleChange}
                placeholder="Password"
                className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="branch"
                  value={form.branch}
                  onChange={handleChange}
                  placeholder="Branch"
                  className="p-2 rounded bg-black/30 border border-white/20 outline-none"
                />
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Location"
                  className="p-2 rounded bg-black/30 border border-white/20 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="p-2 rounded bg-black/30 text-white border border-white/20"
                >
                  <option className="bg-black/95 text-white">Owner</option>
                  <option className="bg-black/95 text-white">Manager</option>
                  <option className="bg-black/95 text-white">User</option>
                </select>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="p-2 rounded bg-black/30 text-white border border-white/20"
                >
                  <option className="bg-black/95 text-white">Active</option>
                  <option className="bg-black/95 text-white">Inactive</option>
                  <option className="bg-black/95 text-white">Suspended</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-white/40 rounded  bg-red-600 hover:bg-red-700  transition hover:cursor-pointer"
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

      {/* Save Confirmation Modal */}
      {isSaveConfirmOpen && pendingForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-sm text-white">
            <h2 className="text-xl font-semibold mb-4">Confirm Save</h2>
            <p className="mb-4">
              Are you sure you want to update{" "}
              <strong>
                {pendingForm.firstName} {pendingForm.lastName}
              </strong>
              ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelSaveConfirm}
                className="px-4 py-2 border border-white/40 rounded bg-red-600 hover:bg-red-700 hover:cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfirm}
                className="px-4 py-2 border border-white/40 rounded bg-cyan-800/80 hover:bg-cyan-900 hover:cursor-pointer transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}

      {isViewOpen && selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/10 z-50 p-2 backdrop-blur-md print:p-0">
          <div className="bg-white text-black rounded-md shadow-xl w-full max-w-md p-6 relative font-mono text-sm border border-white/30">
            {/* Close Button */}
            <button
              onClick={() => setIsViewOpen(false)}
              className="absolute top-2 right-2 text-black transition p-1 cursor-pointer rounded-full print:hidden"
            >
              ✕
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
                <span>User ID:</span>
                <span>{selectedUser.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Name:</span>
                <span>
                  {selectedUser.firstName} {selectedUser.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <span>{selectedUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span>Phone:</span>
                <span>{selectedUser.phone}</span>
              </div>
              <div className="flex justify-between">
                <span>CNIC:</span>
                <span>{selectedUser.cnic}</span>
              </div>
              <div className="flex justify-between">
                <span>Branch:</span>
                <span>{selectedUser.branch}</span>
              </div>
              <div className="flex justify-between">
                <span>Location:</span>
                <span>{selectedUser.location}</span>
              </div>
              <div className="flex justify-between">
                <span>Role:</span>
                <span>{selectedUser.role}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span>{selectedUser.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Password:</span>
                <span className="font-semibold text-yellow-700">
                  {selectedUser.password}
                </span>
              </div>
              <div className="flex justify-between border-t border-dashed border-black mt-2 pt-2">
                <span>Created:</span>
                <span>{formatDate(selectedUser.created)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center border-t border-dashed border-black mt-2 pt-6 text-xs">
              <p>
                Thank you for being part of <strong>ZUBI ELECTRONICS</strong>!
              </p>
              <p>This is a computer-generated receipt.</p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-5 print:hidden">
              <button
                onClick={() => {
                  const originalOverflow = document.body.style.overflow;
                  document.body.style.overflow = "hidden";
                  window.print();
                  document.body.style.overflow = originalOverflow;
                }}
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
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-md bg-black/30 z-50">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-sm text-white">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-4">
              Are you sure you want to delete{" "}
              <strong>
                {userToDelete.firstName} {userToDelete.lastName}
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
