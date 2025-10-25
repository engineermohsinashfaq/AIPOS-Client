// |===============================| Import Icons |===============================|
import {
  AttachMoney,
  People,
  Inventory,
  ShoppingCart,
  CreditCard,
  CalendarToday,
  Warning,
  Receipt,
  LocalShipping,
  AccountBalance,
  TrendingUp,
  BusinessCenter,
  Security,
  Group,
  Store,
  Payment,
  MonetizationOn,
  BarChart,
  Assessment,
} from "@mui/icons-material";

// |===============================| Utility Functions |===============================|
const formatCurrency = (amount) => {
  if (!amount || isNaN(amount)) return "Rs 0";
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDateTime = (dateInput) => {
  if (!dateInput) return "—";
  try {
    let date = new Date(dateInput);
    if (isNaN(date.getTime())) return "—";
    
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    return "—";
  }
};

// |===============================| Data Calculation Functions |===============================|
const calculateSalesStats = () => {
  try {
    const salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySales = salesHistory.filter(sale => {
      const saleDate = new Date(sale.timestamp || sale.savedOn);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === today.getTime();
    });
    
    const totalSales = salesHistory.reduce((sum, sale) => sum + (parseFloat(sale.finalTotal) || 0), 0);
    const todaySalesTotal = todaySales.reduce((sum, sale) => sum + (parseFloat(sale.finalTotal) || 0), 0);
    
    const cashSales = salesHistory
      .filter(sale => sale.type === "cash-sale" || sale.invoiceId?.startsWith("CASH-"))
      .reduce((sum, sale) => sum + (parseFloat(sale.finalTotal) || 0), 0);
    
    const installmentSales = salesHistory
      .filter(sale => sale.type === "installment-sale" || sale.invoiceId?.startsWith("INST-"))
      .reduce((sum, sale) => sum + (parseFloat(sale.finalTotal) || 0), 0);
    
    return {
      totalSales,
      todaySales: todaySalesTotal,
      cashSales,
      installmentSales,
      totalTransactions: salesHistory.length,
      todayTransactions: todaySales.length,
    };
  } catch (error) {
    console.error("Error calculating sales stats:", error);
    return {
      totalSales: 0,
      todaySales: 0,
      cashSales: 0,
      installmentSales: 0,
      totalTransactions: 0,
      todayTransactions: 0,
    };
  }
};

const calculateCustomerStats = () => {
  try {
    const customers = JSON.parse(localStorage.getItem("all_customers_data")) || [];
    const salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];
    
    const activeCustomers = customers.filter(c => c.status === "ACTIVE").length;
    const inactiveCustomers = customers.filter(c => c.status === "INACTIVE").length;
    const suspendedCustomers = customers.filter(c => c.status === "SUSPENDED").length;
    
    // Calculate customers with sales
    const customersWithSales = [...new Set(salesHistory.map(sale => sale.customerId))].filter(Boolean);
    
    return {
      totalCustomers: customers.length,
      activeCustomers,
      inactiveCustomers,
      suspendedCustomers,
      customersWithSales: customersWithSales.length,
    };
  } catch (error) {
    console.error("Error calculating customer stats:", error);
    return {
      totalCustomers: 0,
      activeCustomers: 0,
      inactiveCustomers: 0,
      suspendedCustomers: 0,
      customersWithSales: 0,
    };
  }
};

const calculateProductStats = () => {
  try {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    
    const totalQuantity = products.reduce((sum, product) => sum + (parseInt(product.quantity) || 0), 0);
    const totalValue = products.reduce((sum, product) => {
      const quantity = parseInt(product.quantity) || 0;
      const price = parseFloat(product.price) || 0;
      return sum + (quantity * price);
    }, 0);
    
    const lowStockProducts = products.filter(product => {
      const quantity = parseInt(product.quantity) || 0;
      return quantity > 0 && quantity <= 5;
    }).length;
    
    const outOfStockProducts = products.filter(product => {
      const quantity = parseInt(product.quantity) || 0;
      return quantity === 0;
    }).length;
    
    return {
      totalProducts: products.length,
      totalQuantity,
      totalValue,
      lowStockProducts,
      outOfStockProducts,
    };
  } catch (error) {
    console.error("Error calculating product stats:", error);
    return {
      totalProducts: 0,
      totalQuantity: 0,
      totalValue: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
    };
  }
};

