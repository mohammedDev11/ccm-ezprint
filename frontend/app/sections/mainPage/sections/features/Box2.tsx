"use client";

import { HoverFolderBadge } from "@/components/ui/badge/HoverFolderBadge";
import {
  IconFileTypeDocx,
  IconFileTypePdf,
  IconFileTypeXls,
} from "@tabler/icons-react";
import SectionHeader from "../../components/SectionHeader";

const Box2 = () => {
  const content = {
    title: "Upload & Print Any File",
    description:
      "Easily upload PDF, Word, or Excel files to the secure print queue.",
  };

  const files = [
    {
      id: "pdf",
      label: "PDF",
      icon: IconFileTypePdf,
      iconClassName: "text-red-500",
    },
    {
      id: "docx",
      label: "WORD",
      icon: IconFileTypeDocx,
      iconClassName: "text-[var(--color-support-500)]",
    },
    {
      id: "xls",
      label: "EXCEL",
      icon: IconFileTypeXls,
      iconClassName: "text-emerald-500",
    },
  ];

  return (
    <div className="flex w-full flex-col items-center justify-center gap-20 text-center">
      {/* TEXT TOP */}
      <SectionHeader
        title={content.title}
        description={content.description}
        size="sm"
        align="center"
      />

      {/* FOLDER CENTER */}
      <div className="mt-8 flex items-center justify-center">
        <HoverFolderBadge
          text=""
          items={files}
          className="overflow-visible bg-transparent scale-[1.2]"
          enableTimerPreview={true}
          previewStartDelay={1000}
          previewOpenDuration={1200}
          previewInterval={8000}
          repeatPreview={true}
          folderSize={{ width: 120, height: 90 }}
          teaserCardSize={{ width: 56, height: 36 }}
          hoverCardSize={{ width: 140, height: 100 }}
        />
      </div>
    </div>
  );
};

export default Box2;
