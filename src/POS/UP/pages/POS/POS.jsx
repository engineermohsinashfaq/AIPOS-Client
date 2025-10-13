import React, { useState, useMemo } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import ProductList from "../../components/POS/ProductList";
import CartPanel from "../../components/POS/CartPanel";
import InvoiceModal from "../../components/POS/InvoiceModal";
import InstallmentModal from "../../components/POS/InstallmentModal";

import useProducts from "../../components/POS/HelperHook";
import { generateInvoiceId } from "../../constants/Helper";

export default function POS() {
  const { products, setProducts, filteredProducts, query, setQuery } = useProducts();
  const [cart, setCart] = useState([]);
  const [saleType, setSaleType] = useState("Cash");
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceId, setInvoiceId] = useState("");
  const [showInstallmentModal, setShowInstallmentModal] = useState(false);

  const totalAmount = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty * item.price, 0),
    [cart]
  );

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const newInvoice = generateInvoiceId();
    setInvoiceId(newInvoice);
    if (saleType === "Cash") setShowInvoice(true);
    else setShowInstallmentModal(true);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-3 p-3 h-auto lg:h-[95vh] text-white relative">
      <ToastContainer autoClose={2000} />

      {/* LEFT: Products */}
      <ProductList
        products={filteredProducts}
        query={query}
        setQuery={setQuery}
        cart={cart}
        setCart={setCart}
      />

      {/* RIGHT: Billing */}
      <CartPanel
        cart={cart}
        setCart={setCart}
        saleType={saleType}
        setSaleType={setSaleType}
        totalAmount={totalAmount}
        handleCheckout={handleCheckout}
      />

      {/* MODALS */}
      {showInvoice && (
        <InvoiceModal
          invoiceId={invoiceId}
          cart={cart}
          saleType={saleType}
          onClose={() => setShowInvoice(false)}
        />
      )}
      {showInstallmentModal && (
        <InstallmentModal
          cart={cart}
          onClose={() => setShowInstallmentModal(false)}
          onProceed={() => {
            setShowInstallmentModal(false);
            setShowInvoice(true);
          }}
        />
      )}
    </div>
  );
}
