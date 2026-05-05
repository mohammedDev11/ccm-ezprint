import PageIntro from "@/components/shared/page/Text/PageIntro";
import RedeemCardBox from "./components/RedeemCardBox";

const page = () => {
  return (
    <div className="space-y-10">
      <PageIntro
        title="Redeem Card"
        description="Add quota to your account by entering your voucher code."
      />
      <RedeemCardBox />
    </div>
  );
};

export default page;
