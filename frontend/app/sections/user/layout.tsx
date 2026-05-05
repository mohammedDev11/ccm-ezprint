// import NavbarShell from "@/components/shared/page/navbar/NavbarShell";
// import React from "react";

// export default function Layout({ children }: { children: React.ReactNode }) {
//   return <NavbarShell>{children}</NavbarShell>;
// }

import React from "react";
import NavbarShell from "@/components/shared/page/navbar/NavbarShell";
import RoleGuard from "@/components/auth/RoleGuard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard scope="user">
      <NavbarShell role="user">{children}</NavbarShell>
    </RoleGuard>
  );
}
