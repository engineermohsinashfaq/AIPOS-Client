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

  function notifySuccess(msg) {
    toast.success(msg, { position: "top-right" });
  }
  function notifyError(msg) {
    toast.error(msg, { position: "top-right" });
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
      <ToastContainer />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">All Users</h1>
          <p className="text-white/80">View, edit, and remove users.</p>
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-md p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2">
            <SearchIcon className="text-white" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="flex-1 outline-none bg-transparent text-white"
            />
          </div>
          <div className="flex items-center gap-2">
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
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-md overflow-x-auto">
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
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-t border-white/5 hover:bg-white/5 transition"
                >
                  <td className="p-3">{u.id}</td>
                  <td className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="font-medium text-white">
                        {initials(u)}
                      </span>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6 w-full max-w-lg text-white">
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

      {/* Save Confirmation Modal */}
      {isSaveConfirmOpen && pendingForm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6 w-full max-w-sm text-white">
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
                className="px-4 py-2 rounded bg-cyan-800/80 hover:bg-cyan-900 hover:cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveConfirm}
                className="px-4 py-2 rounded bg-cyan-800/80 hover:bg-cyan-900 hover:cursor-pointer transition"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
     {/* View Modal */}
{/* View Modal */}
{isViewOpen && selectedUser && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-2 sm:p-0">
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-4 sm:p-6 w-full max-w-lg text-white max-h-[90vh] overflow-y-auto mx-2">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">
        👤 User Details
      </h2>

      {/* Personal Information Section */}
      <div className="space-y-3">
        <h3 className="text-base sm:text-lg font-medium border-b border-white/10 pb-1">
          Personal Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 sm:gap-x-3">
          <p><strong>ID:</strong> {selectedUser.id}</p>
          <p><strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}</p>
          <p><strong>Phone:</strong> {selectedUser.phone}</p>
          <p><strong>CNIC:</strong> {selectedUser.cnic}</p>
          <p className="sm:col-span-2"><strong>Address:</strong> {selectedUser.address || "—"}</p>
          <p><strong>Role:</strong> {selectedUser.role}</p>
          <p><strong>Branch:</strong> {selectedUser.branch}</p>
          <p><strong>Location:</strong> {selectedUser.location}</p>
          <p><strong>Status:</strong> {selectedUser.status}</p>
          <p><strong>Created:</strong> {formatDate(selectedUser.created)}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-white/20"></div>

      {/* Login Credentials Section */}
      <div className="space-y-3">
        <h3 className="text-base sm:text-lg font-medium border-b border-white/10 pb-1">
          Login Credentials
        </h3>

        <div className="bg-black/10 border border-white/20 rounded p-3 sm:p-4">
          <p className="mb-2 break-all">
            <strong>CNIC:</strong>{" "}
            <span className="bg-black/30 text-yellow-300 px-2 py-1 rounded ">{selectedUser.cnic}</span>
          </p>
          <p className="break-all">
            <strong>Password:</strong>{" "}
            <span className="bg-black/30 px-2 py-1 rounded text-yellow-300 font-mono select-all">
              {selectedUser.password || "—"}
            </span>
          </p>
        </div>
      </div>

      {/* Footer Button */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          onClick={() => setIsViewOpen(false)}
          className="px-4 py-2 rounded bg-cyan-800/80 hover:bg-cyan-900 transition hover:cursor-pointer w-full sm:w-auto"
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}




      {/* Delete Modal */}
      {isDeleteModalOpen && userToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6 w-full max-w-sm text-white">
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
