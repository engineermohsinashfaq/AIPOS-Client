import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import categoryData from "../../constants/categoryData";

const CategoryChart = () => {
  // detect small screen for font size adjustments
  const isSmallScreen =
    typeof window !== "undefined" && window.innerWidth < 640;

  // Deep dark color palette
  const darkColors = [
    "#0f172a", // slate-900
    "#1e293b", // slate-800
    "#312e81", // indigo-900
    "#3730a3", // indigo-800
    "#064e3b", // emerald-900
    "#065f46", // emerald-800
    "#7c2d12", // amber-900
    "#78350f", // amber-800
  ];

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">
        Sales by Category
      </h3>
      {/* Responsive chart wrapper */}
      <div className="w-full h-64 sm:h-72 md:h-80 lg:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius="40%"
              outerRadius="70%"
              paddingAngle={5}
              dataKey="value"
            >
              {categoryData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={darkColors[index % darkColors.length]}
                />
              ))}
            </Pie>

            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(10, 10, 10, 0.95)", // dark tooltip
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                color: "rgba(255,255,255,0.9)",
                fontSize: isSmallScreen ? "13px" : "14px",
              }}
              itemStyle={{
                color: "rgba(255,255,255,0.9)",
                fontSize: isSmallScreen ? "13px" : "14px",
              }}
            />

            <Legend
              wrapperStyle={{
                color: "rgba(255,255,255,0.9)",
                fontSize: isSmallScreen ? "13px" : "14px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryChart;
