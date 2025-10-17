import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

const emptyGuarantor = {
  guarantorId: "",
  firstName: "",
  lastName: "",
  contact: "",
  cnic: "",
  city: "",
  address: "",
};

// ✅ Function to get next guarantor ID (based only on saved data)
const getNextGuarantorId = () => {
  const existing = JSON.parse(
    localStorage.getItem("all_guarantors_data") || "[]"
  );
  const lastSavedId = existing.reduce((max, g) => {
    const num = parseInt(g.guarantorId?.replace("G-", ""), 10);
    return !isNaN(num) && num > max ? num : max;
  }, 0);

  const nextId = lastSavedId + 1;
  return `G-${String(nextId).padStart(3, "0")}`;
};

export default function AddGuarantor({ onSave }) {
  const [guarantor, setGuarantor] = useState(emptyGuarantor);

  // ✅ On mount, fetch last saved ID and set new one only if needed
  useEffect(() => {
    const nextId = getNextGuarantorId();
    setGuarantor((prev) => ({ ...prev, guarantorId: nextId }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (name === "contact") {
      let digits = value.replace(/\D/g, "").slice(0, 15);
      updatedValue = digits;
    }

    if (name === "cnic") {
      let digits = value.replace(/\D/g, "").slice(0, 13);
      if (digits.length <= 5) updatedValue = digits;
      else if (digits.length <= 12)
        updatedValue = `${digits.slice(0, 5)}-${digits.slice(5)}`;
      else
        updatedValue = `${digits.slice(0, 5)}-${digits.slice(
          5,
          12
        )}-${digits.slice(12)}`;
    }

    setGuarantor((prev) => ({ ...prev, [name]: updatedValue }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const toastOptions = { theme: "dark", autoClose: 2000 };

    // ✅ Validation
    if (!/^G-\d+$/.test(guarantor.guarantorId))
      return toast.error("Invalid Guarantor ID format", toastOptions);
    if (!guarantor.firstName.trim())
      return toast.error("First Name is required", toastOptions);
    if (!guarantor.lastName.trim())
      return toast.error("Last Name is required", toastOptions);

    const fullContact = "+" + guarantor.contact;
    if (!/^\+\d{7,15}$/.test(fullContact))
      return toast.error("Contact must be valid (+923001234567)", toastOptions);

    if (!/^\d{5}-\d{7}-\d{1}$/.test(guarantor.cnic))
      return toast.error(
        "CNIC format is invalid (12345-1234567-1)",
        toastOptions
      );

    if (!guarantor.city.trim())
      return toast.error("City is required", toastOptions);
    if (!guarantor.address.trim())
      return toast.error("Address is required", toastOptions);

    // ✅ Check for duplicate CNIC
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

    // ✅ Save guarantor
    const savedGuarantor = {
      ...guarantor,
      contact: fullContact,
      dateAdded: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    };

    const updated = [...existing, savedGuarantor];
    localStorage.setItem("all_guarantors_data", JSON.stringify(updated));

    if (onSave) onSave(savedGuarantor);

    toast.success("Guarantor added successfully!", {
      ...toastOptions,
      onClose: () => {
        window.location.href = "/up-all-guarantors";
      },
    });

    // ✅ Generate a new ID only after successful save
    const newId = getNextGuarantorId();
    setGuarantor({ ...emptyGuarantor, guarantorId: newId });
  };

  // ✅ Reset form but keep same ID (until user saves)
  const handleClear = () => {
    setGuarantor((prev) => ({
      ...emptyGuarantor,
      guarantorId: prev.guarantorId, // keep same ID
    }));
    toast.info("Form cleared", { theme: "dark", autoClose: 1500 });
  };

  return (
    <div className="px-4 py-2 min-h-[100%]">
      <ToastContainer position="top-right" autoClose={2000} theme="dark" />

      <div className="max-w-8xl mx-auto space-y-3">
        <div>
          <h1 className="text-3xl font-bold text-white">Add Guarantor</h1>
          <p className="text-white/80">
            Fill in the guarantor details below and save.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 text-white shadow-lg mt-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Guarantor ID (Read-Only) */}
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

            {/* First Name + Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* Contact + CNIC */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            {/* City */}
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

            {/* Address */}
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

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 rounded-md bg-cyan-800/80 hover:bg-cyan-900 transition cursor-pointer font-semibold flex justify-center items-center gap-2"
              >
                <PersonAddIcon />
                Save
              </button>
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