const calculatePurchaseStats = () => {
  try {
    const purchaseHistory = JSON.parse(localStorage.getItem("purchaseHistory")) || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayPurchases = purchaseHistory.filter(purchase => {
      const purchaseDate = new Date(purchase.savedOn || purchase.timestamp);
      purchaseDate.setHours(0, 0, 0, 0);
      return purchaseDate.getTime() === today.getTime();
    });
    
    const totalPurchases = purchaseHistory.reduce((sum, purchase) => sum + (parseFloat(purchase.total) || 0), 0);
    const todayPurchasesTotal = todayPurchases.reduce((sum, purchase) => sum + (parseFloat(purchase.total) || 0), 0);
    
    const newPurchases = purchaseHistory.filter(p => p.type === "new-purchase").length;
    const stockAdditions = purchaseHistory.filter(p => p.type === "stock-addition").length;
    
    return {
      totalPurchases,
      todayPurchases: todayPurchasesTotal,
      totalPurchaseTransactions: purchaseHistory.length,
      todayPurchaseTransactions: todayPurchases.length,
      newPurchases,
      stockAdditions,
    };
  } catch (error) {
    console.error("Error calculating purchase stats:", error);
    return {
      totalPurchases: 0,
      todayPurchases: 0,
      totalPurchaseTransactions: 0,
      todayPurchaseTransactions: 0,
      newPurchases: 0,
      stockAdditions: 0,
    };
  }
};

const calculateInstallmentStats = () => {
  try {
    const installmentHistory = JSON.parse(localStorage.getItem("installmentHistory")) || [];
    const salesHistory = JSON.parse(localStorage.getItem("salesHistory")) || [];
    
    const totalInstallmentPayments = installmentHistory.reduce((sum, payment) => 
      sum + (parseFloat(payment.paymentAmount) || 0), 0
    );
    
    const pendingInstallments = salesHistory
      .filter(sale => sale.type === "installment-sale" || sale.invoiceId?.startsWith("INST-"))
      .filter(sale => {
        const remaining = parseFloat(sale.remainingAmount) || 0;
        return remaining > 0;
      }).length;
    
    const installmentCustomers = [...new Set(salesHistory
      .filter(sale => sale.type === "installment-sale" || sale.invoiceId?.startsWith("INST-"))
      .map(sale => sale.customerId)
    )].filter(Boolean).length;
    
    return {
      totalInstallmentPayments,
      pendingInstallments,
      installmentCustomers,
      totalInstallmentPaymentsCount: installmentHistory.length,
    };
  } catch (error) {
    console.error("Error calculating installment stats:", error);
    return {
      totalInstallmentPayments: 0,
      pendingInstallments: 0,
      installmentCustomers: 0,
      totalInstallmentPaymentsCount: 0,
    };
  }
};

const calculateSupplierStats = () => {
  try {
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const purchaseHistory = JSON.parse(localStorage.getItem("purchaseHistory")) || [];
    
    const allSuppliers = [...products, ...purchaseHistory]
      .filter(item => item.supplier && item.supplierContact)
      .map(item => ({
        name: item.supplier,
        contact: item.supplierContact,
        company: item.company || "—"
      }));
    
    const uniqueSuppliers = [...new Map(allSuppliers.map(item => 
      [`${item.name}-${item.contact}`, item]
    )).values()];
    
    return {
      totalSuppliers: uniqueSuppliers.length,
    };
  } catch (error) {
    console.error("Error calculating supplier stats:", error);
    return {
      totalSuppliers: 0,
    };
  }
};

const calculateGuarantorStats = () => {
  try {
    const guarantors = JSON.parse(localStorage.getItem("all_guarantors_data")) || [];
    
    return {
      totalGuarantors: guarantors.length,
    };
  } catch (error) {
    console.error("Error calculating guarantor stats:", error);
    return {
      totalGuarantors: 0,
    };
  }
};

