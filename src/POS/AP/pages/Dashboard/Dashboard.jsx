// |===============================| Import Components |===============================|
import React, { useState } from "react";
import StatCard from "../../components/Card/StatCard";
import SalesChart from "../../components/Chart/SalesChart";
import CategoryChart from "../../components/Chart/CategoryChart";
import DailySalesChart from "../../components/Chart/DailySalesChart";

// |===============================| Import Data |===============================|
import stats, { primaryStats, secondaryStats } from "../../constants/stats";

// |===============================| Dashboard Page |===============================|
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const user = { name: "Admin" }; // Dummy user

  return (
    <div className="space-y-8 mx-auto w-8xl">
      {/* |===============================| Header |===============================| */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user.name}!
        </h1>
        <p className="text-white/90">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* |===============================| Tabs |===============================| */}
      <div className="flex space-x-3">
        {["overview", "sales"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-2 py-2 rounded-md font-base hover:cursor-pointer  ${
              activeTab === tab
                ? "bg-cyan-900 text-white border border-white/40"
                : "bg-cyan-800/80 text-white/80 hover:bg-cyan-900/90 transition-colors"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* |===============================| Tab Content |===============================| */}
      <div className="space-y-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Primary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {primaryStats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {secondaryStats.map((stat, index) => (
                <StatCard key={index} {...stat} />
              ))}
            </div>
          </>
        )}

        {/* Sales Tab */}
        {activeTab === "sales" && (
          <>
            {/* Sales Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SalesChart />
              <CategoryChart />
            </div>

            {/* Daily Sales Chart */}
            <DailySalesChart />
          </>
        )}

        
      </div>
    </div>
  );
};

// |===============================| Export |===============================|
export default Dashboard;
