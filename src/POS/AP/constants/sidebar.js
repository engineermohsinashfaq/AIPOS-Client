import {
  Dashboard,
  People,
  Person,
  Bolt,
  PersonAdd,
  List,
  Settings,
  Store,
  Info,
  GroupAdd, // 👥 for "All Admins"
  PersonAddAlt1, // 👤➕ for "Add Admin"
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
        label: "Add User",
        path: "/ap-add-user",
      },
      {
        icon: List,
        label: "All Users",
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
    icon: Settings,
    label: "Settings",
    accordion: true, // ✅ Accordion-enabled group
    children: [
      {
        icon: PersonAddAlt1, // 👤➕ Add Admin (MUI equivalent)
        label: "Add Admin",
        path: "/ap-add-admin",
      },
      {
        icon: GroupAdd, // 👥 All Admins (MUI equivalent)
        label: "All Admins",
        path: "/ap-all-admins",
      },
      {
        icon: Bolt,
        label: "System Backup",
        path: "/ap-system-backup",
      },
      {
        icon: Info,
        label: "Developers",
        path: "/ap-developers",
      },
      {
        icon: Person,
        label: "Profile",
        path: "/ap-profile",
      },
    ],
  },
];

// |===============================| General Menu Items (For All Roles) |===============================|
export const generalMenuItems = [];

// |===============================| Combined Export (Admin + General) |===============================|
export const menuItems = [...adminDashboardMenuItems, ...generalMenuItems];
