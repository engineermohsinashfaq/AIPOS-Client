import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useNavigate } from "react-router-dom";

const emptyCustomer = {
  customerId: "",
  firstName: "",
  lastName: "",
  contact: "",
  cnic: "",
  city: "",
  status: "Active",
  address: "",
};

// Function to generate auto ID like C-001, C-002, etc.
const generateCustomerId = () => {
  let lastId = Number(localStorage.getItem("lastCustomerId") || 0);
  lastId = lastId < 1 ? 1 : lastId + 1;
  localStorage.setItem("lastCustomerId", lastId);
  return `C-${String(lastId).padStart(3, "0")}`;
};

export default function AddCustomer({ onSave }) {
  const [customer, setCustomer] = useState(emptyCustomer);
  const navigate = useNavigate();

  useEffect(() => {
    setCustomer((prev) => ({ ...prev, customerId: generateCustomerId() }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "contact") {
      let digits = value.replace(/\D/g, "");
      setCustomer((prev) => ({ ...prev, [name]: digits }));
      return;
    }

    if (name === "cnic") {
      let digits = value.replace(/\D/g, "");
      if (digits.length > 13) digits = digits.slice(0, 13);

      let formatted = "";
      if (digits.length <= 5) formatted = digits;
      else if (digits.length <= 12)
        formatted = `${digits.slice(0, 5)}-${digits.slice(5)}`;
      else
        formatted = `${digits.slice(0, 5)}-${digits.slice(
          5,
          12
        )}-${digits.slice(12)}`;

      setCustomer((prev) => ({ ...prev, [name]: formatted }));
      return;
    }

    setCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation checks
    if (!/^C-\d+$/.test(customer.customerId))
      return toast.error("Invalid Customer ID format", {
        position: "top-right",
        autoClose: 2000,
        theme: "dark",
      });

    if (!customer.firstName.trim())
      return toast.error("First Name is required", {
        position: "top-right",
        autoClose: 2000,
        theme: "dark",
      });

    if (!customer.lastName.trim())
      return toast.error("Last Name is required", {
        position: "top-right",
        autoClose: 2000,
        theme: "dark",
      });

    const fullContact = "+" + customer.contact;
    if (!/^\+\d{7,15}$/.test(fullContact))
      return toast.error(
        "Contact must start with '+' followed by 7–15 digits (e.g., +923001234567)",
        { position: "top-right", autoClose: 2000, theme: "dark" }
      );

    if (!/^\d{5}-\d{7}-\d{1}$/.test(customer.cnic))
      return toast.error(
        "CNIC must be in format 12345-1234567-1 (13 digits total)",
        { position: "top-right", autoClose: 2000, theme: "dark" }
      );

    if (!customer.city.trim())
      return toast.error("City is required", {
        position: "top-right",
        autoClose: 2000,
        theme: "dark",
      });

    if (!customer.address.trim())
      return toast.error("Address is required", {
        position: "top-right",
        autoClose: 2000,
        theme: "dark",
      });

    // Get existing customers
    const existing = JSON.parse(
      localStorage.getItem("all_customers_data") || "[]"
    );

    // ⭐️ New CNIC Existence Check
    const isCnicDuplicate = existing.some(
        (c) => c.cnic === customer.cnic
    );

    if (isCnicDuplicate) {
        return toast.error("A customer with this CNIC already exists!", {
            position: "top-right",
            autoClose: 3000, // Longer autoClose for a critical error
            theme: "dark",
        });
    }
    // ⭐️ End of New CNIC Existence Check


    // ✅ Prepare customer object
    const savedCustomer = {
      ...customer,
      contact: fullContact,
      dateAdded: new Date().toISOString(),
    };

    // ✅ Save to localStorage (append to existing array)
    const updated = [...existing, savedCustomer];
    localStorage.setItem("all_customers_data", JSON.stringify(updated));

    if (onSave) onSave(savedCustomer);

    // ✅ Success Toast and Redirect
    toast.success("Customer added successfully!", {
      position: "top-right",
      autoClose: 2000,
      theme: "dark",
      onClose: () => navigate("/up-all-customers"),
    });

    // ✅ Reset form
    setCustomer({ ...emptyCustomer, customerId: generateCustomerId() });
  };

  // ✅ New: Clear form handler
  const handleClear = () => {
    setCustomer({ ...emptyCustomer, customerId: generateCustomerId() });
    toast.info("Form cleared!", {
      position: "top-right",
      autoClose: 1500,
      theme: "dark",
    });
  };

  return (
    <div className="px-4 py-2 min-h-[100%]">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover={false}
        draggable={false}
        theme="dark"
      />

      <div className="mx-auto space-y-3 w-[100%]">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Add Customer</h1>
          <p className="text-white/80">
            Fill in the customer details below and save.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 text-white shadow-lg mt-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Auto Customer ID */}
            <input
              type="text"
              name="customerId"
              value={customer.customerId}
              readOnly
              className="w-full p-3 rounded-md bg-black/40 border border-white/30 text-white outline-none cursor-not-allowed"
            />

            {/* First and Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={customer.firstName}
                onChange={handleChange}
                className="w-full p-3 rounded-md bg-black/30 border border-white/20 placeholder-white/80 text-white outline-none"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={customer.lastName}
                onChange={handleChange}
                className="w-full p-3 rounded-md bg-black/30 border border-white/20 placeholder-white/80 text-white outline-none"
              />
            </div>

            {/* Contact and CNIC */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 select-none">
                  +
                </span>
                <input
                  type="text"
                  name="contact"
                  placeholder="923001234567"
                  value={customer.contact}
                  onChange={handleChange}
                  className="w-full pl-6 p-3 rounded-md bg-black/30 border border-white/20 placeholder-white/80 text-white outline-none"
                />
              </div>

              <input
                type="text"
                name="cnic"
                placeholder="CNIC"
                value={customer.cnic}
                onChange={handleChange}
                maxLength={15}
                className="w-full p-3 rounded-md bg-black/30 border border-white/20 placeholder-white/80 text-white outline-none"
              />
            </div>

            {/* City and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="city"
                placeholder="City"
                value={customer.city}
                onChange={handleChange}
                className="w-full p-3 rounded-md bg-black/30 border border-white/20 placeholder-white/80 text-white outline-none"
              />

              <select
                name="status"
                value={customer.status}
                onChange={handleChange}
                className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
              >
                <option className="bg-black/90">Active</option>
                <option className="bg-black/90">Inactive</option>
                <option className="bg-black/90">Suspended</option>
              </select>
            </div>

            {/* Address */}
            <textarea
              name="address"
              placeholder="Address"
              value={customer.address}
              onChange={handleChange}
              rows="8"
              className="w-full p-3 rounded-md bg-black/30 border border-white/20 placeholder-white/80 text-white outline-none"
            />

            {/* Buttons */}
            <div className="flex flex-col md:flex-row gap-3">
              <button
                type="submit"
                className="flex-1 py-3 border border-white/40 rounded-md bg-cyan-800/80 hover:bg-cyan-900 transition cursor-pointer font-semibold flex justify-center items-center gap-2"
              >
                <PersonAddIcon />
                Save
              </button>

              {/* Clear Button */}
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 py-3 border border-white/40 rounded-md bg-red-700/80 hover:bg-red-800 transition cursor-pointer font-semibold"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}