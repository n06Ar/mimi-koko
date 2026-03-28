"use client";

import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Header } from "@/components/navigation/header";

const accountTypeLabels: Record<string, string> = {
  credit_card: "クレジットカード",
  bank_account: "銀行口座",
  e_money: "電子マネー",
  cash: "現金",
};

const ACCOUNT_TYPE_ORDER = ["credit_card", "bank_account", "e_money", "cash"];

export default function AccountsPage() {
  const { data: accounts, isLoading } = trpc.account.list.useQuery();
  const utils = trpc.useUtils();
  const deleteAccount = trpc.account.delete.useMutation({
    onSuccess: () => utils.account.list.invalidate(),
  });

  const grouped = ACCOUNT_TYPE_ORDER.reduce<Record<string, typeof accounts>>((acc, type) => {
    const items = accounts?.filter((a) => a.accountType === type) ?? [];
    if (items.length > 0) acc[type] = items;
    return acc;
  }, {});

  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      <Header
        title="口座・カード"
        rightAction={
          <Link href="/accounts/new" className="text-[#C4A882]">
            <Plus size={22} />
          </Link>
        }
      />

      <div className="flex flex-col gap-4 p-4 pb-24">
        {isLoading && <p className="text-center text-sm text-[#9EA8B0]">読み込み中...</p>}
        {!isLoading && accounts?.length === 0 && (
          <p className="text-center text-sm text-[#9EA8B0]">口座がまだありません</p>
        )}

        {Object.entries(grouped).map(([type, items]) => (
          <div key={type} className="flex flex-col gap-2">
            <span className="px-1 text-[12px] font-semibold text-[#9EA8B0]">
              {accountTypeLabels[type] ?? type}
            </span>
            <div className="rounded-xl bg-white overflow-hidden">
              {items?.map((account, i) => (
                <div key={account.id}>
                  {i > 0 && <div className="h-px mx-4" style={{ backgroundColor: "#F0EDE8" }} />}
                  <div className="flex items-center gap-3 px-4" style={{ height: "60px" }}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F0EA]">
                      <span className="text-[14px]">💳</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] font-medium text-[#3D3D3D]">{account.name}</p>
                      {account.last4Digits && (
                        <p className="text-[12px] text-[#9EA8B0]">末尾 {account.last4Digits}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm("この口座を削除しますか？")) {
                          deleteAccount.mutate({ id: account.id });
                        }
                      }}
                      className="text-[12px] text-red-400 mr-2"
                    >
                      削除
                    </button>
                    <ChevronRight size={16} color="#9EA8B0" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
