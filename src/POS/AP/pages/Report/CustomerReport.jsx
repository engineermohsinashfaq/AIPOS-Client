import React, { useEffect, useMemo, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PrintIcon from "@mui/icons-material/Print";
import StoreIcon from "@mui/icons-material/Store";

export default function CustomerReport() {
  // Dummy branch data
  const [branches] = useState(() => {
    try {
      const raw = localStorage.getItem("branches_data");
      if (raw) return JSON.parse(raw);

      return [
        { id: "B01", name: "Headquarters", location: "New York" },
        { id: "B02", name: "Regional Office", location: "Los Angeles" },
        { id: "B03", name: "Local Branch", location: "Chicago" },
        { id: "B04", name: "North Branch", location: "Boston" },
        { id: "B05", name: "South Branch", location: "Miami" },
      ];
    } catch {
      return [];
    }
  });

  // Dummy customer data with branch association
  const [customers] = useState([
    {
      id: "C01",
      name: "John Doe",
      contact: "123456789",
      location: "New York",
      joined: new Date().toISOString(),
      branchId: "B01",
    },
    {
      id: "C02",
      name: "Alice Brown",
      contact: "987654321",
      location: "Los Angeles",
      joined: new Date().toISOString(),
      branchId: "B02",
    },
    {
      id: "C03",
      name: "Bob Johnson",
      contact: "555666777",
      location: "Chicago",
      joined: new Date().toISOString(),
      branchId: "B03",
    },
    {
      id: "C04",
      name: "Eve Smith",
      contact: "222333444",
      location: "Boston",
      joined: new Date().toISOString(),
      branchId: "B04",
    },
    {
      id: "C05",
      name: "Tom White",
      contact: "999888777",
      location: "Miami",
      joined: new Date().toISOString(),
      branchId: "B05",
    },
  ]);

  const [query, setQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const filteredBranches = useMemo(() => {
    const q = query.toLowerCase();
    return branches.filter(
      (b) =>
        b.name.toLowerCase().includes(q) || b.location.toLowerCase().includes(q)
    );
  }, [branches, query]);

  const branchCustomers = selectedBranch
    ? customers.filter((c) => c.branchId === selectedBranch.id)
    : [];

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
          <h1 className="text-3xl font-bold mb-1">Customer Report</h1>
          <p className="text-white/90">
            Select a branch to view its customers.
          </p>
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
                <StoreIcon fontSize="large" className="text-cyan-950  " />
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
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-2xl text-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {selectedBranch.name} Customers
              </h2>
              {branchCustomers.length > 0 && (
                <button
                  onClick={() => {
                    let content = `
                      <html>
                        <head>
                          <title>${selectedBranch.name} - Customer Report</title>
                          <style>
                            body { font-family: Arial; padding: 20px; }
                            h2 { margin-bottom: 10px; }
                            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                            th, td { border: 1px solid #000; padding: 6px; text-align: left; }
                            th { background: #f0f0f0; }
                          </style>
                        </head>
                        <body>
                          <h2>${selectedBranch.name} - Customers</h2>
                          <table>
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Contact</th>
                                <th>Location</th>
                                <th>Joined</th>
                              </tr>
                            </thead>
                            <tbody>
                    `;
                    branchCustomers.forEach((c) => {
                      content += `
                        <tr>
                          <td>${c.id}</td>
                          <td>${c.name}</td>
                          <td>${c.contact}</td>
                          <td>${c.location}</td>
                          <td>${formatDate(c.joined)}</td>
                        </tr>
                      `;
                    });
                    content += `
                            </tbody>
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
                  className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 hover:cursor-pointer transition flex items-center gap-2"
                >
                  <PrintIcon fontSize="small" /> Print
                </button>
              )}
            </div>

            {branchCustomers.length > 0 ? (
              <table className="w-full text-white/90 min-w-[500px]">
                <thead className="bg-white/10 text-left text-sm">
                  <tr>
                    <th className="p-2">Name</th>
                    <th className="p-2">Contact</th>
                    <th className="p-2">Location</th>
                    <th className="p-2">Joined</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {branchCustomers.map((c) => (
                    <tr
                      key={c.id}
                      className="border-t border-white/5 hover:bg-white/5 transition"
                    >
                      <td className="p-2">{c.name}</td>
                      <td className="p-2">{c.contact}</td>
                      <td className="p-2">{c.location}</td>
                      <td className="p-2">{formatDate(c.joined)}</td>
                      <td className="p-2 flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedCustomer(c);
                            setIsCustomerModalOpen(true);
                          }}
                          className="p-1 rounded bg-blue-600 hover:bg-blue-500 hover:cursor-pointer transition-colors"
                        >
                          <VisibilityIcon fontSize="small" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No customers in this branch.</p>
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsBranchModalOpen(false)}
                className="px-4 py-2 rounded bg-cyan-800/80 hover:bg-cyan-900 hover:cursor-pointer transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {isCustomerModalOpen && selectedCustomer && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-md text-white">
            <h2 className="text-xl font-semibold mb-4">
              {selectedCustomer.name}
            </h2>
            <p>
              <strong>ID:</strong> {selectedCustomer.id}
            </p>
            <p>
              <strong>Contact:</strong> {selectedCustomer.contact}
            </p>
            <p>
              <strong>Location:</strong> {selectedCustomer.location}
            </p>
            <p>
              <strong>Joined:</strong> {formatDate(selectedCustomer.joined)}
            </p>
            <div className="flex justify-end mt-4 gap-2">
              <button
                onClick={() => setIsCustomerModalOpen(false)}
                className="px-4 py-2 rounded bg-cyan-800/80 hover:bg-cyan-900 transition"
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
