import React, { useState } from "react";
import BackupIcon from "@mui/icons-material/Backup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SystemBackup() {
  const [branch, setBranch] = useState("");
  const [latestBackup, setLatestBackup] = useState(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  const branches = ["Head Office", "Branch A", "Branch B", "Branch C"];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, "0")}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}-${date.getFullYear()}`;
  };

  // ✅ Create Backup
  const handleCreateBackup = () => {
    if (!branch) {
      toast.error("Please select a branch before creating a backup.", {
        position: "top-right",
        autoClose: 2000,
        theme: "dark",
      });
      return;
    }

    const newBackup = {
      id: `BKP${Math.floor(Math.random() * 900 + 100)}`,
      branch,
      date: new Date().toISOString(),
      size: `${(Math.random() * 2 + 0.5).toFixed(2)} GB`,
    };

    setLatestBackup(newBackup);
    setIsDownloadModalOpen(true);

    toast.success("Backup created successfully!", {
      position: "top-right",
      autoClose: 2000,
      theme: "dark",
    });
  };

  // ✅ Download Backup
  const handleDownload = (backup) => {
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${backup.branch.replace(/\s/g, "_")}_backup.json`;
    link.click();
    URL.revokeObjectURL(url);

    toast.info("Backup file downloaded!", {
      position: "top-right",
      autoClose: 2000,
      theme: "dark",
    });
  };

  // ✅ Print Backup Report
  const handlePrint = (backup) => {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head><title>Backup Report</title></head>
        <body style="font-family: sans-serif; padding: 20px;">
          <h2>Backup Report</h2>
          <p><strong>Branch:</strong> ${backup.branch}</p>
          <p><strong>Backup ID:</strong> ${backup.id}</p>
          <p><strong>Date:</strong> ${formatDate(backup.date)}</p>
          <p><strong>Size:</strong> ${backup.size}</p>
          <hr/>
          <p>Backup created successfully and verified.</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();

    toast.success("Backup report sent to printer!", {
      position: "bottom-center",
      autoClose: 2000,
      theme: "dark",
    });
  };

  return (
    <div className="p-6 h-[100%] text-white flex flex-col items-center justify-center">
      {/* ✅ Dark Toasts with 2s Duration */}
      <ToastContainer theme="dark" autoClose={2000} />

      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl flex flex-col items-center  shadow-lg p-8 max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4">System Backup</h1>
        <p className="text-white/80 mb-6">
          Select a branch and create a secure system backup.
        </p>

        {/* Branch Selection */}
        <select
          className="w-full bg-white/10 text-white border border-white/30 rounded p-2 mb-6 appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
        >
          <option value="" disabled className="bg-black/90">
            Select Branch
          </option>
          {branches.map((b) => (
            <option key={b} value={b} className="bg-black/90 text-white">
              {b}
            </option>
          ))}
        </select>

        {/* Create Backup Button */}
        <button
          className="flex items-center justify-center border border-white/40 gap-2 w-1/2 bg-cyan-800/80 hover:bg-cyan-900 px-4 py-2 rounded-md text-lg font-semibold transition cursor-pointer"
          onClick={handleCreateBackup}
        >
          Backup
        </button>
      </div>

      {/* Download Modal */}
      {isDownloadModalOpen && latestBackup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-md  z-50">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 w-full max-w-md text-white text-center">
            <h2 className="text-2xl font-bold mb-3">Backup Created!</h2>
            <p className="mb-2">
              <strong>Branch:</strong> {latestBackup.branch}
            </p>
            <p className="mb-2">
              <strong>Date:</strong> {formatDate(latestBackup.date)}
            </p>
            <p className="mb-6">
              <strong>Size:</strong> {latestBackup.size}
            </p>

            <div className="flex justify-between gap-3">
              <button
                className="flex border border-white/40 items-center justify-center gap-2 px-4 py-2 rounded bg-green-600 hover:bg-green-500 transition w-1/2 cursor-pointer text-center"
                onClick={() => handleDownload(latestBackup)}
              >
                Download
              </button>
              <button
                className="flex border border-white/40 items-center justify-center gap-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 transition w-1/2 cursor-pointer text-center"
                onClick={() => handlePrint(latestBackup)}
              >
                Print
              </button>
            </div>

            <button
              className="mt-5 border border-white/40 w-full px-4 py-2 rounded bg-red-600 hover:bg-red-500 transition cursor-pointer"
              onClick={() => setIsDownloadModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
