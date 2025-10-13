// |===============================| Imports |===============================|
import React from "react";
import ProductCard from "../../components/Card/ProductCard";
import ProductBanner from "../../components/Banner/ProductsBanner";
import { homeAppliances } from "../../constants/productsDetails";

// |===============================| HomeAppliances Component |===============================|
const HomeAppliances = () => {
  return (
    <div className="min-h-screen bg-transparent p-3 sm:p-10">
      {/* |===============================| Banner Section |===============================| */}
      <ProductBanner
        title="Home Appliances"
        description="Discover our premium range of home appliances designed for convenience and efficiency"
      />

      {/* |===============================| Product Grid Section |===============================| */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center mt-8">
        {homeAppliances.map((product, idx) => (
          <div key={idx} className="w-full">
            <ProductCard {...product} />
          </div>
        ))}
      </div>
    </div>
  );
};

// |===============================| Export Component |===============================|
export default HomeAppliances;
