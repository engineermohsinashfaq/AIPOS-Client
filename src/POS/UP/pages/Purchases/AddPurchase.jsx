import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddIcon from "@mui/icons-material/Add";

const emptyPurchase = {
  purchaseId: "",
  name: "",
  category: "",
  company: "",
  price: "",
  quantity: "",
  supplier: "",
  supplierContact: "",
  description: "",
  total: "",
};

// ✅ Auto-generate Purchase ID like PU-001, PU-002, etc.
const generatePurchaseId = () => {
  let lastId = Number(localStorage.getItem("lastPurchaseId") || 0);
  if (lastId < 1) lastId = 1;
  else lastId += 1;
  localStorage.setItem("lastPurchaseId", lastId);
  return `PU-${String(lastId).padStart(3, "0")}`;
};

export default function AddPurchase({ onSave }) {
  const [purchase, setPurchase] = useState(emptyPurchase);

  // ✅ Auto-generate ID on load
  useEffect(() => {
    setPurchase((prev) => ({ ...prev, purchaseId: generatePurchaseId() }));
  }, []);

  // ✅ Recalculate total automatically (price × quantity)
  useEffect(() => {
    const price = parseFloat(purchase.price) || 0;
    const qty = parseInt(purchase.quantity) || 0;
    const total = (price * qty).toFixed(2);
    setPurchase((prev) => ({ ...prev, total }));
  }, [purchase.price, purchase.quantity]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // ✅ Price – only allow numbers and decimals
    if (name === "price") {
      const val = value.replace(/[^\d.]/g, "");
      setPurchase((prev) => ({ ...prev, [name]: val }));
      return;
    }

    // ✅ Quantity – only allow integers
    if (name === "quantity") {
      const val = value.replace(/\D/g, "");
      setPurchase((prev) => ({ ...prev, [name]: val }));
      return;
    }

    // ✅ Supplier Contact – only digits, max 15 digits
    if (name === "supplierContact") {
      let digits = value.replace(/\D/g, "");
      if (digits.length > 15) digits = digits.slice(0, 15);
      setPurchase((prev) => ({ ...prev, [name]: digits }));
      return;
    }

    setPurchase((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Full Form Validation using Toastify
    if (!/^PU-\d+$/.test(purchase.purchaseId))
      return toast.error("Invalid Purchase ID format");
    if (!purchase.name.trim()) return toast.error("Name is required");
    if (!purchase.category.trim()) return toast.error("Category is required");
    if (!purchase.company.trim()) return toast.error("Company is required");
    if (!purchase.price || isNaN(purchase.price) || parseFloat(purchase.price) <= 0)
      return toast.error("Valid Price is required");
    if (!purchase.quantity || isNaN(purchase.quantity) || parseInt(purchase.quantity) <= 0)
      return toast.error("Valid Quantity is required");
    if (!purchase.supplier.trim()) return toast.error("Supplier is required");

    const fullSupplierContact = "+" + purchase.supplierContact;
    if (!/^\+\d{7,15}$/.test(fullSupplierContact))
      return toast.error(
        "Supplier Contact must start with '+' followed by 7–15 digits"
      );

    if (!purchase.description.trim()) return toast.error("Description is required");

    // ✅ Success toast (reload after toast closes)
    toast.success("Purchase added successfully!", {
      onClose: () => {
        window.location.reload();
      },
      autoClose: 2000,
    });

    // ✅ Print all data with date & time
    const timestamp = new Date().toLocaleString();
    console.log("✅ Purchase saved successfully at:", timestamp);
    console.table({
      ...purchase,
      supplierContact: fullSupplierContact,
      Saved_On: timestamp,
    });

    // ✅ Save callback
    onSave({ ...purchase, supplierContact: fullSupplierContact });
  };

  return (
    <div className="px-4 py-2">
      <ToastContainer />
      <div className="max-w-6xl mx-auto space-y-3">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Add Purchase</h1>
          <p className="text-white/80">
            Fill in the purchase details below and save.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-8 text-white shadow-lg mt-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Purchase ID + Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="purchaseId"
                value={purchase.purchaseId}
                readOnly
                className="w-full p-3 rounded-md bg-black/40 border border-white/30 text-white outline-none cursor-not-allowed"
              />
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={purchase.name}
                onChange={handleChange}
                className="w-full p-3 rounded-md bg-black/30 border border-white/20 placeholder-white/80 text-white outline-none"
              />
            </div>

            {/* Category + Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="category"
                placeholder="Category"
                value={purchase.category}
                onChange={handleChange}
                className="w-full p-3 rounded-md bg-black/30 border border-white/20 placeholder-white/80 text-white outline-none"
              />
              <input
                type="text"
                name="company"
                placeholder="Company"
                value={purchase.company}
                onChange={handleChange}
                className="w-full p-3 rounded-md bg-black/30 border border-white/20 placeholder-white/80 text-white outline-none"
              />
            </div>

            {/* Price + Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="price"
                placeholder="Price"
                value={purchase.price}
                onChange={handleChange}
                className="w-full p-3 rounded-md bg-black/30 border border-white/20 placeholder-white/80 text-white outline-none"
              />
              <input
                type="text"
                name="quantity"
                placeholder="Quantity"
                value={purchase.quantity}
                onChange={handleChange}
                className="w-full p-3 rounded-md bg-black/30 border border-white/20 placeholder-white/80 text-white outline-none"
              />
            </div>

            {/* Supplier + Supplier Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="supplier"
                placeholder="Supplier"
                value={purchase.supplier}
                onChange={handleChange}
                className="w-full p-3 rounded-md bg-black/30 border border-white/20 placeholder-white/80 text-white outline-none"
              />
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 select-none">
                  +
                </span>
                <input
                  type="text"
                  name="supplierContact"
                  placeholder="923001234567"
                  value={purchase.supplierContact}
                  onChange={handleChange}
                  className="w-full pl-6 p-3 rounded-md bg-black/30 border border-white/20 placeholder-white/80 text-white outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <textarea
              name="description"
              placeholder="Description"
              value={purchase.description}
              onChange={handleChange}
              rows="3"
              className="w-full p-3 rounded-md bg-black/30 border border-white/20 placeholder-white/80 text-white outline-none"
            />

            {/* Total Display */}
            <div className="flex justify-between items-center mt-2 border-t border-white/20 pt-4">
              <span className="text-lg font-bold text-white">Total Price:</span>
              <span className="text-lg font-bold text-white">
                Rs: {purchase.total || "0.00"}/-
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-md bg-cyan-800/80 hover:bg-cyan-900 transition cursor-pointer font-semibold flex justify-center items-center gap-2 mt-4"
            >
              <AddIcon />
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