// |===============================| Main Stats Calculation |===============================|
const calculateAllStats = () => {
  const salesStats = calculateSalesStats();
  const customerStats = calculateCustomerStats();
  const productStats = calculateProductStats();
  const purchaseStats = calculatePurchaseStats();
  const installmentStats = calculateInstallmentStats();
  const supplierStats = calculateSupplierStats();
  const guarantorStats = calculateGuarantorStats();
  
  return {
    // Sales Stats
    totalSales: salesStats.totalSales,
    todaySales: salesStats.todaySales,
    cashSales: salesStats.cashSales,
    installmentSales: salesStats.installmentSales,
    totalTransactions: salesStats.totalTransactions,
    todayTransactions: salesStats.todayTransactions,
    
    // Customer Stats
    totalCustomers: customerStats.totalCustomers,
    activeCustomers: customerStats.activeCustomers,
    inactiveCustomers: customerStats.inactiveCustomers,
    suspendedCustomers: customerStats.suspendedCustomers,
    customersWithSales: customerStats.customersWithSales,
    cashCustomers: customerStats.totalCustomers - customerStats.customersWithSales, // Approximation
    installmentCustomers: customerStats.customersWithSales, // Approximation
    
    // Product Stats
    totalProducts: productStats.totalProducts,
    totalQuantity: productStats.totalQuantity,
    totalValue: productStats.totalValue,
    lowStockProducts: productStats.lowStockProducts,
    outOfStockProducts: productStats.outOfStockProducts,
    
    // Purchase Stats
    totalPurchases: purchaseStats.totalPurchases,
    todayPurchases: purchaseStats.todayPurchases,
    totalPurchaseTransactions: purchaseStats.totalPurchaseTransactions,
    todayPurchaseTransactions: purchaseStats.todayPurchaseTransactions,
    newPurchases: purchaseStats.newPurchases,
    stockAdditions: purchaseStats.stockAdditions,
    
    // Installment Stats
    totalInstallmentPayments: installmentStats.totalInstallmentPayments,
    pendingInstallments: installmentStats.pendingInstallments,
    installmentCustomers: installmentStats.installmentCustomers,
    totalInstallmentPaymentsCount: installmentStats.totalInstallmentPaymentsCount,
    
    // Supplier Stats
    totalSuppliers: supplierStats.totalSuppliers,
    
    // Guarantor Stats
    totalGuarantors: guarantorStats.totalGuarantors,
  };
};

// |===============================| Stats Values |===============================|
const stats = calculateAllStats();

// |===============================| Primary Stat Cards |===============================|
export const primaryStats = [
  {
    icon: AttachMoney,
    title: "Total Sales",
    value: formatCurrency(stats.totalSales),
    color: "from-green-500 to-emerald-500",
    description: "All time sales revenue",
  },
  {
    icon: ShoppingCart,
    title: "Today's Sales",
    value: formatCurrency(stats.todaySales),
    color: "from-blue-500 to-cyan-500",
    description: "Sales for today",
  },
  {
    icon: People,
    title: "Total Customers",
    value: stats.totalCustomers.toLocaleString(),
    color: "from-purple-500 to-pink-500",
    description: "Registered customers",
  },
  {
    icon: Inventory,
    title: "Products in Stock",
    value: stats.totalProducts.toLocaleString(),
    color: "from-orange-500 to-red-500",
    description: "Active products",
  },
];

