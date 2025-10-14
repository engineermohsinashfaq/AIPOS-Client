import React from "react";
import Dashboard from "../pages/Dashboard/Dashboard";
import ManageUsers from "../pages/User/ManageUsers";
import AddUser from "./User/AddUser";
import AllUsers from "./User/AllUsers";
import AllBranches from "./Branch/AllBranches";
import AddAdmin from "./Settings/AddAdmin";
import AllAdmins from "./Settings/AllAdmins";
import SystemBackup from "../pages/Settings/SystemBackup";
import About from "../pages/Settings/About";
import Profile from "../pages/Settings/Profile";

const NullPage = () => {
  return (
    <>
      <Dashboard />
      <ManageUsers />
      <AddUser />
      <AllUsers />
      <AllBranches />
      <AddAdmin />
      <AllAdmins />
      <SystemBackup />
      <About />
      <Profile />
    </>
  );
};

export default NullPage;
