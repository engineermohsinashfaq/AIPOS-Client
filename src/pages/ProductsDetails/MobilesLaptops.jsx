// |===============================| Imports |===============================|
import React from "react";
import ProductCard from "../../components/Card/ProductCard";
import ProductBanner from "../../components/Banner/ProductsBanner";
import { mobilesLaptops } from "../../constants/productsDetails";
import "../../CSS/ScrollBar.css";

// |===============================| MobilesLaptops Component |===============================|
const MobilesLaptops = () => {
  return (
    <div className="min-h-screen max-h-screen bg-transparent p-3 sm:p-10 flex flex-col">
      <div className="banner-section fixed top-0 left-0 w-full p-6  z-10 backdrop-blur-md border-b border-white/10">
        {/* |===============================| Banner Section |===============================| */}
        <ProductBanner
          title="Mobiles & Laptops"
          description="Explore our latest collection of premium smartphones and laptops"
        />
      </div>
      {/* |===============================| Product Grid Section |===============================| */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mx-auto gap-8 justify-items-center p-4 mt-75 sm:mt-50 md:mt-48 lg:mt-48 xl:mt-48 overflow-y-auto h-[650px] md:h-[700px] lg:h-[750px] xl:h-[800px] py-10 scrollbar-hide">
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
