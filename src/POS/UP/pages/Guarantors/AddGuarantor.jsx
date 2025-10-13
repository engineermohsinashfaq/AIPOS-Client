import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

// ✅ Function to generate auto ID like G-001, G-002, etc.
const generateGuarantorId = () => {
  let lastId = Number(localStorage.getItem("lastGuarantorId") || 0);

  if (lastId < 1) lastId = 1;
  else lastId += 1;

  localStorage.setItem("lastGuarantorId", lastId);
  return `G-${String(lastId).padStart(3, "0")}`;
};

export default function AddGuarantor({ onSave }) {
  const [guarantor, setGuarantor] = useState(emptyGuarantor);

  useEffect(() => {
    setGuarantor((prev) => ({ ...prev, guarantorId: generateGuarantorId() }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "contact") {
      let digits = value.replace(/\D/g, "");
      setGuarantor((prev) => ({ ...prev, [name]: digits }));
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

      setGuarantor((prev) => ({ ...prev, [name]: formatted }));
      return;
    }

    setGuarantor((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Validation
    if (!/^G-\d+$/.test(guarantor.guarantorId))
      return toast.error("Invalid Guarantor ID format");

    if (!guarantor.firstName.trim())
      return toast.error("First Name is required");
    if (!guarantor.lastName.trim()) return toast.error("Last Name is required");

    const fullContact = "+" + guarantor.contact;

    if (!/^\+\d{7,15}$/.test(fullContact))
      return toast.error(
        "Contact must start with '+' followed by 7–15 digits (e.g., +923001234567)"
      );

    if (!/^\d{5}-\d{7}-\d{1}$/.test(guarantor.cnic))
      return toast.error(
        "CNIC must be in format 12345-1234567-1 (13 digits total)"
      );

    if (!guarantor.city.trim()) return toast.error("City is required");
    if (!guarantor.address.trim()) return toast.error("Address is required");

    // ✅ Save with formatted contact and timestamp
    // ✅ Save with formatted contact and timestamp
    const savedGuarantor = {
      ...guarantor,
      contact: fullContact,
      dateAdded: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long", // 👈 gives full month name like "October"
        year: "numeric",
      }),
    };

    console.log("Saved Guarantor:", savedGuarantor);

    if (onSave) onSave(savedGuarantor);

    toast.success("Guarantor added successfully!", {
      onClose: () => {
        window.location.reload();
      },
      autoClose: 2000,
    });

    // Reset form with new ID
    setGuarantor({ ...emptyGuarantor, guarantorId: generateGuarantorId() });
  };

  return (
    <div className="px-4 py-2">
      <ToastContainer />
      <div className="max-w-6xl mx-auto space-y-3">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Add Guarantor</h1>
          <p className="text-white/80">
            Fill in the guarantor details below and save.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 text-white shadow-lg mt-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Auto Guarantor ID */}
            <input
              type="text"
              name="guarantorId"
              value={guarantor.guarantorId}
              readOnly
              className="w-full p-3 rounded-md bg-black/40 border border-white/30 text-white outline-none cursor-not-allowed"
            />

            {/* First and Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={guarantor.firstName}
                onChange={handleChange}
                className="w-full p-3 rounded-md bg-black/30 border border-white/20 placeholder-white/80 text-white outline-none"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={guarantor.lastName}
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
                  value={guarantor.contact}
                  onChange={handleChange}
                  className="w-full pl-6 p-3 rounded-md bg-black/30 border border-white/20 placeholder-white/80 text-white outline-none"
                />
              </div>

              <input
                type="text"
                name="cnic"
                placeholder="CNIC (e.g., 12345-1234567-1)"
                value={guarantor.cnic}
                onChange={handleChange}
                maxLength={15}
                className="w-full p-3 rounded-md bg-black/30 border border-white/20 placeholder-white/80 text-white outline-none"
              />
            </div>

            {/* City */}
            <input
              type="text"
              name="city"
              placeholder="City"
              value={guarantor.city}
              onChange={handleChange}
              className="w-full p-3 rounded-md bg-black/30 border border-white/20 placeholder-white/80 text-white outline-none"
            />

            {/* Address */}
            <textarea
              name="address"
              placeholder="Address"
              value={guarantor.address}
              onChange={handleChange}
              rows="5"
              className="w-full p-3 rounded-md bg-black/30 border border-white/20 placeholder-white/80 text-white outline-none"
            />

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 rounded-md bg-cyan-800/80 hover:bg-cyan-900 transition cursor-pointer font-semibold flex justify-center items-center gap-2"
            >
              <PersonAddIcon />
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
