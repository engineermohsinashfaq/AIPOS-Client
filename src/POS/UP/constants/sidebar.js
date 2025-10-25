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
  CreditCard,
  Info,
  Backup,
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


    ],
  },
  {
    icon: CreditCard,
    label: "Installments",
    children: [

      {
        icon: List,
        label: "Installment Management",
        path: "/up-installment-management",
      }
    ],
  },

  {
    icon: BarChart,
    label: "Reports",
    children: [
      {
        icon: AttachMoney,
        label: "Purchase Reports",
        path: "/up-purchase-report",
      },
      {
        icon: Inventory,
        label: "Inventory Reports",
        path: "/up-inventory-report",
      },
      {
        icon: People,
        label: "Customers Reports",
        path: "/up-customer-report",
      },
      {
        icon: Group,
        label: "Guarantors Reports",
        path: "/up-guarantors-report",
      },
      {
        icon: CreditCard,
        label: "Installments Reports",
        path: "/up-installments-report",
      },
      {
        icon: TrendingUp,
        label: "Sales Reports",
        path: "/up-sales-report",
      },
      {
        icon: Group,
        label: "Supliers Reports",
        path: "/up-suppliers-report",
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