// |===============================| Secondary Stat Cards |===============================|
export const secondaryStats = [
  // Sales & Revenue
  {
    icon: CreditCard,
    title: "Cash Sales",
    value: formatCurrency(stats.cashSales),
    color: "from-teal-500 to-green-500",
    description: "Total cash sales",
  },
  {
    icon: CalendarToday,
    title: "Installment Sales",
    value: formatCurrency(stats.installmentSales),
    color: "from-indigo-500 to-purple-500",
    description: "Total installment sales",
  },
  {
    icon: Receipt,
    title: "Total Transactions",
    value: stats.totalTransactions.toLocaleString(),
    color: "from-blue-600 to-blue-400",
    description: "All sales transactions",
  },
  {
    icon: TrendingUp,
    title: "Today's Transactions",
    value: stats.todayTransactions.toLocaleString(),
    color: "from-green-600 to-green-400",
    description: "Transactions today",
  },

  // Customers
  {
    icon: Group,
    title: "Active Customers",
    value: stats.activeCustomers.toLocaleString(),
    color: "from-green-500 to-teal-500",
    description: "Currently active",
  },
  {
    icon: People,
    title: "Installment Customers",
    value: stats.installmentCustomers.toLocaleString(),
    color: "from-indigo-500 to-purple-500",
    description: "Customers with installments",
  },
  {
    icon: BusinessCenter,
    title: "Customers with Sales",
    value: stats.customersWithSales.toLocaleString(),
    color: "from-cyan-500 to-blue-500",
    description: "Customers with purchase history",
  },

  // Products & Inventory
  {
    icon: Store,
    title: "Total Stock Quantity",
    value: stats.totalQuantity.toLocaleString(),
    color: "from-orange-500 to-red-500",
    description: "Items in inventory",
  },
  {
    icon: Assessment,
    title: "Inventory Value",
    value: formatCurrency(stats.totalValue),
    color: "from-yellow-500 to-orange-500",
    description: "Total stock value",
  },
  {
    icon: Warning,
    title: "Low Stock Items",
    value: stats.lowStockProducts.toLocaleString(),
    color: "from-red-500 to-pink-500",
    description: "Items need restocking",
  },
  {
    icon: Inventory,
    title: "Out of Stock",
    value: stats.outOfStockProducts.toLocaleString(),
    color: "from-red-600 to-red-400",
    description: "Items out of stock",
  },

  // Purchases
  {
    icon: LocalShipping,
    title: "Total Purchases",
    value: formatCurrency(stats.totalPurchases),
    color: "from-cyan-500 to-blue-500",
    description: "All time purchases",
  },
  {
    icon: ShoppingCart,
    title: "Today's Purchases",
    value: formatCurrency(stats.todayPurchases),
    color: "from-blue-600 to-cyan-600",
    description: "Purchases today",
  },
  {
    icon: BarChart,
    title: "Purchase Transactions",
    value: stats.totalPurchaseTransactions.toLocaleString(),
    color: "from-purple-500 to-pink-500",
    description: "Total purchase orders",
  },
  {
    icon: Store,
    title: "New Purchases",
    value: stats.newPurchases.toLocaleString(),
    color: "from-green-600 to-teal-600",
    description: "New product purchases",
  },
  {
    icon: Inventory,
    title: "Stock Additions",
    value: stats.stockAdditions.toLocaleString(),
    color: "from-blue-500 to-indigo-500",
    description: "Stock replenishments",
  },

  // Installments
  {
    icon: Payment,
    title: "Installment Payments",
    value: formatCurrency(stats.totalInstallmentPayments),
    color: "from-purple-600 to-pink-600",
    description: "Total received",
  },
  {
    icon: CalendarToday,
    title: "Pending Installments",
    value: stats.pendingInstallments.toLocaleString(),
    color: "from-yellow-500 to-orange-500",
    description: "Awaiting payment",
  },
  {
    icon: MonetizationOn,
    title: "Installment Payments Count",
    value: stats.totalInstallmentPaymentsCount.toLocaleString(),
    color: "from-indigo-600 to-purple-600",
    description: "Total payment records",
  },

  // Business Partners
  {
    icon: BusinessCenter,
    title: "Total Suppliers",
    value: stats.totalSuppliers.toLocaleString(),
    color: "from-gray-600 to-gray-400",
    description: "Registered suppliers",
  },
  {
    icon: Security,
    title: "Total Guarantors",
    value: stats.totalGuarantors.toLocaleString(),
    color: "from-blue-700 to-blue-500",
    description: "Registered guarantors",
  },
  {
    icon: AccountBalance,
    title: "Customer Status - Inactive",
    value: stats.inactiveCustomers.toLocaleString(),
    color: "from-yellow-600 to-yellow-400",
    description: "Inactive customers",
  },
  {
    icon: Warning,
    title: "Customer Status - Suspended",
    value: stats.suspendedCustomers.toLocaleString(),
    color: "from-red-600 to-red-400",
    description: "Suspended customers",
  },
];

// |===============================| Additional Stat Categories |===============================|
export const statCategories = {
  sales: secondaryStats.filter(stat => 
    stat.title.includes('Sales') || stat.title.includes('Transaction') || stat.title.includes('Revenue')
  ),
  customers: secondaryStats.filter(stat => 
    stat.title.includes('Customer') || stat.title.includes('Guarantor')
  ),
  products: secondaryStats.filter(stat => 
    stat.title.includes('Product') || stat.title.includes('Stock') || stat.title.includes('Inventory')
  ),
  purchases: secondaryStats.filter(stat => 
    stat.title.includes('Purchase')
  ),
  installments: secondaryStats.filter(stat => 
    stat.title.includes('Installment') || stat.title.includes('Payment')
  ),
  suppliers: secondaryStats.filter(stat => 
    stat.title.includes('Supplier')
  ),
};

// |===============================| System Info |===============================|
export const systemInfo = {
  lastUpdated: formatDateTime(new Date()),
  totalDataPoints: primaryStats.length + secondaryStats.length,
  dataSources: [
    'Sales History',
    'Customer Data', 
    'Product Inventory',
    'Purchase Records',
    'Installment Payments',
    'Supplier Data',
    'Guarantor Data'
  ],
};

// |===============================| Export |===============================|
export default stats;