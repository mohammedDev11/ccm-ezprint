// import type { IconType } from "react-icons";
// import {
//   RiDashboardFill,
//   RiGroupLine,
//   RiFileList2Line,
//   RiNotification3Line,
//   RiSettings3Line,
//   RiInformationLine,
//   RiHistoryLine,
//   RiUploadCloud2Line,
//   RiLogoutBoxRLine, // ✅ logout icon
// } from "react-icons/ri";
// import {
//   HiOutlineUsers,
//   HiOutlineUserCircle,
//   HiOutlinePrinter,
// } from "react-icons/hi2";
// import { TbChecklist, TbReportSearch } from "react-icons/tb";
// import { MdOutlinePayments } from "react-icons/md";
// import { BiAddToQueue } from "react-icons/bi";

// export type SidebarItem = {
//   label: string;
//   icon: IconType;
//   href: string;
//   video?: string; // ✅ NEW
// };

// export type SidebarSection = {
//   title: string;
//   items: SidebarItem[];
// };

// export type NavbarRole = "admin" | "user";

// const TEST_VIDEO = "/videos/test.mov";

// /* ================= ADMIN ================= */
// export const adminSidebarSections: SidebarSection[] = [
//   {
//     title: "MENU",
//     items: [
//       {
//         label: "Dashboard",
//         icon: RiDashboardFill,
//         href: "/sections/admin/dashboard",
//         video: TEST_VIDEO,
//       },
//       {
//         label: "Users",
//         icon: HiOutlineUsers,
//         href: "/sections/admin/users",
//         video: TEST_VIDEO,
//       },
//       {
//         label: "Groups",
//         icon: RiGroupLine,
//         href: "/sections/admin/groups",
//         video: TEST_VIDEO,
//       },
//       {
//         label: "Accounts",
//         icon: HiOutlineUserCircle,
//         href: "/sections/admin/accounts",
//         video: TEST_VIDEO,
//       },
//       {
//         label: "Printers",
//         icon: HiOutlinePrinter,
//         href: "/sections/admin/printers",
//         video: TEST_VIDEO,
//       },
//       {
//         label: "Queue Manger",
//         icon: BiAddToQueue,
//         href: "/sections/admin/queue-manger",
//         video: TEST_VIDEO,
//       },
//       {
//         label: "Print Release",
//         icon: TbChecklist,
//         href: "/sections/admin/print-release",
//         video: TEST_VIDEO,
//       },
//       {
//         label: "Reports",
//         icon: TbReportSearch,
//         href: "/sections/admin/reports",
//         video: TEST_VIDEO,
//       },
//       {
//         label: "Logs",
//         icon: RiFileList2Line,
//         href: "/sections/admin/logs",
//         video: TEST_VIDEO,
//       },
//     ],
//   },
//   {
//     title: "ACCOUNT",
//     items: [
//       {
//         label: "Notifications",
//         icon: RiNotification3Line,
//         href: "/sections/admin/notifications",
//         video: TEST_VIDEO,
//       },
//       {
//         label: "Settings",
//         icon: RiSettings3Line,
//         href: "/sections/admin/settings",
//         video: TEST_VIDEO,
//       },

//       // ✅ NEW MAIN PAGE LINK
//       {
//         label: "Main Page",
//         icon: RiLogoutBoxRLine,
//         href: "/",
//         video: TEST_VIDEO,
//       },
//     ],
//   },
// ];

// /* ================= USER ================= */
// export const userSidebarSections: SidebarSection[] = [
//   {
//     title: "MENU",
//     items: [
//       {
//         label: "Dashboard",
//         icon: RiDashboardFill,
//         href: "/sections/user/dashboard",
//         video: TEST_VIDEO,
//       },
//       {
//         label: "Print",
//         icon: RiUploadCloud2Line,
//         href: "/sections/user/print",
//         video: TEST_VIDEO,
//       },
//       {
//         label: "Recent Print Jobs",
//         icon: RiFileList2Line,
//         href: "/sections/user/recent-print-jobs",
//         video: TEST_VIDEO,
//       },
//       {
//         label: "Pending Jobs",
//         icon: TbChecklist,
//         href: "/sections/user/pending-jobs",
//         video: TEST_VIDEO,
//       },
//       {
//         label: "History",
//         icon: RiHistoryLine,
//         href: "/sections/user/history",
//         video: TEST_VIDEO,
//       },
//       {
//         label: "Redeem",
//         icon: MdOutlinePayments,
//         href: "/sections/user/redeem",
//         video: TEST_VIDEO,
//       },
//       {
//         label: "Profile",
//         icon: HiOutlineUserCircle,
//         href: "/sections/user/profile",
//         video: TEST_VIDEO,
//       },
//     ],
//   },
//   {
//     title: "SYSTEM",
//     items: [
//       {
//         label: "Notifications",
//         icon: RiNotification3Line,
//         href: "/sections/user/notifications",
//         video: TEST_VIDEO,
//       },
//       {
//         label: "Settings",
//         icon: RiSettings3Line,
//         href: "/sections/user/settings",
//         video: TEST_VIDEO,
//       },

