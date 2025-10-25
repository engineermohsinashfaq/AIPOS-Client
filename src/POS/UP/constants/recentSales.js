// constants/recentSales.js
const getRecentSales = () => {
  try {
    const salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];
    
    // Get last 4 sales
    const recentSales = salesHistory
      .slice(-4)
      .reverse()
      .map(sale => ({
        id: sale.invoiceId || sale.id || Math.random().toString(36).substr(2, 9),
        customer: sale.customerName || "Unknown Customer",
        amount: parseFloat(sale.finalTotal) || 0,
        type: sale.type === "installment-sale" || sale.invoiceId?.startsWith("INST-") ? "installment" : "cash",
        date: new Date(sale.timestamp || sale.savedOn).toLocaleDateString()
      }));
    
    return recentSales.length > 0 ? recentSales : [
      {
        id: "1",
        customer: "No Recent Sales",
        amount: 0,
        type: "cash",
        date: new Date().toLocaleDateString(),
      }
    ];
  } catch (error) {
    console.error("Error getting recent sales:", error);
    return [
      {
        id: "1",
        customer: "Error Loading Data",
        amount: 0,
        type: "cash",
        date: new Date().toLocaleDateString(),
      }
    ];
  }
};

const recentSales = getRecentSales();
export default recentSales;