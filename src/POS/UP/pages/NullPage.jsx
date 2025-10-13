import React from "react";
import Dashboard from "../pages/Dashboard/Dashboard";
import AddCustomer from "./Customers/AddCustomer";
import AllCustomers from "./Customers/AllCustomers";
import AddProduct from "./Produtcs/AddProducts";
import AllProducts from "./Produtcs/AllProducts";
import AddPurchase from "./Purchases/AddPurchase";
import PurchaseHistory from "./Purchases/PurchaseHistory";
import AllSuppliers from "./Suppliers/AllSupliers";
import AddGuarantor from "./Guarantors/AddGuarantor";
import AllGuarantors from "./Guarantors/AllGuarantors";
import POS from "./POS/POS";
import SalesHistory from "./Sales/SalesHistory";
import InstallmentManagement from "./Installments/InstallmentManagement";

const NullPage = () => {
  return (
    <>
      <div>
        <Dashboard />

        <AddCustomer />
        <AllCustomers />
        <AddProduct />
        <AllProducts />
        <AddPurchase />
        <PurchaseHistory />
        <AllSuppliers />
        <AddGuarantor />
        <AllGuarantors />
        <POS />
        <SalesHistory/>
        <InstallmentManagement/>  
      </div>
    </>
  );
};

export default NullPage;
