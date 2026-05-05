import PageIntro from "@/components/shared/page/Text/PageIntro";

import ReportsPanel from "./components/ReportsPanel";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageIntro
        title="Reports"
        description="Analyze printing activity, usage statistics, and system performance through reports."
      />
      <ReportsPanel />
    </div>
  );
}
