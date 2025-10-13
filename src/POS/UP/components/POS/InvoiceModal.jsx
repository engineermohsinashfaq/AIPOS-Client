import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";

export default function InvoiceModal({ invoiceId, cart, saleType, onClose }) {
  const total = cart.reduce((sum, i) => sum + i.qty * i.price, 0);

  const handlePrint = () => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.print();
    document.body.style.overflow = prev;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-50 p-2 sm:p-4">
      <div className="bg-white/10 border border-white/30 backdrop-blur-xl rounded-2xl w-full max-w-[95%] sm:max-w-[600px] h-[85vh] shadow-xl text-white relative flex flex-col print:w-full print:h-auto print:bg-white print:text-black print:overflow-visible">
        {/* CLOSE BUTTON */}
        <button
          className="absolute top-3 right-3 hover:cursor-pointer print:hidden cursor-pointer"
          onClick={onClose}
        >
          <CloseIcon />
        </button>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-4 scrollbar-hide print:overflow-visible print:p-5">
          {/* HEADER */}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold">
              TechNova Electronics
            </h1>
            <p className="text-white/70 print:text-black text-sm sm:text-base">
              123 Main Street, Karachi, Pakistan
            </p>
            <p className="text-white/70 print:text-black text-sm sm:text-base">
              📞 +92 300 1234567 | ✉️ info@technova.com
            </p>
            <hr className="border-white/30 my-4 print:border-black/40" />
            <h2 className="text-lg sm:text-xl font-semibold">
              {invoiceId}
            </h2>
            <p className="text-white/70 print:text-black text-sm sm:text-base mt-1">
              Date: {new Date().toLocaleDateString()} &nbsp;&nbsp; Sale Type:{" "}
              {saleType}
            </p>
          </div>

          {/* TABLE */}
          <table className="w-full text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-white/30 text-left print:border-black/40">
                <th className="py-2">#</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, i) => (
                <tr
                  key={item.productId}
                  className="border-b border-white/10 print:border-black/20"
                >
                  <td className="py-1">{i + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.qty}</td>
                  <td>Rs {item.price}</td>
                  <td>Rs {item.qty * item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* TOTAL */}
          <div className="mt-6 text-right">
            <p className="text-lg font-semibold print:text-black">
              Total: Rs {total.toLocaleString()}/-
            </p>
          </div>

          <div className="mt-6 text-center text-white/70 text-xs sm:text-sm print:text-black">
            <p>Thank you for shopping with TechNova Electronics!</p>
            <p className="text-white/50 mt-2 print:text-gray-600">
              This is a computer-generated invoice.
            </p>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="p-3 sm:p-4 border-t border-white/20 flex flex-wrap justify-center gap-2 print:hidden">
          <button
            onClick={() => toast.success("Invoice saved successfully!")}
            className="bg-green-700 hover:bg-green-600 px-3 sm:px-4 py-2 rounded-md font-semibold cursor-pointer text-sm sm:text-base"
          >
            💾 Save
          </button>

          <button
            onClick={handlePrint}
            className="bg-blue-700 hover:bg-blue-600 px-3 sm:px-4 py-2 rounded-md font-semibold cursor-pointer text-sm sm:text-base"
          >
            🖨️ Print
          </button>

          <button
            onClick={onClose}
            className="bg-red-700 hover:bg-red-600 px-3 sm:px-4 py-2 rounded-md font-semibold cursor-pointer text-sm sm:text-base"
          >
            ✖ Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
