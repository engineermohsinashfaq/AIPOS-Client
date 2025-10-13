import React, { useState } from "react";
import BackupIcon from "@mui/icons-material/Backup";
import RestoreIcon from "@mui/icons-material/Restore";
import DeleteIcon from "@mui/icons-material/Delete";
import PrintIcon from "@mui/icons-material/Print";

export default function SystemBackup() {
  // Dummy backup data
  const [backups, setBackups] = useState([
    {
      id: "BKP01",
      name: "Daily Backup",
      date: new Date().toISOString(),
      size: "500MB",
    },
    {
      id: "BKP02",
      name: "Weekly Backup",
      date: new Date().toISOString(),
      size: "2GB",
    },
    {
      id: "BKP03",
      name: "Monthly Backup",
      date: new Date().toISOString(),
      size: "8GB",
    },
  ]);

  const [selectedBackup, setSelectedBackup] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
  };

  return (
    <div className="p-4 min-h-screen text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-1">System Backup</h1>
          <p className="text-white/90">Manage system backups and restore points.</p>
        </div>

        {/* Backup Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {backups.map((backup) => (
            <div
              key={backup.id}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-4 flex flex-col gap-2 shadow-md hover:scale-105 transition-transform cursor-pointer"
              onClick={() => {
                setSelectedBackup(backup);
                setIsModalOpen(true);
              }}
            >
              <div className="flex items-center gap-3">
                <BackupIcon fontSize="large" className="text-green-400" />
                <h2 className="text-xl font-semibold">{backup.name}</h2>
              </div>
              <p>
                <strong>Date:</strong> {formatDate(backup.date)}
              </p>
              <p>
                <strong>Size:</strong> {backup.size}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Backup Modal */}
      {isModalOpen && selectedBackup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-md text-white">
            <h2 className="text-2xl font-bold mb-4">{selectedBackup.name}</h2>
            <p>
              <strong>ID:</strong> {selectedBackup.id}
            </p>
            <p>
              <strong>Date:</strong> {formatDate(selectedBackup.date)}
            </p>
            <p>
              <strong>Size:</strong> {selectedBackup.size}
            </p>

            <div className="flex justify-between mt-6 gap-2">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 transition"
                onClick={() => alert(`Restoring ${selectedBackup.name}...`)}
              >
                <RestoreIcon /> Restore
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded bg-red-600 hover:bg-red-500 transition"
                onClick={() => alert(`Deleting ${selectedBackup.name}...`)}
              >
                <DeleteIcon /> Delete
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded bg-green-600 hover:bg-green-500 transition"
                onClick={() => alert(`Printing ${selectedBackup.name} info...`)}
              >
                <PrintIcon /> Print
              </button>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
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
