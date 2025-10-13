// |===============================| Import Icons |===============================|
import {
  AttachMoney,
  People,
  Inventory,
  ShoppingCart,
  CreditCard,
  CalendarToday,
  Warning,
} from "@mui/icons-material";

// |===============================| Stats Values |===============================|
const stats = {
  totalSales: 125000,
  todaySales: 8500,
  totalCustomers: 1250,
  totalProducts: 450,
  cashSales: 75000,
  installmentSales: 50000,
  pendingInstallments: 25,
  lowStockProducts: 12,
  totalPurchases: 80000,
  cashCustomers: 900,
  installmentCustomers: 350,
};

// |===============================| Primary Stat Cards |===============================|
export const primaryStats = [
  {
    icon: AttachMoney,
    title: "Total Sales",
    value: `$${stats.totalSales.toLocaleString()}`,
    change: "+12.5%",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: ShoppingCart,
    title: "Today's Sales",
    value: `$${stats.todaySales.toLocaleString()}`,
    change: "+8.2%",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: People,
    title: "Total Customers",
    value: stats.totalCustomers,
    change: "+5.1%",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Inventory,
    title: "Products",
    value: stats.totalProducts,
    color: "from-orange-500 to-red-500",
  },
];

// |===============================| Secondary Stat Cards |===============================|
export const secondaryStats = [
  {
    icon: CreditCard,
    title: "Cash Sales",
    value: `$${stats.cashSales.toLocaleString()}`,
    color: "from-teal-500 to-green-500",
  },
  {
    icon: CalendarToday,
    title: "Installment Sales",
    value: `$${stats.installmentSales.toLocaleString()}`,
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: People,
    title: "Cash Customers",
    value: stats.cashCustomers,
    color: "from-green-500 to-teal-500",
  },
  {
    icon: People,
    title: "Installment Customers",
    value: stats.installmentCustomers,
    color: "from-indigo-500 to-purple-500",
  },
  {
    icon: CalendarToday,
    title: "Pending Installments",
    value: stats.pendingInstallments,
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Warning,
    title: "Low Stock Items",
    value: stats.lowStockProducts,
    color: "from-red-500 to-pink-500",
  },
  {
    icon: ShoppingCart,
    title: "Total Purchases",
    value: `$${stats.totalPurchases.toLocaleString()}`,
    color: "from-cyan-500 to-blue-500",
  },
];

// |===============================| Export |===============================|
export default stats;
