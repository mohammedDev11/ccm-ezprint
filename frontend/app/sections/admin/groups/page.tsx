import PageIntro from "@/components/shared/page/Text/PageIntro";
import PrintingGroupsTable from "./components/PrintingGroupsTable";

const page = () => {
  return (
    <div className="space-y-10">
      <PageIntro
        title="Groups"
        description="Organize users into groups to manage permissions and printing policies efficiently."
      />
      <PrintingGroupsTable />
    </div>
  );
};

export default page;
