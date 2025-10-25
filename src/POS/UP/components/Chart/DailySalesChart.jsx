import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DailySalesChart = () => {
  // Get real daily sales data
  const getDailySalesData = () => {
    try {
      const salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        return date;
      }).reverse();

      const dailyData = last7Days.map(date => {
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const daySales = salesHistory.filter(sale => {
          const saleDate = new Date(sale.timestamp || sale.savedOn);
          saleDate.setHours(0, 0, 0, 0);
          return saleDate.getTime() === date.getTime();
        });
        
        const totalAmount = daySales.reduce((sum, sale) => sum + (parseFloat(sale.finalTotal) || 0), 0);
        
        return {
          day: dayName,
          amount: totalAmount
        };
      });

      return dailyData;
    } catch (error) {
      console.error("Error generating daily sales data:", error);
      return [
        { day: "Mon", amount: 0 },
        { day: "Tue", amount: 0 },
        { day: "Wed", amount: 0 },
        { day: "Thu", amount: 0 },
        { day: "Fri", amount: 0 },
        { day: "Sat", amount: 0 },
        { day: "Sun", amount: 0 },
      ];
    }
  };

  const data = getDailySalesData();

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Last 7 Days Sales</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="day" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `Rs ${value / 1000}k`}
            />
            <Tooltip 
              formatter={(value) => [`Rs ${value.toLocaleString()}`, 'Sales']}
              contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
            />
            <Bar 
              dataKey="amount" 
              fill="#3B82F6" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DailySalesChart;