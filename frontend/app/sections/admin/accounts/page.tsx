"use client";

import SegmentToggle from "@/components/shared/actions/SegmentToggle";
import PageIntro from "@/components/shared/page/Text/PageIntro";
import Button from "@/components/ui/button/Button";
import { ArrowLeftRight, Plus, Wallet } from "lucide-react";
import { useRef, useState } from "react";
import SharedAccountsTable, {
  type SharedAccountsTableHandle,
} from "./tables/SharedAccountsTable";
import TransactionsTable from "./tables/TransactionsTable";
// import SharedAccountsTable from "./tables/SharedAccountsTable";
// import TransactionsTable from "./tables/TransactionsTable";

const AccountsPage = () => {
  const [activeTab, setActiveTab] = useState("shared-accounts");
  const sharedAccountsTableRef = useRef<SharedAccountsTableHandle>(null);

  return (
    <div className="space-y-6">
      <PageIntro
        title="Accounts"
        description="Manage shared cost centers and user transaction history."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentToggle
          value={activeTab}
          onChange={setActiveTab}
          options={[
            {
              value: "shared-accounts",
              label: "Shared Accounts",
              icon: <Wallet className="h-4 w-4" />,
            },
            {
              value: "transactions",
              label: "Transactions",
              icon: <ArrowLeftRight className="h-4 w-4" />,
            },
          ]}
        />

        {activeTab === "shared-accounts" ? (
          <Button
            iconLeft={<Plus className="h-4 w-4" />}
            className="h-14 px-6 text-base"
            onClick={() => sharedAccountsTableRef.current?.openCreateModal()}
          >
            Create
          </Button>
        ) : null}
      </div>

      {activeTab === "shared-accounts" && (
        <SharedAccountsTable ref={sharedAccountsTableRef} />
      )}
      {activeTab === "transactions" && <TransactionsTable />}
    </div>
  );
};

export default AccountsPage;
