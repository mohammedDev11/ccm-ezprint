"use client";

import SidebarNavbar from "./SidebarNavbar";
import MobileNavbar from "./MobileNavbar";
import NavbarModeSwitcher, { type NavbarMode } from "./NavbarModeSwitcher";
import type { SidebarSection } from "@/lib/mock-data/Navbar";
import DockNavbarBottom from "./DockNavbar/DockNavbarBottom";
import DockNavbarTop from "./DockNavbar/DockNavbarTop";

type AppNavbarProps = {
  mode: NavbarMode;
  onModeChange: (mode: NavbarMode) => void;
  isSidebarExpanded: boolean;
  onSidebarMouseEnter: () => void;
  onSidebarMouseLeave: () => void;
  sections: SidebarSection[];
};

export default function AppNavbar({
  mode,
  onModeChange,
  isSidebarExpanded,
  onSidebarMouseEnter,
  onSidebarMouseLeave,
  sections,
}: AppNavbarProps) {
  return (
    <>
      <MobileNavbar sections={sections} />

      <div className="fixed right-4 top-4 z-[60] hidden md:block">
        <NavbarModeSwitcher value={mode} onChange={onModeChange} />
      </div>

      {mode === "left" && (
        <SidebarNavbar
          sections={sections}
          isExpanded={isSidebarExpanded}
          onMouseEnter={onSidebarMouseEnter}
          onMouseLeave={onSidebarMouseLeave}
        />
      )}

      {mode === "right" && (
        <SidebarNavbar
          sections={sections}
          isExpanded={isSidebarExpanded}
          onMouseEnter={onSidebarMouseEnter}
          onMouseLeave={onSidebarMouseLeave}
          side="right"
        />
      )}

      {mode === "bottom" && <DockNavbarBottom sections={sections} />}
      {mode === "top" && <DockNavbarTop sections={sections} />}
    </>
  );
}
