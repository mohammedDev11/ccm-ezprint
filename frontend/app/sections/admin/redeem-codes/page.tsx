import PageIntro from "@/components/shared/page/Text/PageIntro";
import RedeemCodesTable from "./components/RedeemCodesTable";

const page = () => {
  return (
    <div className="flex flex-col gap-10">
      <PageIntro
        title="Redeem Codes"
        description="Generate one-time quota vouchers and monitor redemption activity."
      />
      <RedeemCodesTable />
    </div>
  );
};

export default page;
