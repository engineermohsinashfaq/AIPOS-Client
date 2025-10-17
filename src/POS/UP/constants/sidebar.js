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
  Add,
  Inventory,
  ShoppingBag,
  AttachMoney,
  Receipt,
  CreditCard,
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
    path: "/up-dashboard",
  },
  {
    icon: ShoppingCart,
    label: "POS",
    children: [
      {
        icon: CreditCard, // or CreditCard if POS unavailable
        label: "Point of Sale",
        path: "/up-pos",
      }
    ],
  },
  {
    icon: People,
    label: "Customers",
    children: [
      {
        icon: PersonAdd,
        label: "Add Customer",
        path: "/up-add-customer",
      },
      {
        icon: List,
        label: "All Customers",
        path: "/up-all-customers",
      },
    ],
  },
  {
    icon: AdminPanelSettings,
    label: "Guarantors",
    children: [
      {
        icon: PersonAdd,
        label: "Add Guarantor",
        path: "/up-add-guarantor",
      },
      {
        icon: List,
        label: "All Guarantors",
        path: "/up-all-guarantors",
      },
    ],
  },
  {
    icon: ShoppingBag,
    label: "Purchase",
    children: [
      {
        icon: Add,
        label: "Add Purchase",
        path: "/up-add-purchase",
      },
      {
        icon: Receipt,
        label: "Purchase History",
        path: "/up-purchase-history",
      },
      {
        icon: Group,
        label: "Suppliers",
        path: "/up-suppliers",
      },
    ],
  },
  {
    icon: Inventory,
    label: "Stocks",
    children: [
      {
        icon: Add,
        label: "Add Stock",
        path: "/up-add-stock",
      },
      {
        icon: List,
        label: "Inventory",
        path: "/up-inventory",
      },

    ],
  },

  {
    icon: BarChart,
    label: "Reports",
    children: [
      {
        icon: TrendingUp,
        label: "Sales Reports",
        path: "/up-sales-report",
        roles: ["owner", "admin"],
      },
      {
        icon: People,
        label: "Customer Reports",
        path: "/up-customer-report",
      },
      {
        icon: AttachMoney,
        label: "Purchase Reports",
        path: "/up-purchase-report",
      },
      {
        icon: Inventory,
        label: "Product Reports",
        path: "/up-product-report",
      },
    ],
  },
  {
    icon: Settings,
    label: "Settings",
    children: [

      {
        icon: Backup,
        label: "Backup",
        path: "/up-system-backup",
      },
      {
        icon: Person,
        label: "Profile",
        path: "/up-profile",
      },
      {
        icon: Info,
        label: "Developers",
        path: "/up-developers",
      },
    ],
  },
];
