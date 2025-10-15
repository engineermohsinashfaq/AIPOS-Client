import React, { useState, useMemo, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";

// Sample supplier data
const sampleSuppliers = [
  {
    id: "S-001",
    name: "ZUBI Traders",
    contactPerson: "Ahmed Khan",
    phone: "+92 300 1234567",
    email: "zubitraders@gmail.com",
    company: "ZUBI Electronics Supply",
    address: "Shop #12, Hall Road, Lahore",
    totalPurchases: 12,
    totalSpent: 1250000,
    created: "2025-09-25T10:00:00Z",
    description: "Main supplier for Samsung and LG electronic items.",
  },
  {
    id: "S-002",
    name: "MusicMart",
    contactPerson: "Bilal Ahmed",
    phone: "+92 320 9876543",
    email: "sales@musicmart.pk",
    company: "MusicMart Distributors",
    address: "Building #45, Saddar, Karachi",
    totalPurchases: 8,
    totalSpent: 700000,
    created: "2025-10-01T14:30:00Z",
    description: "Supplier for audio devices and accessories.",
  },
];

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState(() => {
    try {
      const raw = localStorage.getItem("all_suppliers_data");
      return raw ? JSON.parse(raw) : sampleSuppliers;
    } catch {
      return sampleSuppliers;
    }
  });

  const [query, setQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    localStorage.setItem("all_suppliers_data", JSON.stringify(suppliers));
  }, [suppliers]);

  // Filtering logic
  const filteredSuppliers = useMemo(() => {
    let arr = suppliers.slice();

    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((s) =>
        [s.id, s.name, s.company, s.contactPerson, s.email]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    if (filterDate) {
      arr = arr.filter((s) => {
        const createdDate = new Date(s.created).toISOString().slice(0, 10);
        return createdDate === filterDate;
      });
    }

    return arr;
  }, [suppliers, query, filterDate]);

  const handleDelete = (id) => {
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
    toast.success("Supplier deleted successfully!");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
  };

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Supplier Details</title>
          <style>
            body { font-family: Arial, sans-serif; color: #000; padding: 20px; }
            h1, h2, h3 { margin: 0; padding: 0; }
            hr { border: 1px dashed #000; margin: 10px 0; }
            ul { margin: 0 0 10px 20px; }
          </style>
        </head>
        <body>
          <h1>ZUBI Electronics</h1>
          <p>Contact: +923001358167</p>
          <p>Pakistan</p>
          <hr/>
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-4 min-h-screen text-white">
      <ToastContainer />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Heading */}
        <div>
          <h1 className="text-3xl font-bold mb-2">All Suppliers</h1>
          <p className="text-white/80">
            View, search, and manage all supplier details here.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search bar */}
          <div className="flex items-center gap-2 bg-black/30 p-2 rounded max-w-[90%]">
            <SearchIcon />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search suppliers"
              className="bg-transparent outline-none text-white w-full"
            />
          </div>

          {/* Date filter */}
          <div className="flex items-center gap-2">
            <label htmlFor="date" className="text-sm">
              Filter by Date:
            </label>
            <input
              type="date"
              id="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="p-2 bg-black/30 border border-white/20 rounded text-white hover:cursor-pointer"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate("")}
                className="px-3 py-2 rounded bg-red-600/80 hover:bg-red-700 text-white text-sm hover:cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Supplier Table */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-x-auto">
          <table className="w-full text-white min-w-[900px]">
            <thead className="bg-white/20 text-left text-sm">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Company</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Email</th>
                <th className="p-3">Total Purchases</th>
                <th className="p-3">Total Spent</th>
                <th className="p-3">Date Added</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((s) => (
                  <tr
                    key={s.id}
                    className="border-t border-white/10 hover:bg-white/10"
                  >
                    <td className="p-3">{s.id}</td>
                    <td className="p-3">{s.name}</td>
                    <td className="p-3">{s.company}</td>
                    <td className="p-3">{s.phone}</td>
                    <td className="p-3">{s.email}</td>
                    <td className="p-3">{s.totalPurchases}</td>
                    <td className="p-3">Rs {s.totalSpent}</td>
                    <td className="p-3">{formatDate(s.created)}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => setSelectedSupplier(s)}
                        className="p-2 rounded bg-blue-600 hover:bg-blue-500 hover:cursor-pointer"
                      >
                        <VisibilityIcon fontSize="small" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-2 rounded bg-red-600 text-white hover:bg-red-700 hover:cursor-pointer"
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="p-4 text-center text-white/70">
                    No suppliers found for this search or date.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Details Modal */}
      {selectedSupplier && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
          onClick={() => setSelectedSupplier(null)}
        >
          <div
            className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-lg p-6 w-full max-w-3xl text-white overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div ref={printRef}>
              <h2 className="text-2xl font-bold mb-4">Supplier Details</h2>

              <div className="grid grid-cols-2 gap-4">
                <p><strong>ID:</strong> {selectedSupplier.id}</p>
                <p><strong>Date Added:</strong> {formatDate(selectedSupplier.created)}</p>
                <p><strong>Name:</strong> {selectedSupplier.name}</p>
                <p><strong>Company:</strong> {selectedSupplier.company}</p>
                <p><strong>Contact Person:</strong> {selectedSupplier.contactPerson}</p>
                <p><strong>Phone:</strong> {selectedSupplier.phone}</p>
                <p><strong>Email:</strong> {selectedSupplier.email}</p>
                <p><strong>Address:</strong> {selectedSupplier.address}</p>
                <p><strong>Total Purchases:</strong> {selectedSupplier.totalPurchases}</p>
                <p><strong>Total Spent:</strong> Rs {selectedSupplier.totalSpent}</p>
              </div>

              <hr className="my-4 border-white/30" />

              <div>
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p>{selectedSupplier.description}</p>
              </div>
            </div>

            <div className="flex justify-between mt-6">
              <button
                onClick={() => setSelectedSupplier(null)}
                className="px-4 py-2 rounded bg-cyan-800/80 hover:bg-cyan-900 hover:cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded bg-green-700 hover:bg-green-800 hover:cursor-pointer"
              >
                Print
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