//       // ✅ NEW MAIN PAGE LINK
//       {
//         label: "Main Page",
//         icon: RiLogoutBoxRLine,
//         href: "/",
//         video: TEST_VIDEO,
//       },
//     ],
//   },
// ];

// /* ================= HELPER ================= */
// export const sidebarSectionsByRole: Record<NavbarRole, SidebarSection[]> = {
//   admin: adminSidebarSections,
//   user: userSidebarSections,
// };

// export const getDockItems = (sections: SidebarSection[]) =>
//   sections.flatMap((section) => section.items);

//==================NEW========================
// import type { IconType } from "react-icons";
// import {
//   RiDashboardFill,
//   RiGroupLine,
//   RiFileList2Line,
//   RiNotification3Line,
//   RiSettings3Line,
//   RiHistoryLine,
//   RiUploadCloud2Line,
//   RiLogoutBoxRLine,
// } from "react-icons/ri";
// import {
//   HiOutlineUsers,
//   HiOutlineUserCircle,
//   HiOutlinePrinter,
// } from "react-icons/hi2";
// import { TbChecklist, TbReportSearch } from "react-icons/tb";
// import { MdOutlinePayments } from "react-icons/md";
// import { BiAddToQueue } from "react-icons/bi";

// export type SidebarItem = {
//   label: string;
//   icon: IconType;
//   href: string;
//   lightVideoSrc?: string;
//   darkVideoSrc?: string;
// };

// export type SidebarSection = {
//   title: string;
//   items: SidebarItem[];
// };

// export type NavbarRole = "admin" | "user";

// const TEST_LIGHT_VIDEO = "/videos/test-light.mov";
// const TEST_DARK_VIDEO = "/videos/test-dark.mov";

// /* ================= ADMIN ================= */
// export const adminSidebarSections: SidebarSection[] = [
//   {
//     title: "MENU",
//     items: [
//       {
//         label: "Dashboard",
//         icon: RiDashboardFill,
//         href: "/sections/admin/dashboard",
//         lightVideoSrc: TEST_LIGHT_VIDEO,
//         darkVideoSrc: TEST_DARK_VIDEO,
//       },
//       {
//         label: "Users",
//         icon: HiOutlineUsers,
//         href: "/sections/admin/users",
//         lightVideoSrc: TEST_LIGHT_VIDEO,
//         darkVideoSrc: TEST_DARK_VIDEO,
//       },
//       {
//         label: "Groups",
//         icon: RiGroupLine,
//         href: "/sections/admin/groups",
//         lightVideoSrc: TEST_LIGHT_VIDEO,
//         darkVideoSrc: TEST_DARK_VIDEO,
//       },
//       {
//         label: "Accounts",
//         icon: HiOutlineUserCircle,
//         href: "/sections/admin/accounts",
//         lightVideoSrc: TEST_LIGHT_VIDEO,
//         darkVideoSrc: TEST_DARK_VIDEO,
//       },
//       {
//         label: "Printers",
//         icon: HiOutlinePrinter,
//         href: "/sections/admin/printers",
//         lightVideoSrc: TEST_LIGHT_VIDEO,
//         darkVideoSrc: TEST_DARK_VIDEO,
//       },
//       {
//         label: "Queue Manger",
//         icon: BiAddToQueue,
//         href: "/sections/admin/queue-manger",
//         lightVideoSrc: TEST_LIGHT_VIDEO,
//         darkVideoSrc: TEST_DARK_VIDEO,
//       },
//       {
//         label: "Print Release",
//         icon: TbChecklist,
//         href: "/sections/admin/print-release",
//         lightVideoSrc: TEST_LIGHT_VIDEO,
//         darkVideoSrc: TEST_DARK_VIDEO,
//       },
//       {
//         label: "Reports",
//         icon: TbReportSearch,
//         href: "/sections/admin/reports",
//         lightVideoSrc: TEST_LIGHT_VIDEO,
//         darkVideoSrc: TEST_DARK_VIDEO,
//       },
//       {
//         label: "Logs",
//         icon: RiFileList2Line,
//         href: "/sections/admin/logs",
//         lightVideoSrc: TEST_LIGHT_VIDEO,
//         darkVideoSrc: TEST_DARK_VIDEO,
//       },
//     ],
//   },
//   {
//     title: "ACCOUNT",
//     items: [
//       {
//         label: "Notifications",
//         icon: RiNotification3Line,
//         href: "/sections/admin/notifications",
//         lightVideoSrc: TEST_LIGHT_VIDEO,
//         darkVideoSrc: TEST_DARK_VIDEO,
//       },
//       {
//         label: "Settings",
//         icon: RiSettings3Line,
//         href: "/sections/admin/settings",
//         lightVideoSrc: TEST_LIGHT_VIDEO,
//         darkVideoSrc: TEST_DARK_VIDEO,
//       },
//       {
//         label: "Main Page",
//         icon: RiLogoutBoxRLine,
//         href: "/",
//         lightVideoSrc: TEST_LIGHT_VIDEO,
//         darkVideoSrc: TEST_DARK_VIDEO,
//       },
//     ],
//   },
// ];

