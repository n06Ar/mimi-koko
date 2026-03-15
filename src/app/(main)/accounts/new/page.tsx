"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { Header } from "@/components/navigation/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type AccountType = "credit_card" | "bank_account" | "e_money" | "cash";

const accountTypes: { value: AccountType; label: string }[] = [
  { value: "credit_card", label: "クレジットカード" },
  { value: "bank_account", label: "銀行口座" },
  { value: "e_money", label: "電子マネー" },
  { value: "cash", label: "現金" },
];

export default function NewAccountPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("credit_card");
  const [providerName, setProviderName] = useState("");
  const [last4Digits, setLast4Digits] = useState("");
  const [error, setError] = useState("");
  const utils = trpc.useUtils();

  const create = trpc.account.create.useMutation({
    onSuccess: () => {
      utils.account.list.invalidate();
      router.push("/accounts");
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    create.mutate({
      name,
      accountType,
      providerName: providerName || undefined,
      last4Digits: last4Digits || undefined,
    });
  };

  return (
    <div>
      <Header title="口座を追加" />
      <div className="p-4">
        <Card padding="md" shadow="sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="口座名"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 楽天カード"
              required
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#3D3D3D]">種別</label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as AccountType)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-[#3D3D3D] focus:border-[#C4A882] focus:outline-none focus:ring-1 focus:ring-[#C4A882]"
              >
                {accountTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="発行会社・銀行名（任意）"
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              placeholder="例: 楽天銀行"
            />
            <Input
              label="末尾4桁（任意）"
              value={last4Digits}
              onChange={(e) => setLast4Digits(e.target.value)}
              maxLength={4}
              pattern="[0-9]{4}"
              placeholder="1234"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={create.isPending} className="w-full">
              {create.isPending ? "追加中..." : "追加する"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
