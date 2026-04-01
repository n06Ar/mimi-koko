"use client";

import { use } from "react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";

export default function SettlementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: settlement, isLoading } = trpc.settlement.getById.useQuery({ id });
  const complete = trpc.settlement.complete.useMutation({
    onSuccess: () => {
      utils.settlement.list.invalidate();
      router.push("/settlements");
    },
  });

  if (isLoading) {
    return (
      <div className="bg-[#FAFAF8] min-h-screen">
        <header className="sticky top-0 z-40 bg-white" style={{ height: "56px", borderBottom: "1px solid #F0EDE8", display: "flex", alignItems: "center", padding: "0 20px" }}>
          <button type="button" onClick={() => router.back()} className="flex items-center gap-1 text-[#C4A882]">
            <ArrowLeft size={16} />
            <span className="text-[14px] font-medium">戻る</span>
          </button>
        </header>
        <p className="p-5 text-center text-sm text-[#9EA8B0]">読み込み中...</p>
      </div>
    );
  }

  if (!settlement) {
    return (
      <div className="bg-[#FAFAF8] min-h-screen">
        <header className="sticky top-0 z-40 bg-white" style={{ height: "56px", borderBottom: "1px solid #F0EDE8", display: "flex", alignItems: "center", padding: "0 20px" }}>
          <button type="button" onClick={() => router.back()} className="flex items-center gap-1 text-[#C4A882]">
            <ArrowLeft size={16} />
            <span className="text-[14px] font-medium">戻る</span>
          </button>
        </header>
        <p className="p-5 text-center text-sm text-[#9EA8B0]">精算が見つかりません</p>
      </div>
    );
  }

  const members = new Map(
    settlement.family.members.map((m) => [m.userId, m.user.name])
  );
  const getDisplayName = (userId: string) => members.get(userId)?.trim() || "不明";
  const getInitial = (userId: string) => members.get(userId)?.trim()?.[0] || "?";
  const totalAmount = settlement.items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      {/* Header */}
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
          <h1 className="text-base font-semibold text-[#3D3D3D]">精算詳細</h1>
          <div className="w-16" />
        </div>
      </header>

      <div className="flex flex-col gap-4 px-4 py-4 pb-28">
        {/* Period Card */}
        <div className="rounded-2xl bg-white p-4 flex flex-col gap-2">
          <p className="text-[13px] text-[#9EA8B0]">
            {dayjs(settlement.periodStart).format("YYYY年M月D日")} 〜{" "}
            {dayjs(settlement.periodEnd).format("YYYY年M月D日")}
          </p>
          <p className="text-[24px] font-bold text-[#3D3D3D]">
            合計 ¥{totalAmount.toLocaleString()}
          </p>
        </div>

        {/* Payment Card */}
        {settlement.items.length > 0 && (
          <div className="rounded-2xl bg-white p-4 flex flex-col gap-3">
            <p className="text-[14px] font-semibold text-[#3D3D3D]">お支払い方法</p>
            {settlement.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F0EA]">
                  <span className="text-[12px] font-bold text-[#C4A882]">
                    {getInitial(item.payerId)}
                  </span>
                </div>
                <ArrowRight size={16} color="#9EA8B0" />
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F0EA]">
                  <span className="text-[12px] font-bold text-[#C4A882]">
                    {getInitial(item.receiverId)}
                  </span>
                </div>
                <div className="flex-1">
                  <span className="text-[13px] text-[#3D3D3D]">
                    {getDisplayName(item.payerId)} → {getDisplayName(item.receiverId)}
                  </span>
                </div>
                <span className="text-[14px] font-bold text-[#3D3D3D]">
                  ¥{item.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}

        {settlement.items.length === 0 && (
          <div className="rounded-2xl bg-white p-4 text-center text-sm text-[#9EA8B0]">
            送金は不要です
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white"
        style={{ height: "80px", borderTop: "1px solid #F0EDE8", padding: "12px 16px 20px 16px" }}
      >
        <Button
          className="w-full"
          style={{ height: "52px", borderRadius: "12px" }}
          onClick={() => complete.mutate({ id })}
          disabled={complete.isPending || settlement.status === "completed"}
        >
          {complete.isPending ? "処理中..." : settlement.status === "completed" ? "精算済み" : "精算済みにする"}
        </Button>
      </div>
    </div>
  );
}
