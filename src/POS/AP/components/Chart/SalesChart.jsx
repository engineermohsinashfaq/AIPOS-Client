import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import salesData from "../../constants/salesData";

// Extended dark color palette
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

const SalesChart = () => {
  // Detect small screens
  const isSmallScreen =
    typeof window !== "undefined" && window.innerWidth < 640;

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 sm:p-6">
      <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">
        Sales Trend
      </h3>
      <div className="w-full h-64 sm:h-72 md:h-80 lg:h-96 pb-4 sm:pb-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={salesData}>
            <defs>
              {/* Cash Sales Gradient - emerald shades */}
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={darkColors[4]} stopOpacity={0.9} />
                <stop
                  offset="95%"
                  stopColor={darkColors[4]}
                  stopOpacity={0.2}
                />
              </linearGradient>

              {/* Installments Gradient - indigo shades */}
              <linearGradient
                id="installmentGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={darkColors[2]} stopOpacity={0.9} />
                <stop
                  offset="95%"
                  stopColor={darkColors[2]}
                  stopOpacity={0.2}
                />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,.7)"
            />

            <XAxis
              dataKey="month"
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
              contentStyle={{
                backgroundColor: "rgba(10, 10, 10, 0.95)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                color: "rgba(255,255,255,0.9)",
                fontSize: isSmallScreen ? 13 : 14,
              }}
              labelStyle={{
                color: "rgba(255,255,255,0.9)",
                fontSize: isSmallScreen ? 13 : 14,
              }}
            />

            <Legend
              wrapperStyle={{
                color: "rgba(255,255,255,0.9)",
                fontSize: isSmallScreen ? 13 : 14,
              }}
            />

            <Area
              type="monotone"
              dataKey="sales"
              stroke={darkColors[5]} // emerald-800
              fillOpacity={1}
              fill="url(#salesGradient)"
              name="Cash Sales"
            />
            <Area
              type="monotone"
              dataKey="installments"
              stroke={darkColors[3]} // indigo-800
              fillOpacity={1}
              fill="url(#installmentGradient)"
              name="Installment Sales"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;
