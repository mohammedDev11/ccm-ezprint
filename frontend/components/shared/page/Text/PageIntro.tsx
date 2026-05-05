"use client";

import React from "react";
import { cn } from "@/lib/cn";
import SectionBadge from "../SectionBadge";

type PageIntroProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
};

const PageIntro = ({
  title,
  description,
  actions,
  className = "",
}: PageIntroProps) => {
  console.log("NEW PageIntro RENDERED");

  return (
    <div className={cn("relative min-h-[4rem] pt-16", className)}>
      <SectionBadge title={title} description={description} />

      {actions ? <div className="flex justify-end">{actions}</div> : null}
    </div>
  );
};

export default PageIntro;
