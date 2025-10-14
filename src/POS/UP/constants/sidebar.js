import {
  Dashboard,
  People,
  BarChart,
  Person,
  PersonAdd,
  List,
  Settings,
  TrendingUp,
  ShoppingCart,
  Category,
  Add,
  Inventory,
  Archive,
  ShoppingBag,
  AttachMoney,
  CalendarToday,
  Receipt,
  CreditCard,
  Bolt,
  Info,
  Backup,
  Notifications,
  AdminPanelSettings,
  Group,
} from "@mui/icons-material";

// Full Menu Items with Roles & Children
export const menuItems = [
  {
    icon: Dashboard,
    label: "Dashboard",
    roles: ["owner", "admin", "sales"],
    children: [
      {
        icon: TrendingUp,
        label: "Overview",
        path: "/dashboard",
        roles: ["owner", "admin", "sales"],
      },
    ],
  },
  {
    icon: People,
    label: "Customers",
    roles: ["owner", "admin", "sales"],
    children: [
      {
        icon: PersonAdd,
        label: "Add Customer",
        path: "/dashboard/customers/new",
        roles: ["owner", "admin", "sales"],
      },
      {
        icon: List,
        label: "All Customers",
        path: "/dashboard/customers/all",
        roles: ["owner", "admin", "sales"],
      },
    ],
  },
  {
    icon: Inventory,
    label: "Products",
    roles: ["owner", "admin"],
    children: [
      {
        icon: Add,
        label: "Add Product",
        path: "/dashboard/products/new",
        roles: ["owner", "admin"],
      },
      {
        icon: List,
        label: "All Products",
        path: "/dashboard/products/all",
        roles: ["owner", "admin"],
      },
      
    ],
  },
  {
    icon: ShoppingBag,
    label: "Purchase",
    roles: ["owner", "admin"],
    children: [
      {
        icon: Add,
        label: "Add Purchase",
        path: "/dashboard/purchase/new",
        roles: ["owner", "admin"],
      },
      {
        icon: Receipt,
        label: "Purchase History",
        path: "/dashboard/purchase/history",
        roles: ["owner", "admin"],
      },
      {
        icon: Group,
        label: "Suppliers",
        path: "/dashboard/purchase/suppliers",
        roles: ["owner", "admin"],
      },
    ],
  },
  {
    icon: ShoppingCart,
    label: "POS",
    roles: ["owner", "admin", "sales"],
    children: [
      {
        icon:CreditCard, // or CreditCard if POS unavailable
        label: "Point of Sale",
        path: "/dashboard/pos",
        roles: ["owner", "admin", "sales"],
      },
      {
        icon: Receipt,
        label: "Transactions",
        path: "/dashboard/pos/transactions",
        roles: ["owner", "admin", "sales"],
      },
    ],
  },
  {
    icon: AdminPanelSettings,
    label: "Guarantors",
    roles: ["owner", "admin", "sales"],
    children: [
      {
        icon: PersonAdd,
        label: "Add Guarantor",
        path: "/dashboard/guarantors/new",
        roles: ["owner", "admin", "sales"],
      },
      {
        icon: List,
        label: "All Guarantors",
        path: "/dashboard/guarantors/all",
        roles: ["owner", "admin", "sales"],
      },
    ],
  },
  {
    icon: BarChart,
    label: "Reports",
    roles: ["owner", "admin"],
    children: [
      {
        icon: TrendingUp,
        label: "Sales Reports",
        path: "/dashboard/reports/sales",
        roles: ["owner", "admin"],
      },
      {
        icon: People,
        label: "Customer Reports",
        path: "/dashboard/reports/customers",
        roles: ["owner", "admin"],
      },
      {
        icon: AttachMoney,
        label: "Purchase Reports",
        path: "/dashboard/reports/purchases",
        roles: ["owner", "admin"],
      },
      {
        icon: Inventory,
        label: "Product Reports",
        path: "/dashboard/reports/products",
        roles: ["owner", "admin"],
      },
    ],
  },
  {
    icon: Settings,
    label: "Settings",
    roles: ["owner", "admin", "sales", "customer"],
    children: [
      {
        icon: Notifications,
        label: "Notifications",
        path: "/dashboard/settings/notifications",
        roles: ["owner", "admin", "sales", "customer"],
      },
      {
        icon: Backup,
        label: "Backup",
        path: "/dashboard/settings/backup",
        roles: ["owner", "admin"],
      },
      {
        icon: Person,
        label: "Profile",
        path: "/dashboard/settings/profile",
        roles: ["owner", "admin", "sales", "customer"],
      },
      {
        icon: Info,
        label: "Developers",
        path: "/dashboard/settings/developers",
        roles: ["owner", "admin", "sales", "customer"],
      },
    ],
  },
];
