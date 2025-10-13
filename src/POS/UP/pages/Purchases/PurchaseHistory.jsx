import React, { useState, useMemo, useRef, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";

const samplePurchases = [
  {
    purchaseId: "PU-001",
    name: "Laptop",
    category: "Electronics",
    company: "Dell",
    price: "120000",
    quantity: "2",
    supplier: "Tech Supplier",
    supplierContact: "+923001234567",
    description: "High-end gaming laptop",
    total: "240000.00",
    dateAdded: new Date().toISOString(),
  },
  {
    purchaseId: "PU-002",
    name: "Keyboard",
    category: "Accessories",
    company: "Logitech",
    price: "5000",
    quantity: "5",
    supplier: "Office Supplies",
    supplierContact: "+923009876543",
    description: "Mechanical keyboard",
    total: "25000.00",
    dateAdded: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
  },
];

export default function PurchaseHistory() {
  const [purchases, setPurchases] = useState(() => {
    try {
      const raw = localStorage.getItem("all_purchases_data");
      return raw ? JSON.parse(raw) : samplePurchases;
    } catch {
      return samplePurchases;
    }
  });

  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("All");
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    localStorage.setItem("all_purchases_data", JSON.stringify(purchases));
  }, [purchases]);

  const filteredPurchases = useMemo(() => {
    let arr = purchases;
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((p) =>
        [p.purchaseId, p.name, p.category, p.company, p.total]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    if (dateFilter !== "All") {
      const now = new Date();
      arr = arr.filter((p) => {
        const d = new Date(p.dateAdded);
        if (dateFilter === "Today") return d.toDateString() === now.toDateString();
        if (dateFilter === "Last 3 Days") {
          const threeDaysAgo = new Date();
          threeDaysAgo.setDate(now.getDate() - 2);
          return d >= threeDaysAgo && d <= now;
        }
        if (dateFilter === "Last Week") {
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 6);
          return d >= weekAgo && d <= now;
        }
        return true;
      });
    }

    return arr;
  }, [purchases, query, dateFilter]);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <div className="p-4 min-h-screen text-white">
      <ToastContainer />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Purchase History</h1>
          <p className="text-white/80">View all purchases and their details.</p>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 bg-black/30 p-2 rounded max-w-[90%]">
            <SearchIcon />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ID or Name"
              className="bg-transparent outline-none text-white w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <label>Filter by Date:</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="p-2 bg-black/30 border border-white/20 rounded text-white"
            >
              <option>All</option>
              <option>Today</option>
              <option>Last 3 Days</option>
              <option>Last Week</option>
            </select>
          </div>
        </div>

        {/* Purchase Table */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-x-auto">
          <table className="w-full text-white min-w-[900px]">
            <thead className="bg-white/20 text-left text-sm">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Category</th>
                <th className="p-3">Company</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Value</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPurchases.map((p) => (
                <tr key={p.purchaseId} className="border-t border-white/10 hover:bg-white/10">
                  <td className="p-3">{p.purchaseId}</td>
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3">{p.company}</td>
                  <td className="p-3">{p.quantity}</td>
                  <td className="p-3">Rs: {p.total}/-</td>
                  <td className="p-3">
                    <button
                      onClick={() => setSelectedPurchase(p)}
                      className="p-2 rounded bg-blue-600 hover:bg-blue-500 cursor-pointer"
                    >
                      <VisibilityIcon fontSize="small" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ Purchase Modal - Same layout as Product/Customer modals */}
      {selectedPurchase && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-50 p-3">
          <div className="bg-white/10 border border-white/30 backdrop-blur-xl rounded-2xl w-full max-w-[95%] sm:max-w-[650px] h-[80vh] shadow-xl text-white relative flex flex-col print:w-full print:h-auto print:bg-white print:text-black print:overflow-visible">
            
            {/* Close Icon */}
            <button
              className="absolute top-3 right-3 hover:cursor-pointer print:hidden"
              onClick={() => setSelectedPurchase(null)}
            >
              <CloseIcon />
            </button>

            {/* Modal Content */}
            <div ref={printRef} className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-4 scrollbar-hide print:p-5">
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold">ZUBI Electronics</h1>
                <p className="text-white/70 print:text-black text-sm sm:text-base">
                  Pakistan | 📞 +92 300 1358167
                </p>
                <hr className="border-white/30 my-4 print:border-black/40" />
                <h2 className="text-lg sm:text-xl font-semibold">PURCHASE DETAILS</h2>
                <p className="text-white/70 print:text-black text-sm sm:text-base mt-1">
                  Date: {formatDate(selectedPurchase.dateAdded)}
                </p>
              </div>

              <div className="space-y-2 text-sm sm:text-base leading-relaxed">
                <p><strong>ID:</strong> {selectedPurchase.purchaseId}</p>
                <p><strong>Name:</strong> {selectedPurchase.name}</p>
                <p><strong>Category:</strong> {selectedPurchase.category}</p>
                <p><strong>Company:</strong> {selectedPurchase.company}</p>
                <p><strong>Unit Price:</strong> Rs {selectedPurchase.price}/-</p>
                <p><strong>Quantity:</strong> {selectedPurchase.quantity}</p>
                <p><strong>Total Value:</strong> Rs {selectedPurchase.total}/-</p>
                <p><strong>Supplier:</strong> {selectedPurchase.supplier}</p>
                <p><strong>Supplier Contact:</strong> {selectedPurchase.supplierContact}</p>
                <p><strong>Description:</strong> {selectedPurchase.description}</p>
              </div>

              <div className="mt-8 text-center text-white/70 text-xs sm:text-sm print:text-black">
                <p>Purchase record provided by ZUBI Electronics.</p>
                <p className="text-white/50 mt-2 print:text-gray-600">
                  This is a computer-generated document.
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="p-3 sm:p-4 border-t border-white/20 flex flex-wrap justify-center gap-2 print:hidden">
              <button
                onClick={() => toast.success("Purchase details saved successfully!")}
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
                onClick={() => setSelectedPurchase(null)}
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
