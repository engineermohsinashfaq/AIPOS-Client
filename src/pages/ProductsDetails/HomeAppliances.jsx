// |===============================| Imports |===============================|
import React from "react";
import { motion } from "framer-motion";
import ProductCard from "../../components/Card/ProductCard";
import ProductBanner from "../../components/Banner/ProductsBanner";
import { homeAppliances } from "../../constants/productsDetails";

// |===============================| Animation Variants |===============================|
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2 } },
};

const cardVariant = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
};

// |===============================| HomeAppliances Component |===============================|
const HomeAppliances = () => {
  return (
    <motion.div
      className="min-h-screen bg-transparent p-6 px-3 sm:p-10"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={staggerContainer}
    >
      {/* |===============================| Banner Section |===============================| */}
      <motion.div variants={fadeInUp}>
        <ProductBanner
          title="Home Appliances"
          description="Discover our premium range of home appliances designed for convenience and efficiency"
        />
      </motion.div>

      {/* |===============================| Product Grid Section |===============================| */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center mt-8"
        variants={staggerContainer}
      >
        {homeAppliances.map((product, idx) => (
          <motion.div key={idx} variants={cardVariant} whileHover={{ scale: 1.02 }}>
            <ProductCard {...product} />
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};

// |===============================| Export Component |===============================|
export default HomeAppliances;
