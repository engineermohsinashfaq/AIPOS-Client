import React, { useEffect, useMemo, useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";

export default function ManageBranch() {
  const [branches, setBranches] = useState(() => {
    try {
      const raw = localStorage.getItem("manage_branches_data");
      const parsed = raw ? JSON.parse(raw) : [];
      return parsed.map((b) => ({
        ...b,
        users: (b.users || []).map((u) => ({ ...u, role: "admin" })),
      }));
    } catch (e) {
      return [];
    }
  });

  const [query, setQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("manage_branches_data", JSON.stringify(branches));
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

  return (
    <div className="p-2 min-h-screen text-black">
      <ToastContainer />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Manage Branches</h1>
          <p className="text-white/80">View all branches.</p>
        </div>

        {/* Search Filter */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-md p-2 flex items-center gap-2 w-full max-w-md">
          <SearchIcon className="text-white" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
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
                  <tr
                    key={b.id}
                    className="border-t border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="p-3 font-medium text-white">{b.name}</td>
                    <td className="p-3">{b.location || "—"}</td>
                    <td className="p-3">
                      {(b.users || [])
                        .map((u) => `${u.firstName} ${u.lastName} (${u.role})`)
                        .join(", ")}
                    </td>
                    <td className="p-3">{formatDate(b.created)}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        title="View"
                        onClick={() => {
                          setSelectedBranch(b);
                          setIsViewOpen(true);
                        }}
                        className="p-2 rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors cursor-pointer"
                      >
                        <VisibilityIcon fontSize="small" />
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
              <p>
                <strong>Name:</strong> {selectedBranch.name}
              </p>
              <p>
                <strong>Location:</strong> {selectedBranch.location || "—"}
              </p>
              <p>
                <strong>Users:</strong>{" "}
                {(selectedBranch.users || [])
                  .map((u) => `${u.firstName} ${u.lastName} (${u.role})`)
                  .join(", ")}
              </p>
              <p>
                <strong>Created:</strong> {formatDate(selectedBranch.created)}
              </p>
            </div>
            <div className="flex justify-end pt-4">
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
