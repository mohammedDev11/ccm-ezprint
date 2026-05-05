import PageIntro from "@/components/shared/page/Text/PageIntro";
import React from "react";
import UserNotificationsTable from "./components/UserNotificationsTable";

const page = () => {
  return (
    <div className="space-y-5">
      <PageIntro
        title="Notifications"
        description="Stay updated with important alerts about your print jobs, balance status, and system messages."
      />
      <UserNotificationsTable />
    </div>
  );
};

export default page;
