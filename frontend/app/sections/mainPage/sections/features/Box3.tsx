"use client";

import SectionHeader from "../../components/SectionHeader";
import FullSystemControlPreview from "./FullSystemControlPreview";

const Box3 = () => {
  const content = {
    title: "Full System Control",
    description:
      "Monitor print jobs, manage balances, and track usage in real time.",
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-12 sm:gap-14 lg:gap-16 text-center">
      {/* VISUAL */}
      <div className="mt-8 flex w-full items-center justify-center">
        <div className="w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[500px]">
          <FullSystemControlPreview />
        </div>
      </div>

      {/* TEXT */}
      <SectionHeader
        title={content.title}
        description={content.description}
        size="sm"
        align="center"
      />
    </div>
  );
};

export default Box3;
