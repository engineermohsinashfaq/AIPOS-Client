import React, { useState, useMemo, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { X } from "lucide-react";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

const formatDateTime = (dateInput) => {
  if (!dateInput) return "—";

  try {
    let date;

    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === "string") {
      if (dateInput.includes("/")) {
        const parts = dateInput.split(" ");
        const datePart = parts[0];
        const timePart = parts[1];

        if (datePart.includes("/")) {
          const [day, month, year] = datePart.split("/");
          if (timePart) {
            const [hours, minutes, seconds] = timePart.split(":");
            date = new Date(
              year,
              month - 1,
              day,
              hours || 0,
              minutes || 0,
              seconds || 0
            );
          } else {
            date = new Date(year, month - 1, day);
          }
        }
      } else {
        date = new Date(dateInput);
      }
    } else {
      date = new Date(dateInput);
    }

    if (isNaN(date.getTime())) {
      return "—";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error("Date formatting error:", error);
    return "—";
  }
};

const formatShortDate = (dateString) => {
  if (!dateString) return "—";

  try {
    const fullDate = formatDateTime(dateString);
    if (fullDate === "—") return "—";
    return fullDate.split(" ")[0];
  } catch (error) {
    return "—";
  }
};

const extractSuppliersFromData = () => {
  try {
    const products = JSON.parse(localStorage.getItem("products") || "[]");
    const purchaseHistory = JSON.parse(
      localStorage.getItem("purchaseHistory") || "[]"
    );

    const allSuppliers = [];
    const seenSuppliers = new Map();

    [...products, ...purchaseHistory].forEach((item) => {
      if (item.supplier && item.supplierContact) {
        const supplierKey = `${item.supplier}-${item.supplierContact}`;

        const existing = seenSuppliers.get(supplierKey);

        const currentUpdatedAt = item.updatedAt
          ? new Date(item.updatedAt).getTime()
          : 0;
        const existingUpdatedAt = existing?.updatedAt
          ? new Date(existing.updatedAt).getTime()
          : 0;

        if (!existing) {
          const newEntry = {
            name: item.supplier,
            contact: item.supplierContact,
            company: item.company || "—",
            whatsapp: item.supplierContact,
            email: item.email || "",
            address: item.address || "",
            dateAdded:
              item.savedOn || item.dateAdded || formatDateTime(new Date()),
            id: supplierKey,
            updatedAt: item.updatedAt || null,
            lastUpdateMessage: item.lastUpdateMessage || null,
          };
          seenSuppliers.set(supplierKey, newEntry);
          allSuppliers.push(newEntry);
        } else if (currentUpdatedAt > existingUpdatedAt) {
          existing.updatedAt = item.updatedAt;
          existing.lastUpdateMessage = item.lastUpdateMessage;
          existing.dateAdded =
            existing.dateAdded ||
            item.savedOn ||
            item.dateAdded ||
            formatDateTime(new Date());

          const index = allSuppliers.findIndex((s) => s.id === supplierKey);
          if (index !== -1) {
            allSuppliers[index] = { ...existing };
          }
        }
      }
    });

    return Array.from(seenSuppliers.values());
  } catch (error) {
    console.error("Error extracting suppliers:", error);
    return [];
  }
};

const updateSupplierInSourceData = (originalSupplier, updatedContact) => {
  try {
    let hasUpdates = false;
    const nowFormatted = formatDateTime(new Date());

    const updateStorageArray = (key, original, updated) => {
      const array = JSON.parse(localStorage.getItem(key) || "[]");
      const updatedArray = array.map((item) => {
        if (
          item.supplier === original.name &&
          item.supplierContact === original.contact
        ) {
          hasUpdates = true;
          return {
            ...item,
            supplierContact: updated,
            updatedAt: nowFormatted,
            lastUpdateMessage: "Contact number updated",
            company: original.company,
            name: original.name,
          };
        }
        return item;
      });
      return updatedArray;
    };

    const updatedProducts = updateStorageArray(
      "products",
      originalSupplier,
      updatedContact
    );
    localStorage.setItem("products", JSON.stringify(updatedProducts));

    const updatedPurchaseHistory = updateStorageArray(
      "purchaseHistory",
      originalSupplier,
      updatedContact
    );
    localStorage.setItem(
      "purchaseHistory",
      JSON.stringify(updatedPurchaseHistory)
    );

    return hasUpdates;
  } catch (error) {
    console.error("Error updating supplier in source data:", error);
    return false;
  }
};

export default function AllSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [form, setForm] = useState({});
  const [originalSupplier, setOriginalSupplier] = useState(null);
  const [formChanges, setFormChanges] = useState({});

  const loadSuppliers = () => {
    const extractedSuppliers = extractSuppliersFromData();
    setSuppliers(extractedSuppliers);
  };

  useEffect(() => {
    loadSuppliers();

    const handleStorageChange = () => {
      loadSuppliers();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const filteredSuppliers = useMemo(() => {
    let arr = suppliers.filter((s) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;

      const combined = [
        s.name,
        s.contact,
        s.company,
        s.whatsapp,
        s.address,
      ]
        .map((v) => String(v || "").toLowerCase())
        .join(" ");

      return combined.includes(q);
    });

    return arr.sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.dateAdded).getTime();
      const dateB = new Date(b.updatedAt || b.dateAdded).getTime();
      return dateB - dateA;
    });
  }, [suppliers, query]);

  const isFormModified = useMemo(() => {
    if (!originalSupplier || !form) return false;

    const originalValue = String(originalSupplier.contact || "").trim();
    const formValue = String(form.contact || "").trim();

    if (originalValue !== formValue) {
      setFormChanges({
        contact: {
          from: originalValue,
          to: formValue,
        },
      });
      return true;
    }

    setFormChanges({});
    return false;
  }, [form, originalSupplier]);

  const toastConfig = {
    position: "top-right",
    theme: "dark",
    autoClose: 2000,
  };
  const notifySuccess = (msg) => toast.success(msg, toastConfig);
  const notifyError = (msg) => toast.error(msg, toastConfig);

  const initials = (s) => {
    const nameParts = s.name.split(" ");
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase();
    }
    return s.name.charAt(0).toUpperCase();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "contact") {
      let val = value.replace(/[^\d+]/g, "");
      if (val && val[0] !== "+") val = "+" + val.replace(/\+/g, "");
      setForm((s) => ({ ...s, [name]: val }));
      return;
    }
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!form.contact?.trim()) return notifyError("Contact number is required");

    const nowFormatted = formatDateTime(new Date());

    const updatedForm = {
      ...form,
      contact: form.contact.trim(),
      whatsapp: form.contact.trim(),
      updatedAt: nowFormatted,
      lastUpdateMessage: "Contact number updated",
    };

    const updateSuccess = updateSupplierInSourceData(
      originalSupplier,
      form.contact.trim()
    );

    if (!updateSuccess) {
      notifyError("Failed to update supplier data in source records.");
      return;
    }

    setSuppliers((prev) =>
      prev.map((s) => (s.id === originalSupplier.id ? updatedForm : s))
    );

    setIsModalOpen(false);
    setOriginalSupplier(null);
    setFormChanges({});
    notifySuccess(`${form.name}'s contact updated successfully!`);

    window.dispatchEvent(new Event("storage"));
  };

  const handleWhatsApp = (phone) => {
    const cleanPhone = phone.replace("+", "");
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  };

  const handlePrint = () => {
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.print();
    document.body.style.overflow = bodyOverflow;
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setOriginalSupplier(null);
    setFormChanges({});
  };

  return (
    <div className="p-2 min-h-screen text-white">
      <ToastContainer position="top-right" theme="dark" autoClose={2000} />

      <div className="max-w-8xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">ALL SUPPLIERS</h1>
          <p className="text-white/80">VIEW AND MANAGE SUPPLIER ACCOUNTS.</p>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-md p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2 md:col-span-3">
            <SearchIcon className="text-white" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH SUPPLIERS..."
              className="flex-1 outline-none bg-transparent text-white placeholder-white/60"
            />
          </div>

          <div className="text-white/80 text-lg flex items-center justify-between">
            <span>TOTAL: {filteredSuppliers.length}</span>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-md overflow-x-auto scrollbar-hide">
          <table className="w-full text-white/90 min-w-[800px]">
            <thead className="bg-white/10 text-left text-sm">
              <tr>
                <th className="p-3">SUPPLIER</th>
                <th className="p-3">CONTACT</th>
                <th className="p-3">COMPANY</th>
                <th className="p-3">WHATSAPP</th>
                <th className="p-3">DATE ADDED</th>
                <th className="p-3">ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((s, index) => (
                  <tr
                    key={s.id || index}
                    className="border-t border-white/15 hover:bg-white/5 transition"
                  >
                    <td className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <span className="font-medium text-white">
                          {initials(s)}
                        </span>
                      </div>
                      <div className="font-medium text-white">
                        {s.name.toUpperCase()}
                      </div>
                    </td>
                    <td className="p-3">{s.contact}</td>
                    <td className="p-3">{s.company.toUpperCase()}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleWhatsApp(s.whatsapp)}
                        className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors cursor-pointer"
                        title="OPEN WHATSAPP"
                      >
                        <WhatsAppIcon fontSize="small" />
                        <span>CHAT</span>
                      </button>
                    </td>
                    <td className="p-3 text-sm">
                      {formatShortDate(s.dateAdded)}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        title="VIEW SUPPLIER DETAILS"
                        onClick={() => {
                          setSelectedSupplier(s);
                          setIsViewOpen(true);
                        }}
                        className="p-2 rounded bg-cyan-900 text-white hover:bg-cyan-950 transition-colors cursor-pointer"
                      >
                        <VisibilityIcon fontSize="small" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-white/60">
                    {suppliers.length === 0
                      ? "NO SUPPLIERS FOUND IN PURCHASE DATA. ADD SOME PURCHASES FIRST."
                      : "NO SUPPLIERS MATCH YOUR SEARCH."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}

      {isViewOpen && selectedSupplier && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 p-2 md:p-4 backdrop-blur-md print:p-0">
          <div className="bg-white text-black rounded-lg w-full max-w-md mx-auto max-h-[95vh] overflow-y-auto scrollbar-hide relative font-sans text-sm border border-gray-300">
            <div className="p-4 space-y-3">
              <div className="text-center border-b border-dashed border-gray-300 pb-3 mb-3">
                <h2 className="text-xl font-bold tracking-wider text-gray-900">
                  ZUBI ELECTRONICS
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  SUPPLIER INFORMATION
                </p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">COMPANY:</span>
                  <span className="text-gray-900 text-right">
                    {selectedSupplier.company.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">SUPPLIER:</span>
                  <span className="text-gray-900 text-right">
                    {selectedSupplier.name.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="font-medium text-gray-700">CONTACT:</span>
                  <span className="text-gray-900 text-right">
                    {selectedSupplier.contact}
                  </span>
                </div>
                {selectedSupplier.email && (
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-medium text-gray-700">EMAIL:</span>
                    <span className="text-gray-900 text-right">
                      {selectedSupplier.email.toUpperCase()}
                    </span>
                  </div>
                )}
                {selectedSupplier.address && (
                  <div className="grid grid-cols-2 gap-2">
                    <span className="font-medium text-gray-700">ADDRESS:</span>
                    <span className="text-gray-900 text-right">
                      {selectedSupplier.address.toUpperCase()}
                    </span>
                  </div>
                )}
               
              </div>

              <div className="text-xs text-gray-500 italic border-t border-dashed border-gray-300 pt-3 mt-3">
                <div className="grid grid-cols-2 gap-2">
                  <span>DATE ADDED:</span>
                  <span className="text-right">
                    {formatDateTime(selectedSupplier.dateAdded)}
                  </span>
                </div>
                {selectedSupplier.updatedAt && (
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <span>LAST UPDATED:</span>
                    <span className="text-right">
                      {formatDateTime(selectedSupplier.updatedAt)}
                    </span>
                  </div>
                )}
                {selectedSupplier.lastUpdateMessage && (
                  <div className="col-span-2 mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800">
                    <span className="font-medium">UPDATE NOTE: </span>
                    {selectedSupplier.lastUpdateMessage.toUpperCase()}
                  </div>
                )}
              </div>

              <div className="text-center border-t border-dashed border-gray-300 pt-4 text-xs text-gray-600">
                <p>THIS IS A COMPUTER-GENERATED SUPPLIER RECORD.</p>
                <p>CONTAINS BUSINESS AND CONTACT INFORMATION ONLY.</p>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-200 rounded-b-lg p-2 print:hidden">
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded bg-blue-600 cursor-pointer text-white hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
                >
                  <span>🖨️</span>
                  <span>PRINT</span>
                </button>

                <button
                  onClick={() => setIsViewOpen(false)}
                  className="px-4 py-2 rounded bg-gray-600 cursor-pointer text-white hover:bg-gray-700 transition font-medium"
                >
                  CLOSE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}