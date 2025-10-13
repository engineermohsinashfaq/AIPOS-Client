// |===============================| Imports |===============================|
import React from "react";
import ProductCard from "../../components/Card/ProductCard";
import ProductBanner from "../../components/Banner/ProductsBanner";
import { solarPower } from "../../constants/productsDetails";

// |===============================| SolarPower Component |===============================|
const SolarPower = () => {
  return (
    <div className="min-h-screen bg-transparent p-3 sm:p-10">
      {/* |===============================| Banner Section |===============================| */}
      <ProductBanner
        title="Solar & Power"
        description="Explore our latest collection of premium Solars, Generators and UPS"
      />

      {/* |===============================| Product Grid Section |===============================| */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center mt-8">
        {solarPower.map((product, idx) => (
          <a key={idx} href={product.link} className="block w-full">
            <ProductCard {...product} />
          </a>
        ))}
      </div>
    </div>
  );
};

// |===============================| Export Component |===============================|
export default SolarPower;
