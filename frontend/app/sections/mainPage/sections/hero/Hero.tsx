// "use client";

// import React from "react";
// import { HeroParallax } from "./hero-parallax";
// import { LayoutTextFlip } from "../../components/ui/layout-text-flip";

// const products = [
//   {
//     title: "Moonbeam",
//     link: "https://gomoonbeam.com",
//     thumbnail:
//       "https://www.aceternity.com/images/products/thumbnails/new/moonbeam.png",
//   },
//   {
//     title: "Cursor",
//     link: "https://cursor.so",
//     thumbnail:
//       "https://www.aceternity.com/images/products/thumbnails/new/cursor.png",
//   },
//   {
//     title: "Rogue",
//     link: "https://userogue.com",
//     thumbnail:
//       "https://www.aceternity.com/images/products/thumbnails/new/rogue.png",
//   },
//   {
//     title: "Editorially",
//     link: "https://editorially.org",
//     thumbnail:
//       "https://www.aceternity.com/images/products/thumbnails/new/editorially.png",
//   },
//   {
//     title: "Editrix AI",
//     link: "https://editrix.ai",
//     thumbnail:
//       "https://www.aceternity.com/images/products/thumbnails/new/editrix.png",
//   },
//   {
//     title: "Pixel Perfect",
//     link: "https://app.pixelperfect.quest",
//     thumbnail:
//       "https://www.aceternity.com/images/products/thumbnails/new/pixelperfect.png",
//   },
//   {
//     title: "Algochurn",
//     link: "https://algochurn.com",
//     thumbnail:
//       "https://www.aceternity.com/images/products/thumbnails/new/algochurn.png",
//   },
//   {
//     title: "Aceternity UI",
//     link: "https://ui.aceternity.com",
//     thumbnail:
//       "https://www.aceternity.com/images/products/thumbnails/new/aceternityui.png",
//   },
//   {
//     title: "Tailwind Master Kit",
//     link: "https://tailwindmasterkit.com",
//     thumbnail:
//       "https://www.aceternity.com/images/products/thumbnails/new/tailwindmasterkit.png",
//   },
//   {
//     title: "SmartBridge",
//     link: "https://smartbridgetech.com",
//     thumbnail:
//       "https://www.aceternity.com/images/products/thumbnails/new/smartbridge.png",
//   },
//   {
//     title: "Renderwork Studio",
//     link: "https://renderwork.studio",
//     thumbnail:
//       "https://www.aceternity.com/images/products/thumbnails/new/renderwork.png",
//   },
//   {
//     title: "Creme Digital",
//     link: "https://cremedigital.com",
//     thumbnail:
//       "https://www.aceternity.com/images/products/thumbnails/new/cremedigital.png",
//   },
//   {
//     title: "Golden Bells Academy",
//     link: "https://goldenbellsacademy.com",
//     thumbnail:
//       "https://www.aceternity.com/images/products/thumbnails/new/goldenbellsacademy.png",
//   },
//   {
//     title: "Invoker Labs",
//     link: "https://invoker.lol",
//     thumbnail:
//       "https://www.aceternity.com/images/products/thumbnails/new/invoker.png",
//   },
//   {
//     title: "E Free Invoice",
//     link: "https://efreeinvoice.com",
//     thumbnail:
//       "https://www.aceternity.com/images/products/thumbnails/new/efreeinvoice.png",
//   },
// ];

// const Hero = () => {
//   return (
//     <HeroParallax
//       products={products}
//       title={
//         <LayoutTextFlip
//           text="Welcome to EzPrint,"
//           words={["Simple", "Built for KFUPM", "Secure", "Smart"]}
//         />
//       }
//       description="Manage your print jobs, upload files easily, and print with a modern experience designed to be simple, secure, and efficient."
//       primaryAction={{
//         label: "Go to User",
//         href: "/sections/user/print",
//       }}
//       secondaryAction={{
//         label: "Go to Admin",
//         href: "/sections/admin/dashboard",
//       }}
//     />
//   );
// };

// export default Hero;

//=========NEW==============
// "use client";

// import React from "react";
// import { HeroParallax } from "./hero-parallax";
// import { LayoutTextFlip } from "../../components/ui/layout-text-flip";

// const TEST_IMAGE = "mainPAge/hero/test.png";

// const products = [
//   { title: "Upload Files", link: "#", thumbnail: TEST_IMAGE },
//   { title: "Print Jobs", link: "#", thumbnail: TEST_IMAGE },
//   { title: "Queue Management", link: "#", thumbnail: TEST_IMAGE },
//   { title: "Secure Release", link: "#", thumbnail: TEST_IMAGE },
//   { title: "User Profile", link: "#", thumbnail: TEST_IMAGE },
//   { title: "Print History", link: "#", thumbnail: TEST_IMAGE },
//   { title: "Wallet & Payments", link: "#", thumbnail: TEST_IMAGE },
//   { title: "Device Management", link: "#", thumbnail: TEST_IMAGE },
//   { title: "Admin Dashboard", link: "#", thumbnail: TEST_IMAGE },
//   { title: "Reports & Analytics", link: "#", thumbnail: TEST_IMAGE },
//   { title: "Notifications", link: "#", thumbnail: TEST_IMAGE },
//   { title: "System Logs", link: "#", thumbnail: TEST_IMAGE },
//   { title: "Security Settings", link: "#", thumbnail: TEST_IMAGE },
//   { title: "Access Control", link: "#", thumbnail: TEST_IMAGE },
//   { title: "Shared Accounts", link: "#", thumbnail: TEST_IMAGE },
// ];

// const Hero = () => {
//   return (
//     <HeroParallax
//       products={products}
//       title={
//         <LayoutTextFlip
//           text="Welcome to EzPrint,"
//           words={["Simple", "Built for KFUPM", "Secure", "Smart"]}
//         />
//       }
//       description="Manage your print jobs, upload files easily, and print with a modern experience designed to be simple, secure, and efficient."
//       primaryAction={{
//         label: "Go to User",
//         href: "/sections/user/print",
//       }}
//       secondaryAction={{
//         label: "Go to Admin",
//         href: "/sections/admin/dashboard",
//       }}
//     />
//   );
// };

// export default Hero;

// ===========NEW================
"use client";

import React from "react";
import { HeroParallax } from "./hero-parallax";
import { LayoutTextFlip } from "../../components/ui/layout-text-flip";
import { heroProducts } from "@/lib/mock-data/HeroImages";

const Hero = () => {
  return (
    <HeroParallax
      products={heroProducts}
      title={
        <LayoutTextFlip
          text="Welcome to EzPrint,"
          words={["Simple", "Built for KFUPM", "Secure", "Smart"]}
        />
      }
      description="Manage your print jobs, upload files easily, and print with a modern experience designed to be simple, secure, and efficient."
      primaryAction={{
        label: "Go to User",
        href: "/sections/user/print",
      }}
      secondaryAction={{
        label: "Go to Admin",
        href: "/sections/admin/dashboard",
      }}
    />
  );
};

export default Hero;
