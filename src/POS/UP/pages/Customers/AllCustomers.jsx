import React, { useState, useMemo, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X } from "lucide-react";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

const sampleCustomers = [
  {
    customerId: "C-001",
    firstName: "Alice",
    lastName: "Johnson",
    contact: "+923001234567",
    cnic: "12345-1234567-1",
    city: "New York",
    address: "123 Main St",
    status: "Active",
    dateAdded: new Date().toISOString(),
  },
  {
    customerId: "C-002",
    firstName: "Bob",
    lastName: "Smith",
    contact: "+923009876543",
    cnic: "54321-7654321-0",
    city: "Los Angeles",
    address: "456 Market St",
    status: "Inactive",
    dateAdded: new Date().toISOString(),
  },
];

const formatDate = (dateString) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${date.getFullYear()}`;
};

export default function AllCustomers() {
  const [customers, setCustomers] = useState(() => {
    try {
      const raw = localStorage.getItem("all_customers_data");
      return raw ? JSON.parse(raw) : sampleCustomers;
    } catch {
      return sampleCustomers;
    }
  });

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [form, setForm] = useState({});

  useEffect(() => {
    localStorage.setItem("all_customers_data", JSON.stringify(customers));
  }, [customers]);

  const filtered = useMemo(() => {
    let arr = customers.slice();
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((c) =>
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
    if (statusFilter !== "All")
      arr = arr.filter((c) => c.status === statusFilter);
    arr.sort((a, b) => a.customerId.localeCompare(b.customerId));
    return arr;
  }, [customers, query, statusFilter]);

  // ✅ Toast setup
  const toastConfig = {
    position: "top-right",
    theme: "dark",
    autoClose: 2000,
  };
  const notifySuccess = (msg) => toast.success(msg, toastConfig);
  const notifyError = (msg) => toast.error(msg, toastConfig);

  const initials = (c) =>
    `${(c.firstName || "").charAt(0)}${(c.lastName || "").charAt(
      0
    )}`.toUpperCase();

  const handleOpenEdit = (customer) => {
    setForm(customer);
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

    setCustomers((prev) =>
      prev.map((c) => (c.customerId === form.customerId ? form : c))
    );
    setIsModalOpen(false);
    notifySuccess(`${form.firstName} ${form.lastName} updated successfully.`);
  };

  const handleDelete = (customer) => {
    setCustomerToDelete(customer);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!customerToDelete) return;
    setCustomers((prev) =>
      prev.filter((c) => c.customerId !== customerToDelete.customerId)
    );
    notifySuccess(
      `Customer ${customerToDelete.firstName} ${customerToDelete.lastName} deleted.`
    );
    setIsDeleteModalOpen(false);
    setCustomerToDelete(null);
  };

  const cancelDelete = () => {
    setCustomerToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handlePrint = () => {
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.print();
    document.body.style.overflow = bodyOverflow;
  };

  return (
    <div className="p-2 min-h-screen text-white">
      <ToastContainer position="top-right" theme="dark" autoClose={2000} />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">All Customers</h1>
          <p className="text-white/80">
            View, edit, and manage customer accounts.
          </p>
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
        {/* Table */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-md overflow-x-auto">
          <table className="w-full text-white/90 min-w-[900px]">
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
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.customerId}
                  className="border-t border-white/5 hover:bg-white/5 transition"
                >
                  <td className="p-3">{c.customerId}</td>
                  <td className="p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
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
                  <td className="p-3">{c.cnic}</td>
                  <td className="p-3">{c.contact}</td>
                  <td className="p-3">{c.city}</td>
                  <td className="p-3">{c.status}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      title="View"
                      onClick={() => {
                        setSelectedCustomer(c);
                        setIsViewOpen(true);
                      }}
                      className="p-2 rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors cursor-pointer"
                    >
                      <VisibilityIcon fontSize="small" />
                    </button>
                    <button
                      title="Edit"
                      onClick={() => handleOpenEdit(c)}
                      className="p-2 rounded bg-yellow-400 text-gray-900 hover:bg-yellow-300 transition-colors cursor-pointer"
                    >
                      <EditIcon fontSize="small" />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => handleDelete(c)}
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

      {/* ✅ Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 backdrop-blur-md">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-lg text-white">
            <h2 className="text-xl font-semibold mb-4">Edit Customer</h2>
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

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded border border-white/40 bg-red-600 hover:bg-red-700 transition hover:cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded border border-white/40 bg-cyan-800/80 hover:bg-cyan-900 transition hover:cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ View Modal - Receipt Style */}
      {isViewOpen && selectedCustomer && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/10 z-50 p-2 backdrop-blur-md print:p-0">
          <div className="bg-white text-black rounded-md shadow-xl w-full max-w-md p-6 relative font-mono text-sm border border-white/30">
            <button
              onClick={() => setIsViewOpen(false)}
              className="absolute top-2 right-2 text-blacktransition p-1 cursor-pointer rounded-full print:hidden"
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
                <span>C-ID:</span>
                <span>{selectedCustomer.customerId}</span>
              </div>
              <div className="flex justify-between">
                <span>Name:</span>
                <span>
                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Contact:</span>
                <span>{selectedCustomer.contact}</span>
              </div>
              <div className="flex justify-between">
                <span>CNIC:</span>
                <span>{selectedCustomer.cnic}</span>
              </div>
              <div className="flex justify-between">
                <span>City:</span>
                <span>{selectedCustomer.city}</span>
              </div>
              <div className="flex justify-between">
                <span>Address:</span>
                <span>{selectedCustomer.address || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span>{selectedCustomer.status}</span>
              </div>
              <div className="flex justify-between border-t border-dashed border-black/90 mt-2 pt-2">
                <span>Date Added:</span>
                <span>{formatDate(selectedCustomer.dateAdded)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center border-t border-dashed border-black/90 mt-2 pt-6 text-xs">
              <p>
                Thank you for choosing <strong>ZUBI ELECTRONICS</strong>!
              </p>
              <p>This is a computer-generated receipt.</p>
            </div>

            {/* Buttons */}
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

      {/* ✅ Delete Modal */}
      {isDeleteModalOpen && customerToDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 backdrop-blur-md">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-sm text-white">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-4">
              Are you sure you want to delete{" "}
              <strong>
                {customerToDelete.firstName} {customerToDelete.lastName}
              </strong>
              ?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 rounded border border-white/40 bg-cyan-800/80 hover:bg-cyan-900 hover:cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded border border-white/40 bg-red-600 hover:bg-red-700 hover:cursor-pointer transition"
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
