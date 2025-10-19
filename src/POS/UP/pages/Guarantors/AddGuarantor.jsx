// |===============================| AddGuarantor Component |===============================|
// Import necessary React hooks and external libraries
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

// Define empty guarantor object template for form initialization
const emptyGuarantor = {
  guarantorId: "",
  firstName: "",
  lastName: "",
  contact: "",
  cnic: "",
  city: "",
  address: "",
};

// Guarantor ID generator function - creates sequential IDs based on existing data
const getNextGuarantorId = () => {
  // Retrieve existing guarantors from localStorage or initialize empty array
  const existing = JSON.parse(
    localStorage.getItem("all_guarantors_data") || "[]"
  );
  
  // Find the highest existing guarantor ID number
  const lastSavedId = existing.reduce((max, g) => {
    const num = parseInt(g.guarantorId?.replace("G-", ""), 10);
    return !isNaN(num) && num > max ? num : max;
  }, 0);

  // Generate next sequential ID
  const nextId = lastSavedId + 1;
  
  // Return formatted guarantor ID (e.g., G-001)
  return `G-${String(nextId).padStart(3, "0")}`;
};

// Main AddGuarantor component function
export default function AddGuarantor({ onSave }) {
  // State management for guarantor form data
  const [guarantor, setGuarantor] = useState(emptyGuarantor);

  // Effect hook to generate guarantor ID on component mount
  useEffect(() => {
    const nextId = getNextGuarantorId();
    setGuarantor((prev) => ({ ...prev, guarantorId: nextId }));
  }, []);

  // Form input change handler with special formatting for contact and CNIC fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    // Special handling for contact field - only allow digits and limit length
    if (name === "contact") {
      let digits = value.replace(/\D/g, "").slice(0, 15);
      updatedValue = digits;
    }

    // Special handling for CNIC field - format with dashes
    if (name === "cnic") {
      let digits = value.replace(/\D/g, "").slice(0, 13);
      
      // Apply CNIC formatting rules: 12345-1234567-1
      if (digits.length <= 5) updatedValue = digits;
      else if (digits.length <= 12)
        updatedValue = `${digits.slice(0, 5)}-${digits.slice(5)}`;
      else
        updatedValue = `${digits.slice(0, 5)}-${digits.slice(
          5,
          12
        )}-${digits.slice(12)}`;
    }

    // Convert to lowercase for firstName, lastName, city, and address fields
    if (name === "firstName" || name === "lastName" || name === "city" || name === "address") {
      updatedValue = value.toLowerCase();
    }

    // Update guarantor state with new value
    setGuarantor((prev) => ({ ...prev, [name]: updatedValue }));
  };

  // Form submission handler with comprehensive validation
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Toast notification configuration
    const toastOptions = { theme: "dark", autoClose: 2000 };

    // Validate Guarantor ID format
    if (!/^G-\d+$/.test(guarantor.guarantorId))
      return toast.error("Invalid Guarantor ID format", toastOptions);
    
    // Validate First Name (required field)
    if (!guarantor.firstName.trim())
      return toast.error("First Name is required", toastOptions);
    
    // Validate Last Name (required field)
    if (!guarantor.lastName.trim())
      return toast.error("Last Name is required", toastOptions);

    // Validate Contact format with country code
    const fullContact = "+" + guarantor.contact;
    if (!/^\+\d{7,15}$/.test(fullContact))
      return toast.error("Contact must be valid (+923001234567)", toastOptions);

    // Validate CNIC format (Pakistan standard)
    if (!/^\d{5}-\d{7}-\d{1}$/.test(guarantor.cnic))
      return toast.error(
        "CNIC format is invalid (12345-1234567-1)",
        toastOptions
      );

    // Validate City (required field)
    if (!guarantor.city.trim())
      return toast.error("City is required", toastOptions);
    
    // Validate Address (required field)
    if (!guarantor.address.trim())
      return toast.error("Address is required", toastOptions);

    // Check for duplicate CNIC in existing guarantors
    const existing = JSON.parse(
      localStorage.getItem("all_guarantors_data") || "[]"
    );
    const cnicExists = existing.some(
      (g) => g.cnic.replace(/\s/g, "") === guarantor.cnic.replace(/\s/g, "")
    );
    if (cnicExists)
      return toast.error(
        "Guarantor with this CNIC already exists!",
        toastOptions
      );

    // Prepare guarantor data for saving with additional metadata
    const savedGuarantor = {
      ...guarantor,
      firstName: guarantor.firstName.toLowerCase(),
      lastName: guarantor.lastName.toLowerCase(),
      city: guarantor.city.toLowerCase(),
      address: guarantor.address.toLowerCase(),
      contact: fullContact, // Store with country code prefix
      dateAdded: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }), // Add formatted date
    };

    // Update localStorage with new guarantor data
    const updated = [...existing, savedGuarantor];
    localStorage.setItem("all_guarantors_data", JSON.stringify(updated));

    // Call parent component's save callback if provided
    if (onSave) onSave(savedGuarantor);

    // Show success message and navigate after delay
    toast.success("Guarantor added successfully!", {
      ...toastOptions,
      onClose: () => {
        window.location.href = "/up-all-guarantors";
      },
    });

    // Generate a new ID and reset form after successful save
    const newId = getNextGuarantorId();
    setGuarantor({ ...emptyGuarantor, guarantorId: newId });
  };

  // Form clear/reset handler
  const handleClear = () => {
    // Reset form but preserve the current guarantor ID
    setGuarantor((prev) => ({
      ...emptyGuarantor,
      guarantorId: prev.guarantorId, // keep same ID
    }));
    toast.info("Form cleared", { theme: "dark", autoClose: 1500 });
  };

  // Component render method
  return (
    // Main container with padding and full height
    <div className="px-4 py-2 min-h-[100%]">
      {/* Toast notifications container */}
      <ToastContainer position="top-right" autoClose={2000} theme="dark" />

      {/* Content wrapper with max width constraint */}
      <div className="max-w-8xl mx-auto space-y-3">
        {/* Page header section */}
        <div>
          <h1 className="text-3xl font-bold text-white">Add Guarantor</h1>
          <p className="text-white/80">
            Fill in the guarantor details below and save.
          </p>
        </div>

        {/* Main form container with glassmorphism effect */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 text-white shadow-lg mt-8">
          {/* Form element with submit handler */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Guarantor ID field (read-only) */}
            <div>
              <label
                htmlFor="guarantorId"
                className="block mb-1 text-sm text-white/80"
              >
                Guarantor ID
              </label>
              <input
                type="text"
                id="guarantorId"
                name="guarantorId"
                value={guarantor.guarantorId}
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
                  id="firstName"
                  name="firstName"
                  placeholder="First Name"
                  value={guarantor.firstName}
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
                  id="lastName"
                  name="lastName"
                  placeholder="Last Name"
                  value={guarantor.lastName}
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
                    id="contact"
                    name="contact"
                    placeholder="923001234567"
                    value={guarantor.contact}
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
                  id="cnic"
                  name="cnic"
                  placeholder="12345-1234567-1"
                  value={guarantor.cnic}
                  onChange={handleChange}
                  maxLength={15}
                  className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                />
              </div>
            </div>

            {/* City input field */}
            <div>
              <label
                htmlFor="city"
                className="block mb-1 text-sm text-white/80"
              >
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="City"
                value={guarantor.city}
                onChange={handleChange}
                className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
              />
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
                id="address"
                name="address"
                placeholder="Enter full residential address"
                value={guarantor.address}
                onChange={handleChange}
                rows="3"
                className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
              />
            </div>

            {/* Form action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              {/* Save button with icon */}
              <button
                type="submit"
                className="flex-1 py-3 rounded-md bg-cyan-800/80 hover:bg-cyan-900 transition cursor-pointer font-semibold flex justify-center items-center gap-2"
              >
                <PersonAddIcon />
                Save
              </button>
              
              {/* Clear form button */}
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 py-3 rounded-md bg-red-700/80 hover:bg-red-800 transition cursor-pointer font-semibold flex justify-center items-center gap-2"
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