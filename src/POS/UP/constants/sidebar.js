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
      }
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
      }
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
      }
    ],
  },
  {
    icon: ShoppingBag,
    label: "Purchase",
    roles: ["owner", "admin"],
    children: [
      {
        icon: Add,
        label: "New Purchase",
        path: "/dashboard/purchase/new",
        roles: ["owner", "admin"],
      },
      {
        icon: List,
        label: "Purchase History",
        path: "/dashboard/purchase/history",
        roles: ["owner", "admin"],
      },
      {
        icon: People,
        label: "Suppliers",
        path: "/dashboard/purchase/suppliers",
        roles: ["owner", "admin"],
      },
    ],
  },
  {
    icon: CreditCard,
    label: "POS",
    roles: ["owner", "admin", "sales"],
    children: [
      {
        icon: ShoppingCart,
        label: "Point of Sale",
        path: "/dashboard/transactions/pos",
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
        icon: Inventory,
        label: "Inventory Reports",
        path: "/dashboard/reports/inventory",
        roles: ["owner", "admin"],
      },
      {
        icon: AttachMoney,
        label: "Financial Reports",
        path: "/dashboard/reports/financial",
        roles: ["owner", "admin"],
      },
    ],
  },

  {
    icon: Person,
    label: "Profile",
    roles: ["owner", "admin", "sales", "customer"],
    children: [
      {
        icon: Person,
        label: "My Profile",
        path: "/dashboard/profile",
        roles: ["owner", "admin", "sales", "customer"],
      },
      {
        icon: Settings,
        label: "Settings",
        path: "/dashboard/profile/settings",
        roles: ["owner", "admin", "sales", "customer"],
      },
    ],
  },
  {
    icon: Bolt,
    label: "System",
    roles: ["owner", "admin"],
    children: [
      {
        icon: Info,
        label: "About",
        path: "/dashboard/system/about",
        roles: ["owner", "admin"],
      },
      {
        icon: Bolt,
        label: "System Backup",
        path: "/dashboard/system/backup",
        roles: ["owner", "admin"],
      },
    ],
  },
];
