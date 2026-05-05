import PageIntro from "@/components/shared/page/Text/PageIntro";
import React from "react";
import Information from "./components/Information";

const page = () => {
  return (
    <div className="space-y-10">
      <PageIntro
        title="Profile"
        description="View and manage your account details, personal information, and printing identity."
      />
      <Information />
    </div>
  );
};

export default page;
