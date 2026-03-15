"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { Header } from "@/components/navigation/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";

export default function NewExpensePage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [storeName, setStoreName] = useState("");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [isPrivate, setIsPrivate] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [error, setError] = useState("");

  const { data: accounts } = trpc.account.list.useQuery();
  const { data: family } = trpc.family.getMyFamily.useQuery();
  const utils = trpc.useUtils();

  const create = trpc.expense.create.useMutation({
    onSuccess: () => {
      utils.expense.list.invalidate();
      router.push("/expenses");
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const memberIds = family?.members.map((m) => m.userId) ?? [];

    create.mutate({
      amount: Number(amount),
      storeName: storeName || undefined,
      date,
      accountId: accountId || undefined,
      isPrivate,
      memberIds: isPrivate ? [] : memberIds,
    });
  };

  return (
    <div>
      <Header title="支出を追加" />
      <div className="p-4">
        <Card padding="md" shadow="sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="金額"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min={1}
              placeholder="1000"
            />
            <Input
              label="店名（任意）"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="例: セブンイレブン"
            />
            <Input
              label="日付"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#3D3D3D]">
                口座（任意）
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-[#3D3D3D] focus:border-[#C4A882] focus:outline-none"
              >
                <option value="">なし</option>
                {accounts?.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <Toggle
              checked={isPrivate}
              onChange={setIsPrivate}
              label="プライベート支出（精算対象外）"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={create.isPending} className="w-full">
              {create.isPending ? "保存中..." : "保存する"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
