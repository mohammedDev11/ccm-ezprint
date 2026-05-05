import PageIntro from "@/components/shared/page/Text/PageIntro";
import PrintersGrid from "./components/PrintersGrid";

const page = () => {
  return (
    <div className="space-y-10">
      <PageIntro
        title="Printers"
        description="Monitor printer health, status, and activity across all connected devices."
      />
      <PrintersGrid />
    </div>
  );
};

export default page;
