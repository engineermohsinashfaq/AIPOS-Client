import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  cnic: "",
  address: "",
  password: "", // ✅ Added editable password field
  role: "User",
  branch: "",
  location: "",
  status: "Active",
};

export default function AddUser() {
  const [form, setForm] = useState(emptyForm);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ Auto-format CNIC while typing
    if (name === "cnic") {
      let digits = value.replace(/\D/g, "").slice(0, 13);
      let formatted = digits;
      if (digits.length > 5 && digits.length <= 12)
        formatted = `${digits.slice(0, 5)}-${digits.slice(5)}`;
      if (digits.length === 13)
        formatted = `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
      setForm((s) => ({ ...s, cnic: formatted }));
      return;
    }

    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Field validations
    if (!form.firstName.trim()) return toast.error("First name is required");
    if (!form.lastName.trim()) return toast.error("Last name is required");
    if (!form.email.trim()) return toast.error("Email is required");
    if (!form.phone.trim()) return toast.error("Phone number is required");
    if (!form.cnic.trim()) return toast.error("CNIC is required");
    if (!form.address.trim()) return toast.error("Address is required");
    if (!form.password.trim()) return toast.error("Password is required");

    if (!/^\d{5}-\d{7}-\d{1}$/.test(form.cnic))
      return toast.error("Invalid CNIC format (e.g., 12345-6789012-3)");

    if (!form.phone.startsWith("+"))
      return toast.error("Phone number must start with +");

    const users = JSON.parse(localStorage.getItem("manage_users_data") || "[]");

    // ✅ Auto-increment user ID
    const nextId =
      users.length > 0
        ? (Math.max(...users.map((u) => parseInt(u.id))) + 1)
            .toString()
            .padStart(2, "0")
        : "01";

    // ✅ Create new user object
    const newUser = {
      ...form,
      id: nextId,
      created: new Date().toISOString(),
      username: form.cnic, // CNIC is the User ID
    };

    // ✅ Save to localStorage
    localStorage.setItem(
      "manage_users_data",
      JSON.stringify([newUser, ...users])
    );

    toast.success(`${form.firstName} ${form.lastName} added successfully!`);

    // Redirect after short delay
    setTimeout(() => navigate("/all-users"), 1500);
  };

  return (
    <div className="p-6 min-h-screen text-white">
      <ToastContainer />
      <div className="max-w-7xl mx-auto bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-6">
        <h1 className="text-3xl font-bold mb-4">Add New User</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First + Last Name */}
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

          {/* Email */}
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
          />

          {/* Phone */}
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Contact (+92...)"
            className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
          />

          {/* CNIC */}
          <input
            name="cnic"
            value={form.cnic}
            onChange={handleChange}
            placeholder="CNIC (12345-6789012-3)"
            className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
          />

          {/* Address */}
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Address"
            className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
          />

          {/* Password */}
          <input
            name="password"
            type="text"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full p-2 rounded bg-black/30 border border-white/20 outline-none"
          />

          {/* Branch + Location */}
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

          {/* Role + Status */}
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

          {/* Username + Password Display */}
          <div className="text-white/80">
            <p>
              <strong>CNIC:</strong> {form.cnic || "—"}
            </p>
            <p>
              <strong>Password:</strong> {form.password || "—"}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate("/all-users")}
              className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 transition hover:cursor-pointer"
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
  );
}
