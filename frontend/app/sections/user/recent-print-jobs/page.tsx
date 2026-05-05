import PageIntro from "@/components/shared/page/Text/PageIntro";
import RecentPrintJobsTable from "./components/RecentPrintJobsTable";

const page = () => {
  return (
    <div className="space-y-5">
      <PageIntro
        title="Recent Print Jobs"
        description="Review your recent print activity, including status, cost, and document details."
      />
      <RecentPrintJobsTable />
    </div>
  );
};

export default page;
