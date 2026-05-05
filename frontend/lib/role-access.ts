export const ADMIN_ONLY_ADMIN_PATHS = [
  "/sections/admin/printers",
  "/sections/admin/queue-manger",
  "/sections/admin/queue-manager",
  "/sections/admin/print-release",
  "/sections/admin/reports",
];

type RoleLikeUser = {
  role?: string;
  systemRole?: string;
};

export const getRoutingRole = (user?: RoleLikeUser | null) =>
  user?.systemRole || user?.role || "User";

export const isSubAdminRole = (role?: string) => role === "SubAdmin";

export const isAdminOnlyAdminPath = (pathname: string) =>
  ADMIN_ONLY_ADMIN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

export const canAccessAdminPath = (role: string | undefined, pathname: string) =>
  !(isSubAdminRole(role) && isAdminOnlyAdminPath(pathname));
