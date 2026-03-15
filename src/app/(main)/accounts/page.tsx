"use client";

import Link from "next/link";
import { trpc } from "@/trpc/client";
import { Header } from "@/components/navigation/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const accountTypeLabels: Record<string, string> = {
  credit_card: "クレジットカード",
  bank_account: "銀行口座",
  e_money: "電子マネー",
  cash: "現金",
};

export default function AccountsPage() {
  const { data: accounts, isLoading } = trpc.account.list.useQuery();
  const utils = trpc.useUtils();
  const deleteAccount = trpc.account.delete.useMutation({
    onSuccess: () => utils.account.list.invalidate(),
  });

  return (
    <div>
      <Header
        title="口座管理"
        rightAction={
          <Link href="/accounts/new">
            <Button size="sm">追加</Button>
          </Link>
        }
      />
      <div className="p-4">
        {isLoading && <p className="text-center text-gray-500">読み込み中...</p>}
        {accounts?.length === 0 && (
          <p className="text-center text-gray-500">口座がまだありません</p>
        )}
        <div className="flex flex-col gap-3">
          {accounts?.map((account) => (
            <Card key={account.id} padding="md" shadow="sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#3D3D3D]">{account.name}</p>
                  <p className="text-sm text-gray-500">
                    {accountTypeLabels[account.accountType] ?? account.accountType}
                    {account.last4Digits && ` (末尾${account.last4Digits})`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("この口座を削除しますか？")) {
                      deleteAccount.mutate({ id: account.id });
                    }
                  }}
                  className="text-sm text-red-400 hover:text-red-600"
                >
                  削除
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
