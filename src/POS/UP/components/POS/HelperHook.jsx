import { useEffect, useState, useMemo } from "react";
import sampleProducts from "../../constants/dummyProducts";

export default function useProducts() {
  const [products, setProducts] = useState(() => {
    try {
      const raw = localStorage.getItem("pos_products");
      return raw ? JSON.parse(raw) : sampleProducts;
    } catch {
      return sampleProducts;
    }
  });

  const [query, setQuery] = useState("");

  useEffect(() => {
    localStorage.setItem("pos_products", JSON.stringify(products));
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return products;
    const q = query.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.productId.toLowerCase().includes(q)
    );
  }, [query, products]);

  return { products, setProducts, query, setQuery, filteredProducts };
}
