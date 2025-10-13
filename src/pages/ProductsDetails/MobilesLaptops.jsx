// |===============================| Imports |===============================|
import React from "react";
import ProductCard from "../../components/Card/ProductCard";
import ProductBanner from "../../components/Banner/ProductsBanner";
import { mobilesLaptops } from "../../constants/productsDetails";

// |===============================| MobilesLaptops Component |===============================|
const MobilesLaptops = () => {
  return (
    <div className="min-h-screen bg-transparent p-3 sm:p-10">
      {/* |===============================| Banner Section |===============================| */}
      <ProductBanner
        title="Mobiles & Laptops"
        description="Explore our latest collection of premium smartphones and laptops"
      />

      {/* |===============================| Product Grid Section |===============================| */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center mt-8">
        {mobilesLaptops.map((product, idx) => (
          <div key={idx} className="w-full">
            <ProductCard {...product} />
          </div>
        ))}
      </div>
    </div>
  );
};

// |===============================| Export Component |===============================|
export default MobilesLaptops;
