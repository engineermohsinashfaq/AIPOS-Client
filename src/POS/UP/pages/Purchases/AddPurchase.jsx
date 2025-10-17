import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";

const loadProducts = () => {
  const stored = localStorage.getItem("products");
  return stored ? JSON.parse(stored) : [];
};

// ✅ Improved Invoice ID Generator
const generateInvoiceId = () => {
  const existingProducts = JSON.parse(localStorage.getItem("products") || "[]");
  const existingHistory = JSON.parse(
    localStorage.getItem("purchaseHistory") || "[]"
  );
  const allInvoices = [...existingProducts, ...existingHistory]
    .map((item) => item.invoiceId)
    .filter((id) => id && id.startsWith("Inv-"));

  if (allInvoices.length === 0) return "Inv-001";

  const lastSavedNum = allInvoices.reduce((max, id) => {
    const num = parseInt(id.replace("Inv-", ""), 10);
    return !isNaN(num) && num > max ? num : max;
  }, 0);

  const nextNum = lastSavedNum + 1;
  return `Inv-${String(nextNum).padStart(3, "0")}`;
};

// ✅ Robust Date Formatter that handles all date formats
const formatDateTime = (dateInput) => {
  if (!dateInput) return "—";
  
  try {
    let date;
    
    // Handle different date formats
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'string') {
      // Try to parse the date string - handle multiple formats
      if (dateInput.includes('/')) {
        // Handle DD/MM/YYYY format
        const parts = dateInput.split(' ');
        const datePart = parts[0];
        const timePart = parts[1];
        
        if (datePart.includes('/')) {
          const [day, month, year] = datePart.split('/');
          if (timePart) {
            const [hours, minutes, seconds] = timePart.split(':');
            date = new Date(year, month - 1, day, hours || 0, minutes || 0, seconds || 0);
          } else {
            date = new Date(year, month - 1, day);
          }
        }
      } else {
        // Try standard Date parsing
        date = new Date(dateInput);
      }
    } else {
      date = new Date(dateInput);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "—";
    }
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Date formatting error:', error);
    return "—";
  }
};

// ✅ Short Date for Display (Table) - More robust version
const formatShortDate = (dateString) => {
  if (!dateString) return "—";
  
  try {
    const fullDate = formatDateTime(dateString);
    if (fullDate === "—") return "—";
    
    // Extract just the date part (DD/MM/YYYY)
    return fullDate.split(' ')[0];
  } catch (error) {
    return "—";
  }
};

