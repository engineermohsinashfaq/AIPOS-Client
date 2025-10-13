import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import { toast } from "react-toastify";
import { getStatus } from "../../constants/Helper";

export default function ProductList({ products, query, setQuery, cart, setCart }) {
  const handleAddToCart = (product) => {
    if (product.quantity === 0) return toast.error("❌ Product out of stock!");

    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.productId);
      if (existing) {
        if (existing.qty + 1 > product.quantity) {
          toast.warn(`⚠️ Only ${product.quantity} in stock.`);
          return prev;
        }
        toast.info(`Increased quantity of ${product.name}`);
        return prev.map((i) =>
          i.productId === product.productId ? { ...i, qty: i.qty + 1 } : i
        );
      }
      toast.success(`🛒 ${product.name} added to cart`);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-white/10 backdrop-blur-md rounded-md p-4">
      <h1 className="text-2xl font-bold mb-2">Point of Sale</h1>
      <div className="flex items-center bg-white/10 border border-white/20 rounded-md p-2 mb-3">
        <SearchIcon />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search product..."
          className="bg-transparent outline-none w-full ml-2 text-white"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 overflow-y-auto scrollbar-hide ">
        {products.map((p) => (
          <div
            key={p.productId}
            className="bg-white/5 p-3 rounded border border-white/20 hover:bg-white/10 transition"
          >
            <h2 className="font-bold">{p.name}</h2>
            <p>Category: {p.category}</p>
            <p>Price: Rs {p.price}</p>
            <p>Status: {getStatus(p.quantity)}</p>
            <p>Stock: {p.quantity}</p>

            <button
              disabled={p.quantity === 0}
              onClick={() => handleAddToCart(p)}
              className={`w-full mt-2 py-2 rounded flex items-center justify-center gap-2 ${
                p.quantity === 0
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-cyan-900 hover:bg-cyan-800"
              }`}
            >
              <AddShoppingCartIcon fontSize="small" /> Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