// /* ================= USER ================= */
// export const userSidebarSections: SidebarSection[] = [
//   {
//     title: "MENU",
//     items: [
//       {
//         label: "Dashboard",
//         icon: RiDashboardFill,
//         href: "/sections/user/dashboard",
//         lightVideoSrc: TEST_LIGHT_VIDEO,
//         darkVideoSrc: TEST_DARK_VIDEO,
//       },
//       {
//         label: "Print",
//         icon: RiUploadCloud2Line,
//         href: "/sections/user/print",
//         lightVideoSrc: TEST_LIGHT_VIDEO,
//         darkVideoSrc: TEST_DARK_VIDEO,
//       },
//       {
//         label: "Recent Print Jobs",
//         icon: RiFileList2Line,
//         href: "/sections/user/recent-print-jobs",
//         lightVideoSrc: TEST_LIGHT_VIDEO,
//         darkVideoSrc: TEST_DARK_VIDEO,
//       },
//       {
//         label: "Pending Jobs",
//         icon: TbChecklist,
//         href: "/sections/user/pending-jobs",
//         lightVideoSrc: TEST_LIGHT_VIDEO,
//         darkVideoSrc: TEST_DARK_VIDEO,
//       },
//       {
//         label: "History",
//         icon: RiHistoryLine,
//         href: "/sections/user/history",
//         lightVideoSrc: TEST_LIGHT_VIDEO,
//         darkVideoSrc: TEST_DARK_VIDEO,
//       },
//       {
//         label: "Redeem",
//         icon: MdOutlinePayments,
//         href: "/sections/user/redeem",
//         lightVideoSrc: TEST_LIGHT_VIDEO,
//         darkVideoSrc: TEST_DARK_VIDEO,
//       },
//       {
//         label: "Profile",
//         icon: HiOutlineUserCircle,
//         href: "/sections/user/profile",
//         lightVideoSrc: TEST_LIGHT_VIDEO,
//         darkVideoSrc: TEST_DARK_VIDEO,
//       },
//     ],
//   },
//   {
//     title: "SYSTEM",
//     items: [
//       {
//         label: "Notifications",
//         icon: RiNotification3Line,
//         href: "/sections/user/notifications",
//         lightVideoSrc: TEST_LIGHT_VIDEO,
//         darkVideoSrc: TEST_DARK_VIDEO,
//       },
//       {
//         label: "Settings",
//         icon: RiSettings3Line,
//         href: "/sections/user/settings",
//         lightVideoSrc: TEST_LIGHT_VIDEO,
//         darkVideoSrc: TEST_DARK_VIDEO,
//       },
//       {
//         label: "Main Page",
//         icon: RiLogoutBoxRLine,
//         href: "/",
//         lightVideoSrc: TEST_LIGHT_VIDEO,
//         darkVideoSrc: TEST_DARK_VIDEO,
//       },
//     ],
//   },
// ];

