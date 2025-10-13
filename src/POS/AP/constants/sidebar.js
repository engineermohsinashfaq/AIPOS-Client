import {
  Dashboard,
  People,
  BarChart,
  Person,
  Bolt,
  PersonAdd,
  List,
  Settings,
  Store,
  TrendingUp,
  ShoppingCart,
  Report,
  Info,
} from "@mui/icons-material";

// |===============================| Admin Dashboard Menu Items |===============================|
export const adminDashboardMenuItems = [
  {
    icon: Dashboard,
    label: "Dashboard",
    path: "/ap-dashboard",
  },
  {
    icon: People,
    label: "Users",
    children: [
      {
        icon: PersonAdd,
        label: "Manage Users",
        path: "/ap-manage-users",
      },
    ],
  },
  {
    icon: Store,
    label: "Branches",
    children: [
      {
        icon: List,
        label: "All Branches",
        path: "/ap-all-branches",
      },
    ],
  },
  {
    icon: BarChart,
    label: "Reports",
    children: [
      {
        icon: Person,
        label: "User Report",
        path: "/ap-user-report",
      },
      {
        icon: Report,
        label: "Branch Reports",
        path: "/ap-branch-reports",
      },

      {
        icon: TrendingUp,
        label: "Sales Report",
        path: "/ap-sales-report",
      },

      {
        icon: ShoppingCart,
        label: "Stock Report",
        path: "/ap-stock-report",
      },
    ],
  },
  {
    icon: Settings,
    label: "Settings",
    children: [
      {
        icon: Person,
        label: "Profile",
        path: "/ap-profile",
      },

      {
        icon: Bolt,
        label: "System Backup",
        path: "/ap-system-backup",
      },

      {
        icon: Info,
        label: "About",
        path: "/ap-about",
      },
    ],
  },
];

// |===============================| General Menu Items (For All Roles) |===============================|
export const generalMenuItems = [];

// |===============================| Combined Export (Admin + General) |===============================|
export const menuItems = [...adminDashboardMenuItems, ...generalMenuItems];
