import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import dailySales from "../../constants/dailySales";

// Shared dark color palette
const darkColors = [
  "#312e81", // indigo-900
 
];

const DailySalesChart = () => {
  const isSmallScreen =
    typeof window !== "undefined" && window.innerWidth < 640;

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 sm:p-6 mb-8">
      <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">
        Daily Sales This Week
      </h3>

      <div className="w-full h-64 sm:h-72 md:h-80 lg:h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dailySales}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkColors[1]} />

            <XAxis
              dataKey="day"
              stroke="rgba(255,255,255,0.9)"
              tick={{
                fontSize: isSmallScreen ? 13 : 14,
                fill: "rgba(255,255,255,0.9)",
              }}
            />

            <YAxis
              stroke="rgba(255,255,255,0.9)"
              tick={{
                fontSize: isSmallScreen ? 13 : 14,
                fill: "rgba(255,255,255,0.9)",
              }}
            />

            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                backgroundColor: "rgba(10, 10, 10, 0.95)", // dark tooltip bg
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
              }}
              labelStyle={{
                color: "rgba(255,255,255,0.8)", // label text
                fontSize: isSmallScreen ? "13px" : "14px",
              }}
              itemStyle={{
                color: "rgba(255,255,255,0.8)", // value text (amount)
                fontSize: isSmallScreen ? "13px" : "14px",
              }}
            />

            <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
              {dailySales.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={darkColors[index % darkColors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DailySalesChart;