// /* ================= HELPER ================= */
// export const sidebarSectionsByRole: Record<NavbarRole, SidebarSection[]> = {
//   admin: adminSidebarSections,
//   user: userSidebarSections,
// };

// export const getDockItems = (sections: SidebarSection[]) =>
//   sections.flatMap((section) => section.items);

// =============NEW==================
import { isAdminOnlyAdminPath, isSubAdminRole } from "@/lib/role-access";
import type { IconType } from "react-icons";
import {
  RiDashboardFill,
  RiGroupLine,
  RiFileList2Line,
  RiNotification3Line,
  RiSettings3Line,
  RiHistoryLine,
  RiUploadCloud2Line,
  RiLogoutBoxRLine,
} from "react-icons/ri";
import {
  HiOutlineUsers,
  HiOutlineUserCircle,
  HiOutlinePrinter,
} from "react-icons/hi2";
import { TbChecklist, TbReportSearch } from "react-icons/tb";
import { MdOutlinePayments } from "react-icons/md";
import { BiAddToQueue } from "react-icons/bi";

export type SidebarItem = {
  label: string;
  icon: IconType;
  href: string;
  lightVideoSrc?: string;
  darkVideoSrc?: string;
};

export type SidebarSection = {
  title: string;
  items: SidebarItem[];
};

export type NavbarRole = "admin" | "user";

/* ================= ADMIN ================= */
export const adminSidebarSections: SidebarSection[] = [
  {
    title: "MENU",
    items: [
      {
        label: "Dashboard",
        icon: RiDashboardFill,
        href: "/sections/admin/dashboard",
        lightVideoSrc: "/videos/admin/dashboard-light.mov",
        darkVideoSrc: "/videos/admin/dashboard-dark.mov",
      },
      {
        label: "Users",
        icon: HiOutlineUsers,
        href: "/sections/admin/users",
        lightVideoSrc: "/videos/admin/users-light.mov",
        darkVideoSrc: "/videos/admin/users-dark.mov",
      },
      {
        label: "Groups",
        icon: RiGroupLine,
        href: "/sections/admin/groups",
        lightVideoSrc: "/videos/admin/groups-light.mov",
        darkVideoSrc: "/videos/admin/groups-dark.mov",
      },
      {
        label: "Accounts",
        icon: HiOutlineUserCircle,
        href: "/sections/admin/accounts",
        lightVideoSrc: "/videos/admin/accounts-light.mov",
        darkVideoSrc: "/videos/admin/accounts-dark.mov",
      },
      {
        label: "Redeem Codes",
        icon: MdOutlinePayments,
        href: "/sections/admin/redeem-codes",
        lightVideoSrc: "/videos/admin/accounts-light.mov",
        darkVideoSrc: "/videos/admin/accounts-dark.mov",
      },
      {
        label: "Printers",
        icon: HiOutlinePrinter,
        href: "/sections/admin/printers",
        lightVideoSrc: "/videos/admin/printers-light.mov",
        darkVideoSrc: "/videos/admin/printers-dark.mov",
      },
      {
        label: "Queue Manger",
        icon: BiAddToQueue,
        href: "/sections/admin/queue-manger",
        lightVideoSrc: "/videos/admin/queue-manager-light.mov",
        darkVideoSrc: "/videos/admin/queue-manager-dark.mov",
      },
      {
        label: "Print Release",
        icon: TbChecklist,
        href: "/sections/admin/print-release",
        lightVideoSrc: "/videos/admin/print-release-light.mov",
        darkVideoSrc: "/videos/admin/print-release-dark.mov",
      },
      {
        label: "Reports",
        icon: TbReportSearch,
        href: "/sections/admin/reports",
        lightVideoSrc: "/videos/admin/reports-light.mov",
        darkVideoSrc: "/videos/admin/reports-dark.mov",
      },
      {
        label: "Logs",
        icon: RiFileList2Line,
        href: "/sections/admin/logs",
        lightVideoSrc: "/videos/admin/logs-light.mov",
        darkVideoSrc: "/videos/admin/logs-dark.mov",
      },
    ],
  },
  {
    title: "ACCOUNT",
    items: [
      {
        label: "Notifications",
        icon: RiNotification3Line,
        href: "/sections/admin/notifications",
        lightVideoSrc: "/videos/admin/notifications-light.mov",
        darkVideoSrc: "/videos/admin/notifications-dark.mov",
      },
      {
        label: "Settings",
        icon: RiSettings3Line,
        href: "/sections/admin/settings",
        lightVideoSrc: "/videos/admin/settings-light.mov",
        darkVideoSrc: "/videos/admin/settings-dark.mov",
      },
      {
        label: "Main Page",
        icon: RiLogoutBoxRLine,
        href: "/",
        lightVideoSrc: "/videos/shared/main-page-light.mov",
        darkVideoSrc: "/videos/shared/main-page-dark.mov",
      },
    ],
  },
];

