import PageIntro from "@/components/shared/page/Text/PageIntro";
import PrintQueuesTable from "./components/PrintQueuesTable";

const page = () => {
  return (
    <div className="space-y-5">
      <PageIntro
        title="Queue Manager"
        description="Monitor active print jobs, manage queues, and control job release in real-time."
      />{" "}
      <PrintQueuesTable />
    </div>
  );
};

export default page;
