import React, { useState, useMemo, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";

const sampleSales = [
  {
    invoiceId: "INV-001",
    date: new Date().toISOString(),
    saleType: "Cash",
    items: [
      { productId: "P-001", name: "Laptop", qty: 1, price: 1200 },
      { productId: "P-002", name: "Mouse", qty: 2, price: 20 },
    ],
  },
  {
    invoiceId: "INV-002",
    date: new Date().toISOString(),
    saleType: "Installment",
    items: [
      { productId: "P-004", name: "Smartphone", qty: 1, price: 900 },
      { productId: "P-006", name: "Smartwatch", qty: 1, price: 400 },
    ],
  },
  {
    invoiceId: "INV-003",
    date: new Date().toISOString(),
    saleType: "Cash",
    items: [{ productId: "P-010", name: "External Hard Drive", qty: 3, price: 100 }],
  },
];

export default function SalesHistory() {
  const [sales, setSales] = useState(() => {
    try {
      const raw = localStorage.getItem("sales_history_data");
      return raw ? JSON.parse(raw) : sampleSales;
    } catch {
      return sampleSales;
    }
  });

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [selectedSale, setSelectedSale] = useState(null);

  useEffect(() => {
    localStorage.setItem("sales_history_data", JSON.stringify(sales));
  }, [sales]);

  const filteredSales = useMemo(() => {
    let arr = sales.slice();

    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter(
        (s) =>
          s.invoiceId.toLowerCase().includes(q) ||
          s.items.some((i) => i.name.toLowerCase().includes(q))
      );
    }

    if (typeFilter !== "All") {
      arr = arr.filter((s) => s.saleType === typeFilter);
    }

    return arr;
  }, [sales, query, typeFilter]);

  const calculateTotal = (items) =>
    items.reduce((sum, item) => sum + item.qty * item.price, 0);

  return (
    <div className="p-4 min-h-screen text-white">
      <ToastContainer />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Sales History</h1>
          <p className="text-white/80">View all completed sales and invoices.</p>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 bg-black/30 p-2 rounded max-w-[90%]">
            <SearchIcon />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Invoice or Product"
              className="bg-transparent outline-none text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <label>Sale Type:</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="p-2 bg-black/30 border border-white/20 rounded text-white"
            >
              <option className="bg-black/90">All</option>
              <option className="bg-black/90">Cash</option>
              <option className="bg-black/90">Installment</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-x-auto">
          <table className="w-full text-white min-w-[800px]">
            <thead className="bg-white/20 text-left text-sm">
              <tr>
                <th className="p-3">Invoice</th>
                <th className="p-3">Product(s)</th>
                <th className="p-3">Qty</th>
                <th className="p-3">Total (Rs)</th>
                <th className="p-3">Sale Type</th>
                <th className="p-3">Date</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((s) => {
                const totalQty = s.items.reduce((sum, i) => sum + i.qty, 0);
                const totalValue = calculateTotal(s.items);
                return (
                  <tr
                    key={s.invoiceId}
                    className="border-t border-white/10 hover:bg-white/10"
                  >
                    <td className="p-3">{s.invoiceId}</td>
                    <td className="p-3">
                      {s.items.map((i) => i.name).join(", ")}
                    </td>
                    <td className="p-3">{totalQty}</td>
                    <td className="p-3">Rs {totalValue.toLocaleString()}</td>
                    <td className="p-3">{s.saleType}</td>
                    <td className="p-3">
                      {new Date(s.date).toLocaleDateString()}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => setSelectedSale(s)}
                        className="p-2 rounded bg-blue-600 hover:bg-blue-500 hover:cursor-pointer"
                      >
                        <VisibilityIcon fontSize="small" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* INVOICE MODAL (same as POS) */}
      {selectedSale && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-50 p-2 sm:p-4">
          <div className="bg-white/10 border border-white/30 backdrop-blur-xl rounded-2xl w-full max-w-[95%] sm:max-w-[600px] h-[80vh] shadow-xl text-white relative flex flex-col print:w-full print:h-auto print:bg-white print:text-black print:overflow-visible">
            <button
              className="absolute top-3 right-3 hover:cursor-pointer print:hidden cursor-pointer"
              onClick={() => setSelectedSale(null)}
            >
              <CloseIcon />
            </button>

            <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-4 scrollbar-hide print:overflow-visible print:p-5">
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
                <h2 className="text-lg sm:text-xl font-semibold">INVOICE</h2>
                <p className="text-white/70 print:text-black text-sm sm:text-base mt-1">
                  Invoice: {selectedSale.invoiceId} &nbsp;&nbsp; Date:{" "}
                  {new Date(selectedSale.date).toLocaleDateString()} &nbsp;&nbsp; Sale Type:{" "}
                  {selectedSale.saleType}
                </p>
              </div>

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
                  {selectedSale.items.map((item, i) => (
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

              <div className="mt-6 text-right">
                <p className="text-lg font-semibold print:text-black">
                  Total: Rs{" "}
                  {calculateTotal(selectedSale.items).toLocaleString()}/-
                </p>
              </div>

              <div className="mt-6 text-center text-white/70 text-xs sm:text-sm print:text-black">
                <p>Thank you for shopping with TechNova Electronics!</p>
                <p className="text-white/50 mt-2 print:text-gray-600">
                  This is a computer-generated invoice.
                </p>
              </div>
            </div>

            <div className="p-3 sm:p-4 border-t border-white/20 flex flex-wrap justify-center gap-2 print:hidden">
              <button
                onClick={() => toast.success("Invoice saved successfully!")}
                className="bg-green-700 hover:bg-green-600 px-3 sm:px-4 py-2 rounded-md font-semibold cursor-pointer text-sm sm:text-base"
              >
                💾 Save
              </button>

              <button
                onClick={() => {
                  const bodyOverflow = document.body.style.overflow;
                  document.body.style.overflow = "hidden";
                  window.print();
                  document.body.style.overflow = bodyOverflow;
                }}
                className="bg-blue-700 hover:bg-blue-600 px-3 sm:px-4 py-2 rounded-md font-semibold cursor-pointer text-sm sm:text-base"
              >
                🖨️ Print
              </button>

              <button
                onClick={() => setSelectedSale(null)}
                className="bg-red-700 hover:bg-red-600 px-3 sm:px-4 py-2 rounded-md font-semibold cursor-pointer text-sm sm:text-base"
              >
                ✖ Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