/* ================= USER ================= */
export const userSidebarSections: SidebarSection[] = [
  {
    title: "MENU",
    items: [
      {
        label: "Dashboard",
        icon: RiDashboardFill,
        href: "/sections/user/dashboard",
        lightVideoSrc: "/videos/user/dashboard-light.mov",
        darkVideoSrc: "/videos/user/dashboard-dark.mov",
      },
      {
        label: "Print",
        icon: RiUploadCloud2Line,
        href: "/sections/user/print",
        lightVideoSrc: "/videos/user/print-light.mov",
        darkVideoSrc: "/videos/user/print-dark.mov",
      },
      {
        label: "Recent Print Jobs",
        icon: RiFileList2Line,
        href: "/sections/user/recent-print-jobs",
        lightVideoSrc: "/videos/user/recent-print-jobs-light.mov",
        darkVideoSrc: "/videos/user/recent-print-jobs-dark.mov",
      },
      {
        label: "Pending Jobs",
        icon: TbChecklist,
        href: "/sections/user/pending-jobs",
        lightVideoSrc: "/videos/user/pending-jobs-light.mov",
        darkVideoSrc: "/videos/user/pending-jobs-dark.mov",
      },
      {
        label: "History",
        icon: RiHistoryLine,
        href: "/sections/user/history",
        lightVideoSrc: "/videos/user/history-light.mov",
        darkVideoSrc: "/videos/user/history-dark.mov",
      },
      {
        label: "Redeem",
        icon: MdOutlinePayments,
        href: "/sections/user/redeem",
        lightVideoSrc: "/videos/user/redeem-light.mov",
        darkVideoSrc: "/videos/user/redeem-dark.mov",
      },
      {
        label: "Profile",
        icon: HiOutlineUserCircle,
        href: "/sections/user/profile",
        lightVideoSrc: "/videos/user/profile-light.mov",
        darkVideoSrc: "/videos/user/profile-dark.mov",
      },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      {
        label: "Notifications",
        icon: RiNotification3Line,
        href: "/sections/user/notifications",
        lightVideoSrc: "/videos/user/notifications-light.mov",
        darkVideoSrc: "/videos/user/notifications-dark.mov",
      },
      {
        label: "Settings",
        icon: RiSettings3Line,
        href: "/sections/user/settings",
        lightVideoSrc: "/videos/user/settings-light.mov",
        darkVideoSrc: "/videos/user/settings-dark.mov",
      },
      {
        label: "Main Page",
        icon: RiLogoutBoxRLine,
        href: "/",
        lightVideoSrc: "/videos/shared/main-page-light.mov",
        darkVideoSrc: "/videos/shared/main-page-dark.mov",
      },
    ],
  },
];

/* ================= HELPER ================= */
export const sidebarSectionsByRole: Record<NavbarRole, SidebarSection[]> = {
  admin: adminSidebarSections,
  user: userSidebarSections,
};

export const getSidebarSectionsForRole = (
  role: NavbarRole,
  systemRole?: string,
): SidebarSection[] => {
  const sections = sidebarSectionsByRole[role];

  if (role !== "admin" || !isSubAdminRole(systemRole)) {
    return sections;
  }

  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !isAdminOnlyAdminPath(item.href),
      ),
    }))
    .filter((section) => section.items.length > 0);
};

export const getDockItems = (sections: SidebarSection[]) =>
  sections.flatMap((section) => section.items);
