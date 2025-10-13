import React, { useState, useMemo } from "react";
import SearchIcon from "@mui/icons-material/Search";
import StoreIcon from "@mui/icons-material/Store";
import PrintIcon from "@mui/icons-material/Print";

const StockReport = () => {
  const [branches] = useState([
    { id: "B01", name: "Headquarters", location: "New York" },
    { id: "B02", name: "Regional Office", location: "Los Angeles" },
    { id: "B03", name: "Local Branch", location: "Chicago" },
  ]);

  const [stock] = useState([
    { id: "P01", name: "Laptop", supplier: "TechCorp", category: "Electronics", qty: 15, value: 1500, branchId: "B01" },
    { id: "P02", name: "Printer", supplier: "PrintWorks", category: "Electronics", qty: 10, value: 400, branchId: "B02" },
    { id: "P03", name: "Monitor", supplier: "DisplayTech", category: "Electronics", qty: 8, value: 200, branchId: "B01" },
    { id: "P04", name: "Chair", supplier: "FurniCo", category: "Furniture", qty: 20, value: 50, branchId: "B03" },
    { id: "P05", name: "Desk", supplier: "FurniCo", category: "Furniture", qty: 10, value: 120, branchId: "B03" },
    { id: "P06", name: "Mouse", supplier: "TechCorp", category: "Electronics", qty: 50, value: 25, branchId: "B01" },
    { id: "P07", name: "Keyboard", supplier: "TechCorp", category: "Electronics", qty: 40, value: 35, branchId: "B02" },
    { id: "P08", name: "Notebook", supplier: "OfficeSupplies", category: "Stationery", qty: 100, value: 5, branchId: "B02" },
    { id: "P09", name: "Pen", supplier: "OfficeSupplies", category: "Stationery", qty: 200, value: 1, branchId: "B03" },
    { id: "P10", name: "Projector", supplier: "TechCorp", category: "Electronics", qty: 5, value: 800, branchId: "B01" },
  ]);

  const [query, setQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All"); // New category filter

  const filteredBranches = useMemo(() => {
    const q = query.toLowerCase();
    return branches.filter(
      (b) =>
        b.name.toLowerCase().includes(q) || b.location.toLowerCase().includes(q)
    );
  }, [branches, query]);

  const branchStock = useMemo(() => {
    if (!selectedBranch) return [];
    return stock.filter(
      (s) => s.branchId === selectedBranch.id && (categoryFilter === "All" || s.category === categoryFilter)
    );
  }, [stock, selectedBranch, categoryFilter]);

  const totalValue = useMemo(() => {
    return branchStock.reduce((sum, s) => sum + s.qty * s.value, 0);
  }, [branchStock]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = stock.map((s) => s.category);
    return ["All", ...new Set(cats)];
  }, [stock]);

  return (
    <div className="p-4 min-h-screen text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Stock Report</h1>
          <p className="text-white/90">Select a branch to view its stock.</p>
        </div>

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

      {isBranchModalOpen && selectedBranch && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-4xl text-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedBranch.name} Stock</h2>

              <div className="flex gap-2 items-center">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-white/20 text-white rounded px-2 py-2"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-black/95 text-white">
                      {cat}
                    </option>
                  ))}
                </select>

                {branchStock.length > 0 && (
                  <button
                    onClick={() => {
                      let content = `
                        <html>
                          <head>
                            <title>${selectedBranch.name} - Stock Report</title>
                            <style>
                              body { font-family: Arial; padding: 20px; }
                              h2 { margin-bottom: 10px; }
                              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                              th, td { border: 1px solid #000; padding: 6px; text-align: left; }
                              th { background: #f0f0f0; }
                              tfoot td { font-weight: bold; }
                            </style>
                          </head>
                          <body>
                            <h2>${selectedBranch.name} - Stock (${categoryFilter})</h2>
                            <table>
                              <thead>
                                <tr>
                                  <th>ID</th>
                                  <th>Name</th>
                                  <th>Category</th>
                                  <th>Supplier</th>
                                  <th>Qty</th>
                                  <th>Value</th>
                                  <th>Total</th>
                                </tr>
                              </thead>
                              <tbody>
                      `;
                      branchStock.forEach((s) => {
                        const totalPerProduct = s.qty * s.value;
                        content += `
                          <tr>
                            <td>${s.id}</td>
                            <td>${s.name}</td>
                            <td>${s.category}</td>
                            <td>${s.supplier}</td>
                            <td>${s.qty}</td>
                            <td>${s.value}</td>
                            <td>${totalPerProduct}</td>
                          </tr>
                        `;
                      });
                      content += `
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colspan="6">Total</td>
                            <td>${totalValue}</td>
                          </tr>
                        </tfoot>
                        </table>
                        </body>
                        </html>
                      `;
                      const win = window.open("", "_blank");
                      win.document.write(content);
                      win.document.close();
                      win.focus();
                      win.print();
                    }}
                    className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 flex items-center gap-2"
                  >
                    <PrintIcon fontSize="small" /> Print
                  </button>
                )}
              </div>
            </div>

            {branchStock.length > 0 ? (
              <table className="w-full text-white/90 min-w-[600px]">
                <thead className="bg-white/10 text-left text-sm">
                  <tr>
                    <th className="p-2">ID</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Supplier</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Value</th>
                    <th className="p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {branchStock.map((s) => (
                    <tr key={s.id} className="border-t border-white/5 hover:bg-white/5 transition">
                      <td className="p-2">{s.id}</td>
                      <td className="p-2">{s.name}</td>
                      <td className="p-2">{s.category}</td>
                      <td className="p-2">{s.supplier}</td>
                      <td className="p-2">{s.qty}</td>
                      <td className="p-2">{s.value}</td>
                      <td className="p-2">{s.qty * s.value}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold">
                    <td colSpan="6" className="p-2">Total</td>
                    <td className="p-2">{totalValue}</td>
                  </tr>
                </tfoot>
              </table>
            ) : (
              <p>No stock in this branch for the selected category.</p>
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

export default StockReport;
