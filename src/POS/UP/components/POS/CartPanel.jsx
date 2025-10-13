import React from "react";
import { toast } from "react-toastify";

export default function CartPanel({
  cart,
  setCart,
  saleType,
  setSaleType,
  totalAmount,
  handleCheckout,
}) {
  const handleQtyChange = (id, qty) => {
    setCart((prev) =>
      prev.map((item) =>
        item.productId === id ? { ...item, qty: Number(qty) } : item
      )
    );
  };

  const handleRemove = (id) => {
    setCart((prev) => prev.filter((i) => i.productId !== id));
  };

  const handleClear = () => {
    if (cart.length === 0) return toast.info("🛒 Cart already empty!");
    setCart([]);
    toast.success("🧹 Cart cleared!");
  };

  return (
    <div className="w-full lg:w-[320px] bg-white/10 p-4 rounded-md flex flex-col">
      <h2 className="text-xl font-bold mb-3">Billing</h2>

      <div className="flex-1 overflow-y-auto space-y-3">
        {cart.length === 0 ? (
          <p className="text-white/60">No items in cart.</p>
        ) : (
          cart.map((item) => (
            <div
              key={item.productId}
              className="border border-white/20 p-3 rounded bg-white/10"
            >
              <div className="flex justify-between">
                <h3>{item.name}</h3>
                <button onClick={() => handleRemove(item.productId)}>✕</button>
              </div>
              <p>Rs {item.price}/unit</p>
              <input
                type="number"
                value={item.qty}
                min="1"
                max={item.quantity}
                onChange={(e) => handleQtyChange(item.productId, e.target.value)}
                className="w-16 bg-black/40 border border-white/20 rounded mt-2 text-center"
              />
            </div>
          ))
        )}
      </div>

      <div className="border-t border-white/20 mt-3 pt-3 space-y-3">
        <div className="flex justify-between font-semibold">
          <span>Total:</span>
          <span>Rs {totalAmount.toLocaleString()}/-</span>
        </div>

        <select
          value={saleType}
          onChange={(e) => setSaleType(e.target.value)}
          className="w-full p-2 bg-black/40 border border-white/20 rounded"
        >
          <option>Cash</option>
          <option>Installment</option>
        </select>

        <div className="flex gap-2">
          <button
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className="flex-1 py-2 bg-cyan-900 hover:bg-cyan-800 rounded"
          >
            Checkout
          </button>
          <button
            disabled={cart.length === 0}
            onClick={handleClear}
            className="flex-1 py-2 bg-red-700 hover:bg-red-600 rounded"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
