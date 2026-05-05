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
import GlowButton from "@/components/ui/button/GlowButton";
import IconLabelButton from "@/components/ui/button/IconLabelButton";
import TutorialVideoPreview from "@/components/ui/card/TutorialVideoCard";
import Modal from "@/components/ui/modal/Modal";
import { useState } from "react";
import { FaRegUser } from "react-icons/fa";
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
  NavbarButton,
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
    <div className="relative w-full pt-24">
      <Navbar>
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />

          <div className="relative z-[70] flex items-center gap-3">
            <ThemeToggle className="text-[var(--foreground)]" />

            <IconLabelButton
              icon={<FaRegUser size={20} />}
              label="Login"
              onClick={() => setIsLoginOpen(true)}
              className="text-[var(--foreground)] "
            />

            <div
              className="relative"
              onMouseEnter={() => setShowStartPreview(true)}
              onMouseLeave={() => setShowStartPreview(false)}
            >
              <GlowButton>Start Printing</GlowButton>

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
              <NavbarButton
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsLoginOpen(true);
                }}
                variant="secondary"
                className="w-full"
              >
                Login
              </NavbarButton>

              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full"
              >
                Start Printing
              </NavbarButton>
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
