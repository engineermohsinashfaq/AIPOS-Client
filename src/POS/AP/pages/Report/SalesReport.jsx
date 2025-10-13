import React, { useState, useMemo } from "react";
import SearchIcon from "@mui/icons-material/Search";
import StoreIcon from "@mui/icons-material/Store";
import PrintIcon from "@mui/icons-material/Print";

const SalesReport = () => {
  // Dummy branches
  const [branches] = useState([
    { id: "B01", name: "Headquarters", location: "New York" },
    { id: "B02", name: "Regional Office", location: "Los Angeles" },
    { id: "B03", name: "Local Branch", location: "Chicago" },
  ]);

  // Dummy sales data
  const [sales] = useState([
    {
      id: "P01",
      name: "Laptop",
      supplier: "TechCorp",
      qty: 5,
      value: 5000,
      profit: 500,
      date: new Date().toISOString(),
      customer: "John Doe",
      salesType: "Installment",
      branchId: "B01",
    },
    {
      id: "P02",
      name: "Printer",
      supplier: "PrintWorks",
      qty: 2,
      value: 800,
      profit: 120,
      date: new Date().toISOString(),
      customer: "Alice Brown",
      salesType: "Installment",
      branchId: "B02",
    },
    {
      id: "P03",
      name: "Monitor",
      supplier: "DisplayTech",
      qty: 3,
      value: 600,
      profit: 90,
      date: new Date().toISOString(),
      customer: "Bob Johnson",
      salesType: "Cash",
      branchId: "B01",
    },
  ]);

  const [query, setQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [customerTypeFilter, setCustomerTypeFilter] = useState("All"); // All, Cash, Installment

  const filteredBranches = useMemo(() => {
    const q = query.toLowerCase();
    return branches.filter(
      (b) =>
        b.name.toLowerCase().includes(q) || b.location.toLowerCase().includes(q)
    );
  }, [branches, query]);

  const branchSales = useMemo(() => {
    if (!selectedBranch) return [];
    return sales.filter(
      (s) =>
        s.branchId === selectedBranch.id &&
        (customerTypeFilter === "All" || s.salesType === customerTypeFilter)
    );
  }, [sales, selectedBranch, customerTypeFilter]);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
  };

  return (
    <div className="p-4 min-h-screen text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-1">Sales Report</h1>
          <p className="text-white/90">Select a branch to view its sales.</p>
        </div>

        {/* Search */}
        <div className="flex items-center max-w-md mb-6 gap-2 p-2 bg-white/10 backdrop-blur-md rounded-md">
          <SearchIcon className="text-white" />
          <input
            type="text"
            placeholder="Search branches..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-white placeholder-white/80"
          />
        </div>

        {/* Branch Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredBranches.map((branch) => (
            <div
              key={branch.id}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 flex flex-col gap-2 shadow-md hover:scale-105 transition-transform cursor-pointer"
              onClick={() => {
                setSelectedBranch(branch);
                setIsBranchModalOpen(true);
              }}
            >
              <div className="flex items-center gap-3">
                <StoreIcon fontSize="large" className="text-cyan-950" />
                <h2 className="text-xl font-semibold">{branch.name}</h2>
              </div>
              <p>
                <strong>Location:</strong> {branch.location}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Branch Modal */}
      {isBranchModalOpen && selectedBranch && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-4xl text-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {selectedBranch.name} Sales
              </h2>

              <div className="flex gap-2 items-center">
                <select
                  value={customerTypeFilter}
                  onChange={(e) => setCustomerTypeFilter(e.target.value)}
                  className="bg-white/20 text-white rounded px-2 py-2"
                >
                  <option className="bg-black/95 text-white" value="All">
                    All
                  </option>
                  <option className="bg-black/95 text-white" value="Cash">
                    Cash
                  </option>
                  <option
                    className="bg-black/95 text-white"
                    value="Installment"
                  >
                    Installment
                  </option>
                </select>

                {branchSales.length > 0 && (
                  <button
                    onClick={() => {
                      let content = `
                        <html>
                          <head>
                            <title>${selectedBranch.name} - Sales Report</title>
                            <style>
                              body { font-family: Arial; padding: 20px; }
                              h2 { margin-bottom: 10px; }
                              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                              th, td { border: 1px solid #000; padding: 6px; text-align: left; }
                              th { background: #f0f0f0; }
                            </style>
                          </head>
                          <body>
                            <h2>${selectedBranch.name} - Sales (${customerTypeFilter})</h2>
                            <table>
                              <thead>
                                <tr>
                                  <th>ID</th>
                                  <th>Name</th>
                                  <th>Supplier</th>
                                  <th>Qty</th>
                                  <th>Value</th>
                                  <th>Profit</th>
                                  <th>Date</th>
                                  <th>Customer</th>
                                  <th>Customer Type</th>
                                </tr>
                              </thead>
                              <tbody>
                      `;
                      branchSales.forEach((s) => {
                        content += `
                          <tr>
                            <td>${s.id}</td>
                            <td>${s.name}</td>
                            <td>${s.supplier}</td>
                            <td>${s.qty}</td>
                            <td>${s.value}</td>
                            <td>${s.profit}</td>
                            <td>${formatDate(s.date)}</td>
                            <td>${s.customer}</td>
                            <td>${s.salesType}</td>
                          </tr>
                        `;
                      });
                      content += `</tbody></table></body></html>`;
                      const win = window.open("", "_blank");
                      win.document.write(content);
                      win.document.close();
                      win.focus();
                      win.print();
                    }}
                    className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 flex  hover:cursor-pointer items-center gap-2"
                  >
                    <PrintIcon fontSize="small" /> Print
                  </button>
                )}
              </div>
            </div>

            {branchSales.length > 0 ? (
              <table className="w-full text-white/90 min-w-[600px]">
                <thead className="bg-white/10 text-left text-sm">
                  <tr>
                    <th className="p-2">ID</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Supplier</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Value</th>
                    <th className="p-2">Profit</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Customer</th>
                    <th className="p-2">Sale Type</th>
                  </tr>
                </thead>
                <tbody>
                  {branchSales.map((s) => (
                    <tr
                      key={s.id}
                      className="border-t border-white/5 hover:bg-white/5 transition"
                    >
                      <td className="p-2">{s.id}</td>
                      <td className="p-2">{s.name}</td>
                      <td className="p-2">{s.supplier}</td>
                      <td className="p-2">{s.qty}</td>
                      <td className="p-2">{s.value}</td>
                      <td className="p-2">{s.profit}</td>
                      <td className="p-2">{formatDate(s.date)}</td>
                      <td className="p-2">{s.customer}</td>
                      <td className="p-2">{s.salesType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No sales in this branch for the selected filter.</p>
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsBranchModalOpen(false)}
                className="px-4 py-2 rounded bg-cyan-800/80 hover:bg-cyan-900 hover:cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesReport;
