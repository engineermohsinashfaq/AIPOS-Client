import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const CategoryChart = () => {
  // Get real category data from products
  const getCategoryData = () => {
    try {
      const products = JSON.parse(localStorage.getItem("products")) || [];
      
      const categoryData = products.reduce((acc, product) => {
        const category = product.category || 'Uncategorized';
        const value = (parseInt(product.quantity) || 0) * (parseFloat(product.price) || 0);
        
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += value;
        
        return acc;
      }, {});
      
      // Convert to array format for chart
      const data = Object.entries(categoryData).map(([name, value]) => ({
        name,
        value: Math.round(value)
      }));
      
      return data.length > 0 ? data : [
        { name: "No Data", value: 1 }
      ];
    } catch (error) {
      console.error("Error generating category chart data:", error);
      return [
        { name: "No Data", value: 1 }
      ];
    }
  };

  const data = getCategoryData();
  
  const COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899', '#14B8A6'];

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6">
      <h3 className="text-xl font-semibold text-white mb-4">Inventory by Category</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [`Rs ${value.toLocaleString()}`, 'Value']}
              contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryChart;