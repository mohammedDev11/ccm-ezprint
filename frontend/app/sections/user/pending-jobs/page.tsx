import PageIntro from "@/components/shared/page/Text/PageIntro";
import JobsPendingReleaseTable from "./components/JobsPendingReleaseTable";

const page = () => {
  return (
    <div className="space-y-5">
      <PageIntro
        title="Jobs Pending Release"
        description="Review queued jobs, keep the release code, and release the document from the printer screen."
      />
      <JobsPendingReleaseTable />
    </div>
  );
};

export default page;
