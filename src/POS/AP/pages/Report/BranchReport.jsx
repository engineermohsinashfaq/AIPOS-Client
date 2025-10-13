import React, { useEffect, useMemo, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PrintIcon from "@mui/icons-material/Print";

export default function BranchReport() {
  const [branches, setBranches] = useState(() => {
    try {
      const raw = localStorage.getItem("branch_report_data");
      if (raw) return JSON.parse(raw);
      // Dummy data
      return [
        { id: "01", name: "Headquarters", location: "New York", users: [{ firstName: "John", lastName: "Doe" }], created: new Date().toISOString() },
        { id: "02", name: "Regional Office", location: "Los Angeles", users: [{ firstName: "Alice", lastName: "Brown" }], created: new Date().toISOString() },
        { id: "03", name: "Local Branch", location: "Chicago", users: [{ firstName: "Bob", lastName: "Johnson" }], created: new Date().toISOString() },
        { id: "04", name: "North Branch", location: "Boston", users: [{ firstName: "Eve", lastName: "Smith" }], created: new Date().toISOString() },
        { id: "05", name: "South Branch", location: "Miami", users: [{ firstName: "Tom", lastName: "White" }], created: new Date().toISOString() },
      ];
    } catch {
      return [];
    }
  });

  const [query, setQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("branch_report_data", JSON.stringify(branches));
  }, [branches]);

  const filtered = useMemo(() => {
    let arr = branches.slice();
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter(
        (b) =>
          (b.name || "").toLowerCase().includes(q) ||
          (b.location || "").toLowerCase().includes(q)
      );
    }
    arr.sort((a, b) => a.id?.localeCompare(b.id));
    return arr;
  }, [branches, query]);

  function formatDate(dateString) {
    if (!dateString) return "—";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  const handlePrint = (branch) => {
    const printContent = `
      <html>
        <head>
          <title>Branch Report</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            h2 { margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #000; padding: 6px; text-align: left; }
            th { background: #f0f0f0; }
          </style>
        </head>
        <body>
          <h2>Branch Report: ${branch.name}</h2>
          <p><strong>Location:</strong> ${branch.location}</p>
          <p><strong>Users:</strong> ${branch.users.map(u => `${u.firstName} ${u.lastName}`).join(", ")}</p>

          <h3>Summary</h3>
          <table>
            <tr><th>Products</th><th>Customers</th><th>Cash Customers</th><th>Installment Customers</th><th>Stock Inventory</th><th>Sales (Qty)</th><th>Profit / Loss (PKR)</th></tr>
            <tr>
              <td>10</td>
              <td>50</td>
              <td>20</td>
              <td>10</td>
              <td>200</td>
              <td>30</td>
              <td>1000</td>
            </tr>
          </table>
        </body>
      </html>
    `;
    const win = window.open("", "_blank");
    win.document.write(printContent);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div className="p-2 min-h-screen text-black">
      <ToastContainer />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Branch Report</h1>
          <p className="text-white/80">View summary of all branches.</p>
        </div>

        {/* Search Filter */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-md p-2 flex items-center gap-2 w-full max-w-md">
          <SearchIcon className="text-white" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search branches..."
            className="flex-1 outline-none bg-transparent text-white"
          />
        </div>

        {/* Branches Table */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-md overflow-x-auto">
          <table className="w-full text-white/90 min-w-[700px]">
            <thead className="bg-white/10 text-left text-sm">
              <tr>
                <th className="p-3">Branch</th>
                <th className="p-3">Location</th>
                <th className="p-3">Users</th>
                <th className="p-3">Created</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((b) => (
                  <tr key={b.id} className="border-t border-white/5 hover:bg-white/5 transition">
                    <td className="p-3 font-medium text-white">{b.name}</td>
                    <td className="p-3">{b.location || "—"}</td>
                    <td className="p-3">{(b.users || []).map(u => `${u.firstName} ${u.lastName}`).join(", ")}</td>
                    <td className="p-3">{formatDate(b.created)}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        title="View"
                        onClick={() => { setSelectedBranch(b); setIsViewOpen(true); }}
                        className="p-2 rounded bg-blue-600 text-white hover:bg-blue-500  hover:cursor-pointer transition-colors"
                      >
                        <VisibilityIcon fontSize="small" />
                      </button>
                      <button
                        title="Print"
                        onClick={() => handlePrint(b)}
                        className="p-2 rounded bg-green-600 text-white hover:bg-green-500 hover:cursor-pointer transition-colors"
                      >
                        <PrintIcon fontSize="small" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-3 text-center text-white/70">
                    No branch available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Branch Modal */}
      {isViewOpen && selectedBranch && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-6 w-full max-w-lg text-white">
            <h2 className="text-xl font-semibold mb-4">Branch Details</h2>
            <div className="space-y-2">
              <p><strong>Name:</strong> {selectedBranch.name}</p>
              <p><strong>Location:</strong> {selectedBranch.location || "—"}</p>
              <p><strong>Users:</strong> {(selectedBranch.users || []).map(u => `${u.firstName} ${u.lastName}`).join(", ")}</p>
              <p><strong>Created:</strong> {formatDate(selectedBranch.created)}</p>
            </div>
            <div className="flex justify-end pt-4 gap-2">
              <button
                onClick={() => setIsViewOpen(false)}
                className="px-4 py-2 rounded bg-cyan-800/80 hover:bg-cyan-900 cursor-pointer transition"
              >
                Close
              </button>
              
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
