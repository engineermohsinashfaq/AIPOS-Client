// |===============================| AddCustomer Component |===============================|
// Import necessary React and third-party libraries
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useNavigate } from "react-router-dom";

// Define empty customer object template for form initialization
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

// Customer ID generator function - creates sequential IDs based on existing data
const generateCustomerId = () => {
  // Retrieve existing customers from localStorage or initialize empty array
  const existing = JSON.parse(
    localStorage.getItem("all_customers_data") || "[]"
  );

  // Find the highest existing customer ID number
  const lastSavedId = existing.reduce((max, cust) => {
    const num = parseInt(cust.customerId?.replace("C-", ""), 10);
    return !isNaN(num) && num > max ? num : max;
  }, 0);

  // Generate next sequential ID and store it
  const nextId = lastSavedId + 1;
  localStorage.setItem("lastCustomerId", nextId);

  // Return formatted customer ID (e.g., C-001)
  return `C-${String(nextId).padStart(3, "0")}`;
};

// Main AddCustomer component function
export default function AddCustomer({ onSave }) {
  // State management for customer form data
  const [customer, setCustomer] = useState(emptyCustomer);
  const [displayCustomer, setDisplayCustomer] = useState(emptyCustomer);

  // Navigation hook for programmatic routing
  const navigate = useNavigate();

  // Effect hook to generate customer ID on component mount
  useEffect(() => {
    // Only generate ID if not already set
    if (!customer.customerId) {
      const newId = generateCustomerId();
      setCustomer((prev) => ({ ...prev, customerId: newId }));
      setDisplayCustomer((prev) => ({ ...prev, customerId: newId }));
    }
  }, []);

  // Form input change handler with special formatting for contact and CNIC fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for contact field - only allow digits
    if (name === "contact") {
      let digits = value.replace(/\D/g, "");
      setCustomer((prev) => ({ ...prev, [name]: digits }));
      setDisplayCustomer((prev) => ({ ...prev, [name]: digits }));
      return;
    }

    // Special handling for CNIC field - format with dashes
    if (name === "cnic") {
      let digits = value.replace(/\D/g, "");
      // Limit to 13 digits maximum
      if (digits.length > 13) digits = digits.slice(0, 13);

      let formatted = "";
      // Apply CNIC formatting rules: 12345-1234567-1
      if (digits.length <= 5) formatted = digits;
      else if (digits.length <= 12)
        formatted = `${digits.slice(0, 5)}-${digits.slice(5)}`;
      else
        formatted = `${digits.slice(0, 5)}-${digits.slice(
          5,
          12
        )}-${digits.slice(12)}`;

      setCustomer((prev) => ({ ...prev, [name]: formatted.toLowerCase() }));
      setDisplayCustomer((prev) => ({ ...prev, [name]: formatted.toUpperCase() }));
      return;
    }

    // For fields that should be saved in lowercase and displayed in uppercase
    if (["firstName", "lastName", "city", "address"].includes(name)) {
      setCustomer((prev) => ({ ...prev, [name]: value.toLowerCase() }));
      setDisplayCustomer((prev) => ({ ...prev, [name]: value.toUpperCase() }));
      return;
    }

    // Default handling for all other fields (status, customerId)
    setCustomer((prev) => ({ ...prev, [name]: value }));
    setDisplayCustomer((prev) => ({ ...prev, [name]: value }));
  };

  // Form submission handler with comprehensive validation
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate Customer ID format
    if (!/^C-\d+$/.test(customer.customerId))
      return toast.error("Invalid Customer ID format", {
        position: "top-right",
        autoClose: 2000,
        theme: "dark",
      });

    // Validate First Name (required field)
    if (!customer.firstName.trim())
      return toast.error("First Name is required", {
        position: "top-right",
        autoClose: 2000,
        theme: "dark",
      });

    // Validate Last Name (required field)
    if (!customer.lastName.trim())
      return toast.error("Last Name is required", {
        position: "top-right",
        autoClose: 2000,
        theme: "dark",
      });

    // Validate Contact format with country code
    const fullContact = "+" + customer.contact;
    if (!/^\+\d{7,15}$/.test(fullContact))
      return toast.error(
        "Contact must start with '+' followed by 7–15 digits (e.g., +923001234567)",
        { position: "top-right", autoClose: 2000, theme: "dark" }
      );

    // Validate CNIC format (Pakistan standard)
    if (!/^\d{5}-\d{7}-\d{1}$/.test(customer.cnic))
      return toast.error("CNIC must be in format 12345-1234567-1", {
        position: "top-right",
        autoClose: 2000,
        theme: "dark",
      });

    // Validate City (required field)
    if (!customer.city.trim())
      return toast.error("City is required", {
        position: "top-right",
        autoClose: 2000,
        theme: "dark",
      });

    // Validate Address (required field)
    if (!customer.address.trim())
      return toast.error("Address is required", {
        position: "top-right",
        autoClose: 2000,
        theme: "dark",
      });

    // Check for duplicate CNIC in existing customers
    const existing = JSON.parse(
      localStorage.getItem("all_customers_data") || "[]"
    );

    const isCnicDuplicate = existing.some((c) => c.cnic === customer.cnic);
    if (isCnicDuplicate) {
      return toast.error("A customer with this CNIC already exists!", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark",
      });
    }

    // Prepare customer data for saving with additional metadata
    const savedCustomer = {
      ...customer,
      contact: fullContact, // Store with country code prefix
      dateAdded: new Date().toISOString(), // Add timestamp
    };

    // Update localStorage with new customer data
    const updated = [...existing, savedCustomer];
    localStorage.setItem("all_customers_data", JSON.stringify(updated));

    // Call parent component's save callback if provided
    if (onSave) onSave(savedCustomer);

    // Show success message and navigate after delay
    toast.success("Customer added successfully!", {
      position: "top-right",
      autoClose: 2000,
      theme: "dark",
      onClose: () => navigate("/up-all-customers"), // Navigate to customers list
    });

    // Reset form with new customer ID
    const newId = generateCustomerId();
    setCustomer({ ...emptyCustomer, customerId: newId });
    setDisplayCustomer({ ...emptyCustomer, customerId: newId });
  };

  // Form clear/reset handler
  const handleClear = () => {
    // Reset form but preserve the current customer ID
    const currentId = customer.customerId;
    setCustomer({ ...emptyCustomer, customerId: currentId });
    setDisplayCustomer({ ...emptyCustomer, customerId: currentId });
    toast.info("Form cleared!", {
      position: "top-right",
      autoClose: 1500,
      theme: "dark",
    });
  };

  // Component render method
  return (
    // Main container with padding and full height
    <div className="px-4 py-2 min-h-[100%]">
      {/* Toast notifications container */}
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

      {/* Content wrapper */}
      <div className="mx-auto space-y-3 max-w-8xl">
        {/* Page header section */}
        <div>
          <h1 className="text-3xl font-bold text-white">Add Customer</h1>
          <p className="text-white/80">
            Fill in the customer details below and save.
          </p>
        </div>

        {/* Main form container with glassmorphism effect */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 text-white shadow-lg mt-8">
          {/* Form element with submit handler */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Customer ID field (read-only) */}
            <div>
              <label
                htmlFor="customerId"
                className="block mb-1 text-sm text-white/80"
              >
                Customer ID
              </label>
              <input
                type="text"
                name="customerId"
                id="customerId"
                value={displayCustomer.customerId}
                readOnly
                className="w-full p-3 rounded-md bg-black/40 border border-white/30 text-white outline-none cursor-not-allowed"
              />
            </div>

            {/* First and Last Name fields in responsive grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name input */}
              <div>
                <label
                  htmlFor="firstName"
                  className="block mb-1 text-sm text-white/80"
                >
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  placeholder="First Name"
                  value={displayCustomer.firstName}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                />
              </div>

              {/* Last Name input */}
              <div>
                <label
                  htmlFor="lastName"
                  className="block mb-1 text-sm text-white/80"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  placeholder="Last Name"
                  value={displayCustomer.lastName}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                />
              </div>
            </div>

            {/* Contact and CNIC fields in responsive grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact input with country code prefix */}
              <div>
                <label
                  htmlFor="contact"
                  className="block mb-1 text-sm text-white/80"
                >
                  Contact (Phone)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 select-none">
                    +
                  </span>
                  <input
                    type="text"
                    name="contact"
                    id="contact"
                    placeholder="923001234567"
                    maxLength={15}
                    value={displayCustomer.contact}
                    onChange={handleChange}
                    className="w-full pl-6 p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                  />
                </div>
              </div>

              {/* CNIC input with automatic formatting */}
              <div>
                <label
                  htmlFor="cnic"
                  className="block mb-1 text-sm text-white/80"
                >
                  CNIC / National ID
                </label>
                <input
                  type="text"
                  name="cnic"
                  id="cnic"
                  placeholder="12345-1234567-1"
                  value={displayCustomer.cnic}
                  onChange={handleChange}
                  maxLength={15}
                  className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                />
              </div>
            </div>

            {/* City and Status fields in responsive grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* City input */}
              <div>
                <label
                  htmlFor="city"
                  className="block mb-1 text-sm text-white/80"
                >
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  id="city"
                  placeholder="City"
                  value={displayCustomer.city}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                />
              </div>

              {/* Status dropdown selector */}
              <div>
                <label
                  htmlFor="status"
                  className="block mb-1 text-sm text-white/80"
                >
                  Status
                </label>
                <select
                  name="status"
                  id="status"
                  value={displayCustomer.status}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                >
                  <option className="bg-black/90">Active</option>
                  <option className="bg-black/90">Inactive</option>
                  <option className="bg-black/90">Suspended</option>
                </select>
              </div>
            </div>

            {/* Address textarea field */}
            <div>
              <label
                htmlFor="address"
                className="block mb-1 text-sm text-white/80"
              >
                Permanent Address
              </label>
              <textarea
                name="address"
                id="address"
                placeholder="Enter full residential address"
                value={displayCustomer.address}
                onChange={handleChange}
                rows="3"
                className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
              />
            </div>

            {/* Form action buttons */}
            <div className="flex flex-col md:flex-row gap-3">
              {/* Save button with icon */}
              <button
                type="submit"
                className="flex-1 py-3 border border-white/40 rounded-md bg-cyan-800/80 hover:bg-cyan-900 transition cursor-pointer font-semibold flex justify-center items-center gap-2"
              >
                <PersonAddIcon />
                Save
              </button>

              {/* Clear form button */}
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