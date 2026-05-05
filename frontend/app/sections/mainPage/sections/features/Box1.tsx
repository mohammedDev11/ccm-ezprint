"use client";

import SectionHeader from "../../components/SectionHeader";
import SecurePrintQueuePreview from "./SecurePrintQueuePreview";

const Box1 = () => {
  const content = {
    title: "Secure Print Queue",
    description:
      "Your documents stay protected until you authenticate and release them at the printer.",
  };

  return (
    <div className="flex w-full flex-col items-center justify-center gap-12 text-center sm:gap-14 lg:gap-16">
      {/* VISUAL TOP */}
      <div className="mt-8 flex w-full items-center justify-center">
        <div className="w-full max-w-[320px] sm:max-w-[400px] lg:max-w-[480px]">
          <SecurePrintQueuePreview />
        </div>
      </div>

      {/* TEXT BOTTOM */}
      <SectionHeader
        title={content.title}
        description={content.description}
        size="sm"
        align="center"
      />
    </div>
  );
};

export default Box1;
