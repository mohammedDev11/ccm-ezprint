// "use client";

// import { useState } from "react";
// import ThemeToggle from "@/components/shared/actions/ThemeToggle";
// import Content from "./Content";
// import {
//   Navbar,
//   NavBody,
//   NavItems,
//   MobileNav,
//   NavbarLogo,
//   NavbarButton,
//   MobileNavHeader,
//   MobileNavToggle,
//   MobileNavMenu,
// } from "./Navbar";
// import IconLabelButton from "@/components/ui/button/IconLabelButton";
// import { FaRegUser } from "react-icons/fa";
// import Modal from "@/components/ui/modal/Modal";
// import SSO from "./SSO";
// import GlowButton from "@/components/ui/button/GlowButton";

// export function MainNavbar() {
//   const navItems = [
//     { name: "Features", link: "#features" },
//     { name: "How It Works", link: "#how-it-works" },
//     { name: "Web Print", link: "#web-print" },
//     { name: "Pricing", link: "#pricing" },
//     { name: "FAQ", link: "#faq" },
//     { name: "Contact", link: "#contact" },
//   ];

//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isLoginOpen, setIsLoginOpen] = useState(false); // 👈 NEW

//   return (
//     <div className="relative w-full pt-24">
//       <Navbar>
//         <NavBody>
//           <NavbarLogo />
//           <NavItems items={navItems} />

//           <div className="relative z-[70] flex items-center gap-1">
//             <ThemeToggle className="text-[var(--foreground)] -mr-3" />

//             <IconLabelButton
//               icon={<FaRegUser size={20} />}
//               label="Login"
//               onClick={() => setIsLoginOpen(true)} // 👈 OPEN MODAL
//               className="text-[var(--foreground)] "
//             />

//             {/* <NavbarButton variant="primary">Start Printing</NavbarButton> */}
//             <GlowButton>
//               {/* <UserPlus size={18} /> */}
//               Start Printing{" "}
//             </GlowButton>
//           </div>
//         </NavBody>

//         <MobileNav>
//           <MobileNavHeader>
//             <NavbarLogo />
//             <MobileNavToggle
//               isOpen={isMobileMenuOpen}
//               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//             />
//           </MobileNavHeader>

//           <MobileNavMenu
//             isOpen={isMobileMenuOpen}
//             onClose={() => setIsMobileMenuOpen(false)}
//           >
//             {navItems.map((item, idx) => (
//               <a
//                 key={`mobile-link-${idx}`}
//                 href={item.link}
//                 onClick={() => setIsMobileMenuOpen(false)}
//                 className="relative text-[var(--muted)] transition-colors duration-200 hover:text-[var(--foreground)]"
//               >
//                 <span className="block">{item.name}</span>
//               </a>
//             ))}

//             <div className="flex w-full flex-col gap-3">
//               <NavbarButton
//                 onClick={() => {
//                   setIsMobileMenuOpen(false);
//                   setIsLoginOpen(true); // 👈 mobile login opens modal too
//                 }}
//                 variant="secondary"
//                 className="w-full"
//               >
//                 Login
//               </NavbarButton>

//               <NavbarButton
//                 onClick={() => setIsMobileMenuOpen(false)}
//                 variant="primary"
//                 className="w-full"
//               >
//                 Start Printing
//               </NavbarButton>
//             </div>
//           </MobileNavMenu>
//         </MobileNav>
//       </Navbar>

//       {/* ✅ MODAL */}
//       <Modal open={isLoginOpen} onClose={() => setIsLoginOpen(false)}>
//         <SSO />
//       </Modal>

//       <Content />
//     </div>
//   );
// }

// ============New==============
"use client";

import ThemeToggle from "@/components/shared/actions/ThemeToggle";
import IconLabelButton from "@/components/ui/button/IconLabelButton";
import TutorialVideoPreview from "@/components/ui/card/TutorialVideoCard";
import Modal from "@/components/ui/modal/Modal";
import Link from "next/link";
import { useState } from "react";
import { UserRound } from "lucide-react";
import Content from "../Content";
import SSO from "../sections/SSO";
import {
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavBody,
  NavItems,
  Navbar,
  NavbarLogo,
} from "./Navbar";

export function MainNavbar() {
  const navItems = [
    { name: "Features", link: "#features" },
    { name: "How It Works", link: "#how-it-works" },
    { name: "Secure & Private", link: "#secure-private" },
    { name: "FAQ", link: "#faq" },
    { name: "Contact", link: "#contact" },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showStartPreview, setShowStartPreview] = useState(false);

  return (
    <div className="relative w-full overflow-x-clip bg-[var(--background)] pt-24 text-[var(--foreground)]">
      <Navbar>
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />

          <div className="relative z-[70] flex items-center gap-3">
            <ThemeToggle className="hidden lg:inline-flex" iconOnly />

            <IconLabelButton
              icon={<UserRound size={18} />}
              label="Login"
              onClick={() => setIsLoginOpen(true)}
              className="hidden lg:inline-flex"
              iconOnly
            />

            <div
              className="relative"
              onMouseEnter={() => setShowStartPreview(true)}
              onMouseLeave={() => setShowStartPreview(false)}
            >
              <StartPrintingLink />

              {showStartPreview && (
                <div className="pointer-events-none absolute right-0 top-[calc(100%+18px)] z-[120]">
                  <TutorialVideoPreview
                    title="Start Printing"
                    lightVideoSrc="/videos/start-printing-light.mov"
                    darkVideoSrc="/videos/start-printing-dark.mov"
                    className="w-[420px]"
                  />
                </div>
              )}
            </div>
          </div>
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-[var(--muted)] transition-colors duration-200 hover:text-[var(--foreground)]"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}

            <div className="flex w-full flex-col gap-3">
              <div className="flex items-center gap-3">
                <ThemeToggle iconOnly />

                <IconLabelButton
                  icon={<UserRound size={18} />}
                  label="Login"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsLoginOpen(true);
                  }}
                  iconOnly
                />
              </div>

              <StartPrintingLink
                className="w-full"
                onClick={() => setIsMobileMenuOpen(false)}
              />
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      <Modal open={isLoginOpen} onClose={() => setIsLoginOpen(false)}>
        <SSO />
      </Modal>

      <Content />
    </div>
  );
}

const StartPrintingLink = ({
  className = "",
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <Link
      href="/sections/user/print"
      onClick={onClick}
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-2xl border border-[var(--border)] px-7 py-3 font-medium text-[var(--foreground)] transition-all duration-300 hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 ${className}`}
    >
      <span className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-support-300 via-brand-500 to-brand-700 opacity-60 blur-md" />
      <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-support-300 via-brand-500 to-brand-700 opacity-80" />
      <span className="absolute inset-[1.5px] rounded-2xl bg-[var(--background)]" />
      <span className="relative z-10">Start Printing</span>
    </Link>
  );
};