export default function AddStock() {
  const navigate = useNavigate();
  const [products, setProducts] = useState(loadProducts());
  const [selectedId, setSelectedId] = useState("");
  const [product, setProduct] = useState(null);
  const [additionalQty, setAdditionalQty] = useState("");
  const [newInvoiceId, setNewInvoiceId] = useState("");

  // 🟢 Generate new invoice ID when component mounts
  useEffect(() => {
    setNewInvoiceId(generateInvoiceId());
  }, []);

  // 🟢 When selecting a product, remove '+' from supplierContact before showing
  useEffect(() => {
    if (!selectedId) return;
    const found = products.find((p) => p.productId === selectedId);
    if (found) {
      setProduct({
        ...found,
        supplierContact: found.supplierContact
          ? found.supplierContact.replace(/^\+/, "")
          : "",
      });
      setAdditionalQty(""); // Reset additional qty on selection
    } else {
      setProduct(null);
      toast.error("Product not found!", { theme: "dark", autoClose: 2000 });
    }
  }, [selectedId, products]);

  // 💰 Auto-calculate total based on current + additional qty
  useEffect(() => {
    if (!product) return;
    const price = parseFloat(product.price) || 0;
    const currentQty = parseInt(product.quantity) || 0;
    const addQty = parseInt(additionalQty) || 0;
    const newTotalQty = currentQty + addQty;
    const total = (price * newTotalQty).toFixed(2);
    const additionTotal = (price * addQty).toFixed(2);
    setProduct((prev) => ({ 
      ...prev, 
      total, 
      value: total,
      additionTotal 
    }));
  }, [product?.price, product?.quantity, additionalQty]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "price" || name === "sellPrice") {
      const val = value.replace(/[^\d.]/g, "");
      setProduct((prev) => ({ ...prev, [name]: val }));
      return;
    }

    if (name === "additionalQty") {
      const val = value.replace(/\D/g, "");
      setAdditionalQty(val);
      return;
    }

    if (name === "supplierContact") {
      let digits = value.replace(/\D/g, "");
      if (digits.length > 15) digits = digits.slice(0, 15);
      setProduct((prev) => ({ ...prev, [name]: digits }));
      return;
    }

    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!product) return toast.error("No product selected!", { theme: "dark" });

    const toastOptions = { theme: "dark", autoClose: 2000 };

    if (
      !product.price ||
      isNaN(product.price) ||
      parseFloat(product.price) <= 0
    )
      return toast.error("Valid Purchase Price is required", toastOptions);
    if (
      !product.sellPrice ||
      isNaN(product.sellPrice) ||
      parseFloat(product.sellPrice) <= 0
    )
      return toast.error("Valid Sell Price is required", toastOptions);
    if (!additionalQty || isNaN(additionalQty) || parseInt(additionalQty) <= 0)
      return toast.error("Valid Additional Quantity is required", toastOptions);
    if (!product.supplier.trim())
      return toast.error("Supplier is required", toastOptions);

    // 🟢 Add "+" before saving supplier contact
    const fullSupplierContact = "+" + product.supplierContact;
    if (!/^\+\d{7,15}$/.test(fullSupplierContact))
      return toast.error(
        "Supplier Contact must start with '+' followed by 7–15 digits",
        toastOptions
      );

    // Calculate new total quantity
    const currentQty = parseInt(product.quantity) || 0;
    const addQty = parseInt(additionalQty) || 0;
    const newTotalQty = currentQty + addQty;

    // --- Update product list (add to existing qty and totals) ---
    const updatedProducts = products.map((p) =>
      p.productId === product.productId
        ? {
            ...p,
            price: product.price,
            sellPrice: product.sellPrice,
            quantity: newTotalQty.toString(),
            supplier: product.supplier,
            supplierContact: fullSupplierContact,
            total: (parseFloat(product.price) * newTotalQty).toFixed(2),
            value: (parseFloat(product.price) * newTotalQty).toFixed(2),
            updatedOn: formatDateTime(new Date()),
          }
        : p
    );

    localStorage.setItem("products", JSON.stringify(updatedProducts));
    setProducts(updatedProducts);

    // --- UPDATE Purchase History ---
    const existingHistory =
      JSON.parse(localStorage.getItem("purchaseHistory")) || [];

    const newPurchaseEntry = {
      ...product,
      productId: product.productId,
      invoiceId: newInvoiceId,
      quantity: additionalQty,
      price: product.price,
      sellPrice: product.sellPrice,
      supplierContact: fullSupplierContact,
      total: (parseFloat(product.price) * parseInt(additionalQty)).toFixed(2),
      value: (parseFloat(product.price) * parseInt(additionalQty)).toFixed(2),
      savedOn: formatDateTime(new Date()),
      name: product.name,
      model: product.model,
      category: product.category,
      company: product.company,
      supplier: product.supplier,
      type: "stock-addition"
    };

    const updatedHistory = [...existingHistory, newPurchaseEntry];
    localStorage.setItem("purchaseHistory", JSON.stringify(updatedHistory));

    toast.success(`Stock added with Invoice ${newInvoiceId}`, {
      ...toastOptions,
      onClose: () => navigate("/up-purchase-history"),
    });
  };

  return (
    <div className="px-4 py-2 min-h-[100%]">
      <ToastContainer theme="dark" autoClose={2000} />
      <div className="w-8xl mx-auto space-y-3">
        <div>
          <h1 className="text-3xl font-bold text-white">Add Stock</h1>
          <p className="text-white/80">
            Select a Product ID to update stock and pricing details.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-5 text-white shadow-lg mt-6">
          {/* Product Selector */}
          <div className="mb-4">
            <label
              htmlFor="productId"
              className="block mb-1 text-sm text-white/80"
            >
              Select Product ID
            </label>
            <select
              id="productId"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
            >
              <option value="">-- Select Product ID --</option>
              {products.map((p) => (
                <option key={p.productId} value={p.productId}>
                  {p.productId} — {p.name} (Current Stock: {p.quantity})
                </option>
              ))}
            </select>
          </div>

          {!product ? (
            <p className="text-center text-white/70 italic">
              Select a Product ID to view details.
            </p>
          ) : (
            <form onSubmit={handleSave} className="space-y-3">
              {/* Invoice ID Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm text-white/80">
                    Invoice No
                  </label>
                  <h2 className="w-full p-2 rounded-md bg-black/40 border border-white/30 text-white font-semibold">
                    {newInvoiceId}
                  </h2>
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">
                    Product ID
                  </label>
                  <h2 className="w-full p-2 rounded-md bg-black/40 border border-white/30 text-white font-semibold">
                    {product.productId}
                  </h2>
                </div>
              </div>

              {/* Read-only Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm text-white/80">
                    Name
                  </label>
                  <h2 className="w-full p-2 rounded-md bg-black/40 border border-white/30 text-white font-semibold">
                    {product.name}
                  </h2>
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">
                    Model
                  </label>
                  <h2 className="w-full p-2 rounded-md bg-black/40 border border-white/30 text-white font-semibold">
                    {product.model}
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm text-white/80">
                    Category
                  </label>
                  <h2 className="w-full p-2 rounded-md bg-black/40 border border-white/30 text-white font-semibold">
                    {product.category}
                  </h2>
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">
                    Company
                  </label>
                  <h2 className="w-full p-2 rounded-md bg-black/40 border border-white/30 text-white font-semibold">
                    {product.company}
                  </h2>
                </div>
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm text-white/80">
                    Purchase Price
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={product.price}
                    onChange={handleChange}
                    className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm text-white/80">
                    Sell Price
                  </label>
                  <input
                    type="text"
                    name="sellPrice"
                    value={product.sellPrice}
                    onChange={handleChange}
                    className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                  />
                </div>
              </div>

              {/* Quantity Section */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block mb-1 text-sm text-white/80">
                    Current Stock: <span className="text-cyan-400 font-semibold">{product.quantity} pcs</span>
                  </label>
                  <input
                    type="text"
                    name="additionalQty"
                    value={additionalQty}
                    onChange={handleChange}
                    placeholder="Enter additional quantity to add"
                    className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                  />
                  <p className="text-xs text-white/60 mt-2">
                    Adding <strong>{additionalQty || 0}</strong> units to existing <strong>{product.quantity}</strong> units ={" "}
                    <strong className="text-cyan-400">
                      {parseInt(product.quantity) + parseInt(additionalQty || 0)} total units
                    </strong>
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block mb-1 text-sm text-white/80">
                  Supplier
                </label>
                <input
                  type="text"
                  name="supplier"
                  value={product.supplier}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 text-sm text-white/80">
                  Supplier Contact
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 select-none">
                    +
                  </span>
                  <input
                    type="text"
                    name="supplierContact"
                    value={product.supplierContact}
                    onChange={handleChange}
                    className="w-full pl-6 p-3 rounded-md bg-black/30 border border-white/20 text-white outline-none"
                  />
                </div>
              </div>

              {/* Summary Section */}
              <div className="border-t border-white/20 pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/80">This Addition Value:</span>
                  <span className="font-semibold">
                    Rs {((parseFloat(product.price) || 0) * (parseInt(additionalQty) || 0)).toFixed(2)}/-
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/80">New Total Inventory Value:</span>
                  <span className="text-lg font-bold text-white">
                    Rs: {product.total || "0.00"}/-
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-md bg-cyan-800/80 hover:bg-cyan-900 transition cursor-pointer font-semibold flex justify-center items-center gap-2 mt-4"
              >
                <AddIcon />
                Save Stock Addition
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}