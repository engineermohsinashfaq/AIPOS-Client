import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";

export default function InstallmentModal({ onClose, onProceed, cart }) {
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [guarantor, setGuarantor] = useState({ name: "", contact: "", cnic: "" });
  const [commission, setCommission] = useState("");
  const [plan, setPlan] = useState("1 Month");

  const handleCustomerClick = (cust) => {
    setSelectedCustomer((prev) => (prev?.id === cust.id ? null : cust));
  };

  const customers = [
    { id: "C-001", name: "Ali Khan", cnic: "35202-1234567-8" },
    { id: "C-002", name: "Sara Ahmed", cnic: "61101-9876543-2" },
    { id: "C-003", name: "Usman Rafiq", cnic: "37405-4567891-5" },
  ];

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.id.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const totalPrice = cart.reduce((sum, i) => sum + i.qty * i.price, 0);
  const commissionTotal = ((Number(totalPrice) * Number(commission)) / 100).toFixed(2);

  const handleSubmit = () => {
    if (!selectedCustomer) return toast.warn("Select a customer first!");
    if (!guarantor.name) return toast.warn("Enter guarantor details!");
    toast.success("Proceeding to installment invoice...");
    onProceed();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50 p-2">
      <div className="bg-white/10 border border-white/30 rounded-2xl w-[90vw] h-[85vh] flex overflow-hidden relative text-white">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-white hover:text-red-400"
        >
          <CloseIcon />
        </button>

        {/* LEFT: CUSTOMER SEARCH */}
        <div className="w-[40%] border-r border-white/20 p-4 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-3">Search Customer</h2>
          <input
            value={customerSearch}
            onChange={(e) => setCustomerSearch(e.target.value)}
            placeholder="Search by name or ID"
            className="w-full p-2 rounded bg-black/40 border border-white/20 outline-none"
          />

          <table className="w-full mt-4 text-sm border-collapse border border-white/10">
            <thead className="bg-white/10">
              <tr>
                <th className="border border-white/10 p-2 text-left">Select</th>
                <th className="border border-white/10 p-2 text-left">C-ID</th>
                <th className="border border-white/10 p-2 text-left">Name</th>
                <th className="border border-white/10 p-2 text-left">CNIC</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((cust) => (
                <tr
                  key={cust.id}
                  onClick={() => handleCustomerClick(cust)}
                  className={`cursor-pointer hover:bg-white/10 ${
                    selectedCustomer?.id === cust.id ? "bg-green-700/40" : ""
                  }`}
                >
                  <td className="border border-white/10 p-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedCustomer?.id === cust.id}
                      readOnly
                    />
                  </td>
                  <td className="border border-white/10 p-2">{cust.id}</td>
                  <td className="border border-white/10 p-2">{cust.name}</td>
                  <td className="border border-white/10 p-2">{cust.cnic}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MIDDLE: GUARANTOR */}
        <div className="w-[30%] border-r border-white/20 p-4">
          <h2 className="text-xl font-semibold mb-3">Guarantor Details</h2>
          <input
            placeholder="Name"
            value={guarantor.name}
            onChange={(e) => setGuarantor({ ...guarantor, name: e.target.value })}
            className="w-full p-2 mb-2 rounded bg-black/40 border border-white/20"
          />
          <input
            placeholder="Contact"
            value={guarantor.contact}
            onChange={(e) => setGuarantor({ ...guarantor, contact: e.target.value })}
            className="w-full p-2 mb-2 rounded bg-black/40 border border-white/20"
          />
          <input
            placeholder="CNIC"
            value={guarantor.cnic}
            onChange={(e) => setGuarantor({ ...guarantor, cnic: e.target.value })}
            className="w-full p-2 mb-2 rounded bg-black/40 border border-white/20"
          />
        </div>

        {/* RIGHT: COMMISSION & PLAN */}
        <div className="w-[30%] p-4 flex flex-col">
          <h2 className="text-xl font-semibold mb-3">Commission & Plan</h2>

          {selectedCustomer && (
            <div className="bg-green-800/30 border border-green-400/40 p-2 rounded mb-3">
              <p><strong>Selected:</strong> {selectedCustomer.name}</p>
              <p>ID: {selectedCustomer.id}</p>
            </div>
          )}

          <input
            placeholder="Commission (%)"
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
            className="w-full p-2 mb-3 rounded bg-black/40 border border-white/20"
          />

          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value)}
            className="w-full p-2 mb-4 rounded bg-black/40 border border-white/20"
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} className="bg-black/90">
                {`${i + 1} Month${i + 1 > 1 ? "s" : ""}`}
              </option>
            ))}
          </select>

          <div className="mt-3 bg-white/10 border border-white/20 p-3 rounded">
            <h3 className="text-lg font-semibold mb-1">Total Commission</h3>
            <p className="text-sm text-white/70 mb-2">
              Based on total price × commission %
            </p>
            <p className="text-xl font-bold text-green-400">
              Rs {commissionTotal}
            </p>
          </div>

          <button
            onClick={handleSubmit}
            className="bg-green-700 hover:bg-green-600 py-2 rounded font-semibold mt-auto"
          >
            Proceed to Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
