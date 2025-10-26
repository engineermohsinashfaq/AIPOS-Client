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
        label: "Manage Installments",
        path: "/up-manage-installments",
      }
    ],
  },

  {
    icon: BarChart,
    label: "Managements",
    children: [

      {
        icon: People,
        label: "Customers Details",
        path: "/up-customers-details",
      },
      {
        icon: Group,
        label: "Guarantors Details",
        path: "/up-guarantors-details",
      },
      {
        icon: Group,
        label: "Supliers Details",
        path: "/up-suppliers-details",
      },
      {
        icon: Inventory,
        label: "Inventory Details",
        path: "/up-inventory-details",
      },
      {
        icon: CreditCard,
        label: "Installments Details",
        path: "/up-installments-details",
      },
      {
        icon: AttachMoney,
        label: "Purchase Details",
        path: "/up-purchase-details",
      },
      {
        icon: TrendingUp,
        label: "Sales Details",
        path: "/up-sales-details",
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
