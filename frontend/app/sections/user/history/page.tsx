import PageIntro from "@/components/shared/page/Text/PageIntro";
import UserTransactionHistoryTable from "./components/TransactionTypeBadge";

const page = () => {
  return (
    <div className="space-y-5">
      <PageIntro
        title="Transaction History"
        description="Review your balance changes, print charges, refunds, and redeemed credits."
      />
      <UserTransactionHistoryTable />
    </div>
  );
};

export default page;
