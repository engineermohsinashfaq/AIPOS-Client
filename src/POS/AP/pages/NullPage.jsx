import React from "react";
import Dashboard from "../pages/Dashboard/Dashboard";
import ManageUsers from "../pages/User/ManageUsers";
import ManageBranch from "../pages/Branch/ManageBranch";
import BranchReport from "../pages/Report/BranchReport";
import StockReport from "../pages/Report/StockReport";
import SalesReport from "../pages/Report/SalesReport";
import CustomerReport from "../pages/Report/CustomerReport";
import Profile from "../pages/Settings/Profile";
import About from "../pages/Settings/About";
import SystemBackup from "../pages/Settings/SystemBackup";

const NullPage = () => {
  return (
    <>
      <Dashboard />
      <ManageUsers />
      <ManageBranch />
      <BranchReport />
      <CustomerReport />
      <SalesReport />
      <StockReport />
      <Profile />
      <SystemBackup />
      <About />
    </>
  );
};

export default NullPage;
