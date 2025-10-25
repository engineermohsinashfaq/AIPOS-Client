import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SalesChart = () => {
  // Get real sales data from localStorage
  const getSalesData = () => {
    try {
      const salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];
      
      // Group by month
      const monthlyData = salesHistory.reduce((acc, sale) => {
        const date = new Date(sale.timestamp || sale.savedOn);
        const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        
        if (!acc[monthYear]) {
          acc[monthYear] = { month: monthYear, sales: 0, installments: 0 };
        }
        
        const amount = parseFloat(sale.finalTotal) || 0;
        if (sale.type === "installment-sale" || sale.invoiceId?.startsWith("INST-")) {
          acc[monthYear].installments += amount;
        } else {
          acc[monthYear].sales += amount;
        }
        
        return acc;
      }, {});
      
      // Convert to array and get last 6 months
      const data = Object.values(monthlyData)
        .sort((a, b) => new Date(a.month) - new Date(b.month))
        .slice(-6);
      
      return data.length > 0 ? data : [
        { month: "Jan", sales: 0, installments: 0 },
        { month: "Feb", sales: 0, installments: 0 },
        { month: "Mar", sales: 0, installments: 0 },
        { month: "Apr", sales: 0, installments: 0 },
        { month: "May", sales: 0, installments: 0 },
        { month: "Jun", sales: 0, installments: 0 },
      ];
    } catch (error) {
      console.error("Error generating sales chart data:", error);
      return [
        { month: "Jan", sales: 0, installments: 0 },
        { month: "Feb", sales: 0, installments: 0 },
        { month: "Mar", sales: 0, installments: 0 },
        { month: "Apr", sales: 0, installments: 0 },
        { month: "May", sales: 0, installments: 0 },
        { month: "Jun", sales: 0, installments: 0 },
      ];
    }
  };

  const data = getSalesData();

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Sales Overview</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `Rs ${value / 1000}k`}
            />
            <Tooltip 
              formatter={(value) => [`Rs ${value.toLocaleString()}`, 'Amount']}
              contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="sales" 
              stroke="#3B82F6" 
              strokeWidth={2}
              name="Cash Sales"
            />
            <Line 
              type="monotone" 
              dataKey="installments" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              name="Installment Sales"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;