// "use client";

// import React from "react";
// import { IconSparkles } from "@tabler/icons-react";
// import Box1 from "./Box1";
// import Box2 from "./Box2";
// import Box3 from "./Box3";
// import { CardsGrid } from "@/components/ui/card/Cards";

// const Features = () => {
//   const items = [
//     {
//       id: "box-1",
//       content: <Box1 />,
//     },
//     {
//       id: "box-2",
//       content: <Box2 />,
//     },
//     {
//       id: "box-3",
//       content: <Box3 />,
//     },
//   ];

//   return (
//     <section id="features" className="section">
//       <div className="container">
//         <div className="mx-auto max-w-3xl text-center">
//           <div
//             className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"
//             style={{
//               background: "var(--surface-2)",
//               color: "var(--color-brand-600)",
//               border: "1px solid var(--border)",
//             }}
//           >
//             <IconSparkles size={16} />
//             Why EzPrint feels better
//           </div>

//           <h2 className="title-xl">
//             A modern printing experience, not just a form.
//           </h2>

//           <p className="paragraph-lg mt-4">
//             Inspired by polished product interfaces, but redesigned with your
//             colors, your theme, and a more premium printing feel.
//           </p>
//         </div>

//         <div className="mt-10">
//           <CardsGrid items={items} cardClassName="min-h-[420px] p-6 sm:p-8" />
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Features;

import React from "react";
import Box1 from "./Box1";
import Box2 from "./Box2";
import Box3 from "./Box3";
import SectionHeader from "../../components/SectionHeader";

const Features = () => {
  return (
    <section id="features" className="section space-y-10">
      <SectionHeader
        title="EzPrint Features"
        description="Everything you need to manage printing securely, efficiently, and intelligently."
        align="center"
        size="lg"
      />
      <div className="w-full flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-5xl w-full">
          <Box1 />
          <Box2 />
          <Box3 />
        </div>
      </div>
    </section>
  );
};

export default Features;
