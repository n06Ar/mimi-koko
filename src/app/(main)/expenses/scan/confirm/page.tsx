"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Pencil, CheckCircle } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-5 pb-10">
      {/* Success Banner */}
      <div
        className="flex items-center gap-2 rounded-xl px-4"
        style={{ backgroundColor: "#E8F5E9", height: "48px" }}
      >
        <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#4CAF50]">
          <CheckCircle size={14} color="white" />
        </div>
        <span className="text-[14px] font-semibold" style={{ color: "#2E7D32" }}>
          読み取り完了！
        </span>
      </div>

      {/* Result Card */}
      <div className="rounded-2xl bg-white overflow-hidden">
        <div
          className="flex items-center justify-between px-4"
          style={{ height: "72px", borderBottom: "1px solid #F0EDE8" }}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] text-[#9EA8B0]">店名</span>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="text-[14px] font-medium text-[#3D3D3D] bg-transparent outline-none"
              placeholder="店名を入力"
            />
          </div>
          <Pencil size={16} color="#9EA8B0" />
        </div>
        <div
          className="flex items-center justify-between px-4"
          style={{ height: "80px", borderBottom: "1px solid #F0EDE8" }}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] text-[#9EA8B0]">金額</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-[14px] font-medium text-[#3D3D3D] bg-transparent outline-none"
              placeholder="金額を入力"
              required
            />
          </div>
          <Pencil size={16} color="#9EA8B0" />
        </div>
        <div className="flex items-center justify-between px-4" style={{ height: "72px" }}>
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] text-[#9EA8B0]">日付</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-[14px] font-medium text-[#3D3D3D] bg-transparent outline-none"
              required
            />
          </div>
          <Pencil size={16} color="#9EA8B0" />
        </div>
      </div>

      <p className="text-[12px] text-[#9EA8B0]">※画像は読み取り後に削除されます</p>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button
        type="submit"
        disabled={create.isPending}
        className="w-full"
        style={{ height: "52px", borderRadius: "12px" }}
      >
        {create.isPending ? "保存中..." : "支出に追加"}
      </Button>
    </form>
  );
}

export default function ConfirmPage() {
  const router = useRouter();

  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      <header
        className="sticky top-0 z-40 bg-white"
        style={{ height: "56px", borderBottom: "1px solid #F0EDE8", display: "flex", alignItems: "center", padding: "0 20px" }}
      >
        <div className="flex w-full items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1 text-[#C4A882]"
          >
            <ArrowLeft size={16} />
            <span className="text-[14px] font-medium">戻る</span>
          </button>
          <h1 className="text-base font-semibold text-[#3D3D3D]">読み取り結果</h1>
          <div className="w-16" />
        </div>
      </header>
      <Suspense fallback={<p className="p-5 text-center text-sm text-[#9EA8B0]">読み込み中...</p>}>
        <ConfirmForm />
      </Suspense>
    </div>
  );
}
