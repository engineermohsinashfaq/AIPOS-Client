import React from "react";
import Dashboard from "../pages/Dashboard/Dashboard";
import AddUser from "./User/AddUser";
import AllUsers from "./User/AllUsers";
import AllBranches from "./Branch/AllBranches";
import AddAdmin from "./Settings/AddAdmin";
import AllAdmins from "./Settings/AllAdmins";
import SystemBackup from "../pages/Settings/SystemBackup";
import Profile from "../pages/Settings/Profile";
import Developers from "../pages/Settings/Developers";

const NullPage = () => {
  return (
    <>
      <Dashboard />
      <AddUser />
      <AllUsers />
      <AllBranches />
      <AddAdmin />
      <AllAdmins />
      <SystemBackup />
      <Profile />
      <Developers />
    </>
  );
};

export default NullPage;
