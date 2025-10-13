// |===============================| Import Components |===============================|
import StatCard from "../../components/Card/StatCard";
import SalesChart from "../../components/Chart/SalesChart";
import CategoryChart from "../../components/Chart/CategoryChart";
import DailySalesChart from "../../components/Chart/DailySalesChart";

// |===============================| Import Data |===============================|
import stats, { primaryStats, secondaryStats } from "../../constants/stats";
import recentSales from "../../constants/recentSales";

// |===============================| Dashboard Page |===============================|
const Dashboard = () => {
  const user = { name: "Admin" }; // Dummy user

  return (
    <div className="space-y-8 mx-auto max-w-[1200px] ">
      {/* |===============================| Header |===============================| */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user.name}!
        </h1>
        <p className="text-white/90">
          Here's what's happening with your business today.
        </p>
      </div>

      {/* |===============================| Stats Grid |===============================| */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {primaryStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* |===============================| Secondary Stats |===============================| */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {secondaryStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* |===============================| Recent Sales Table |===============================| */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">
          Recent Sales
        </h2>

        {/* Responsive wrapper for horizontal scroll */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm sm:text-base min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-white font-medium py-2 sm:py-3 px-2 sm:px-3">
                  Customer
                </th>
                <th className="text-left text-white font-medium py-2 sm:py-3 px-2 sm:px-3">
                  Amount
                </th>
                <th className="text-left text-white font-medium py-2 sm:py-3 px-2 sm:px-3">
                  Type
                </th>
                <th className="text-left text-white font-medium py-2 sm:py-3 px-2 sm:px-3">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map((sale) => (
                <tr
                  key={sale.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-3 sm:py-4 px-2 sm:px-3 text-white/80 font-medium whitespace-nowrap">
                    {sale.customer}
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-3 text-white/80 whitespace-nowrap">
                    ${sale.amount.toLocaleString()}
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-3 whitespace-nowrap">
                    <span
                      className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                        sale.type === "cash"
                          ? "bg-green-600 text-white"
                          : "bg-indigo-700 text-white"
                      }`}
                    >
                      {sale.type === "cash" ? "Cash" : "Installment"}
                    </span>
                  </td>
                  <td className="py-3 sm:py-4 px-2 sm:px-3 text-gray-300 whitespace-nowrap">
                    {sale.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* |===============================| Charts Section |===============================| */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Sales chart */}
        <SalesChart />

        {/* Category chart */}
        <CategoryChart />
      </div>

      {/* |===============================| Daily Sales Chart |===============================| */}
      <DailySalesChart />
    </div>
  );
};

// |===============================| Export |===============================|
export default Dashboard;
