import React, { useState, useMemo, useEffect, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";

const sampleGuarantors = [
  {
    guarantorId: "G-001",
    firstName: "Ali",
    lastName: "Khan",
    contact: "+923001234567",
    cnic: "12345-1234567-1",
    city: "Lahore",
    address: "123 Model Town",
    dateAdded: new Date().toISOString(),
  },
  {
    guarantorId: "G-002",
    firstName: "Sara",
    lastName: "Ahmed",
    contact: "+923009876543",
    cnic: "54321-7654321-0",
    city: "Karachi",
    address: "456 Clifton Block",
    dateAdded: new Date().toISOString(),
  },
];

// ✅ Utility: format date nicely
const formatDateWithMonth = (dateString) => {
  const date = new Date(dateString);
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString(undefined, options);
};

export default function AllGuarantors() {
  const [guarantors, setGuarantors] = useState(() => {
    try {
      const raw = localStorage.getItem("all_guarantors_data");
      return raw ? JSON.parse(raw) : sampleGuarantors;
    } catch {
      return sampleGuarantors;
    }
  });

  const [query, setQuery] = useState("");
  const [selectedGuarantor, setSelectedGuarantor] = useState(null);

  useEffect(() => {
    localStorage.setItem("all_guarantors_data", JSON.stringify(guarantors));
  }, [guarantors]);

  const filteredGuarantors = useMemo(() => {
    if (!query.trim()) return guarantors;
    const q = query.toLowerCase();
    return guarantors.filter((g) =>
      [g.guarantorId, g.firstName, g.lastName, g.contact, g.cnic, g.city, g.address]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [guarantors, query]);

  const handleDelete = (id) => {
    setGuarantors((prev) => prev.filter((g) => g.guarantorId !== id));
    toast.success("Guarantor deleted successfully!");
  };

  const handlePrint = () => {
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.print();
    document.body.style.overflow = bodyOverflow;
  };

  return (
    <div className="p-4 min-h-[95vh] text-white">
      <ToastContainer autoClose={2000} />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Heading */}
        <div>
          <h1 className="text-3xl font-bold mb-2">All Guarantors</h1>
          <p className="text-white/80">View all guarantors and their details.</p>
        </div>

        {/* Search Filter */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 bg-black/30 p-2 rounded max-w-[90%]">
            <SearchIcon />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="bg-transparent outline-none text-white"
            />
          </div>
        </div>

        {/* Guarantors Table */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl overflow-x-auto">
          <table className="w-full text-white min-w-[900px]">
            <thead className="bg-white/20 text-left text-sm">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Contact</th>
                <th className="p-3">CNIC</th>
                <th className="p-3">City</th>
                <th className="p-3">Address</th>
                <th className="p-3">Date Added</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuarantors.map((g) => (
                <tr
                  key={g.guarantorId}
                  className="border-t border-white/10 hover:bg-white/10"
                >
                  <td className="p-3">{g.guarantorId}</td>
                  <td className="p-3">
                    {g.firstName} {g.lastName}
                  </td>
                  <td className="p-3">{g.contact}</td>
                  <td className="p-3">{g.cnic}</td>
                  <td className="p-3">{g.city}</td>
                  <td className="p-3">{g.address}</td>
                  <td className="p-3">{formatDateWithMonth(g.dateAdded)}</td>
                  <td className="p-3 flex gap-2">
                    <button
                      onClick={() => setSelectedGuarantor(g)}
                      className="p-2 rounded bg-blue-600 hover:bg-blue-500 hover:cursor-pointer"
                    >
                      <VisibilityIcon fontSize="small" />
                    </button>
                    <button
                      onClick={() => toast.info("Edit functionality coming soon")}
                      className="p-2 rounded bg-yellow-400 text-black hover:bg-yellow-300 hover:cursor-pointer"
                    >
                      <EditIcon fontSize="small" />
                    </button>
                    <button
                      onClick={() => handleDelete(g.guarantorId)}
                      className="p-2 rounded bg-red-600 text-white hover:bg-red-700 hover:cursor-pointer"
                    >
                      <DeleteIcon fontSize="small" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GUARANTOR DETAILS MODAL (Styled like POS Invoice) */}
      {selectedGuarantor && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-50 p-2 sm:p-4">
          <div className="bg-white/10 border border-white/30 backdrop-blur-xl rounded-2xl w-full max-w-[95%] sm:max-w-[600px] h-[85vh] shadow-xl text-white relative flex flex-col print:w-full print:h-auto print:bg-white print:text-black print:overflow-visible">
            <button
              className="absolute top-3 right-3 hover:cursor-pointer print:hidden cursor-pointer"
              onClick={() => setSelectedGuarantor(null)}
            >
              <CloseIcon />
            </button>

            <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-4 scrollbar-hide print:p-5">
              <div className="text-center mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold">
                  ZUBI Electronics
                </h1>
                <p className="text-white/70 print:text-black text-sm sm:text-base">
                  Pakistan | 📞 +92 300 1358167
                </p>
                <hr className="border-white/30 my-4 print:border-black/40" />
                <h2 className="text-lg sm:text-xl font-semibold">
                  GUARANTOR DETAILS
                </h2>
                
              </div>

              <div className="space-y-2 text-sm sm:text-base leading-relaxed">
                <p><strong>ID:</strong> {selectedGuarantor.guarantorId}</p>
                <p>
                  <strong>Name:</strong> {selectedGuarantor.firstName}{" "}
                  {selectedGuarantor.lastName}
                </p>
                <p><strong>Contact:</strong> {selectedGuarantor.contact}</p>
                <p><strong>CNIC:</strong> {selectedGuarantor.cnic}</p>
                <p><strong>City:</strong> {selectedGuarantor.city}</p>
                <p><strong>Address:</strong> {selectedGuarantor.address}</p>
                <p>
                  <strong>Date Added:</strong>{" "}
                  {formatDateWithMonth(selectedGuarantor.dateAdded)}
                </p>
              </div>

              <div className="mt-8 text-center text-white/70 text-xs sm:text-sm print:text-black">
                <p>Thank you for verifying with ZUBI Electronics.</p>
                <p className="text-white/50 mt-2 print:text-gray-600">
                  This is a computer-generated document.
                </p>
              </div>
            </div>

            <div className="p-3 sm:p-4 border-t border-white/20 flex flex-wrap justify-center gap-2 print:hidden">
              <button
                onClick={() => toast.success("Guarantor details saved successfully!")}
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
                onClick={() => setSelectedGuarantor(null)}
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
