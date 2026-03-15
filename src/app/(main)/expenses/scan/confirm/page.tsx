"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trpc } from "@/trpc/client";
import { Header } from "@/components/navigation/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

function ConfirmForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [storeName, setStoreName] = useState(params.get("storeName") ?? "");
  const [amount, setAmount] = useState(params.get("amount") ?? "");
  const [date, setDate] = useState(params.get("date") ?? new Date().toISOString().slice(0, 10));
  const [error, setError] = useState("");
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
    create.mutate({
      amount: Number(amount),
      storeName: storeName || undefined,
      date,
    });
  };

  return (
    <Card padding="md" shadow="sm">
      <p className="mb-4 text-sm text-gray-500">
        内容を確認・修正してください
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="金額"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
        <Input
          label="店名"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
        />
        <Input
          label="日付"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={create.isPending} className="w-full">
          {create.isPending ? "保存中..." : "支出を保存"}
        </Button>
      </form>
    </Card>
  );
}

export default function ConfirmPage() {
  return (
    <div>
      <Header title="OCR確認" />
      <div className="p-4">
        <Suspense fallback={<p className="text-center text-gray-500">読み込み中...</p>}>
          <ConfirmForm />
        </Suspense>
      </div>
    </div>
  );
}
