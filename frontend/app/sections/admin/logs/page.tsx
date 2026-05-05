import PageIntro from "@/components/shared/page/Text/PageIntro";
import ActivityLogTable from "./components/ActivityLogTable";

const page = () => {
  return (
    <div className="flex flex-col gap-10">
      <PageIntro
        title="Logs"
        description="Review system events, printer logs, and user activity for monitoring and troubleshooting."
      />
      <ActivityLogTable />
    </div>
  );
};

export default page;
