"use client";

import {
  canAccessAdminPath,
  getRoutingRole,
} from "@/lib/role-access";
import { getSession, type Scope } from "@/services/api";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const scopeAllowsRole = (scope: Scope, role: string) => {
  if (scope === "admin") {
    return role === "Admin" || role === "SubAdmin";
  }

  return role === "User" || role === "Admin" || role === "SubAdmin";
};

export default function RoleGuard({
  scope,
  children,
}: {
  scope: Scope;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [authorizedPathname, setAuthorizedPathname] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let isActive = true;
    const session = getSession(scope);
    const routingRole = getRoutingRole(session?.user);
    const redirectTo = (href: string) => {
      queueMicrotask(() => {
        if (!isActive) return;
        setReady(false);
        setAuthorizedPathname(null);
        router.replace(href);
      });
    };

    if (!session || !scopeAllowsRole(scope, routingRole)) {
      redirectTo("/");
      return;
    }

    if (scope === "admin" && !canAccessAdminPath(routingRole, pathname)) {
      redirectTo("/sections/admin/dashboard");
      return;
    }

    queueMicrotask(() => {
      if (isActive) {
        setAuthorizedPathname(pathname);
        setReady(true);
      }
    });

    return () => {
      isActive = false;
    };
  }, [pathname, router, scope]);

  if (!ready || authorizedPathname !== pathname) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--muted)]">
        Checking session...
      </div>
    );
  }

  return <>{children}</>;
}
