"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { useState } from "react";
import { Plus, Calendar, ArrowRight } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Header } from "@/components/navigation/header";

export default function SettlementsPage() {
  const { data: family } = trpc.family.getMyFamily.useQuery();
  const { data: settlements, isLoading } = trpc.settlement.list.useQuery(
    { familyId: family?.id ?? "" },
    { enabled: !!family?.id }
  );
  const [creating, setCreating] = useState(false);
  const utils = trpc.useUtils();

  const createSettlement = trpc.settlement.create.useMutation({
    onSuccess: () => {
      utils.settlement.list.invalidate();
      setCreating(false);
    },
    onSettled: () => setCreating(false),
  });

  const completeSettlement = trpc.settlement.complete.useMutation({
    onSuccess: () => utils.settlement.list.invalidate(),
  });

  const handleCreate = () => {
    if (!family?.id) return;
    setCreating(true);
    const now = dayjs();
    createSettlement.mutate({
      familyId: family.id,
      periodStart: now.startOf("month").toISOString(),
      periodEnd: now.endOf("month").toISOString(),
    });
  };

  const pending = settlements?.filter((s) => s.status !== "completed") ?? [];
  const completed = settlements?.filter((s) => s.status === "completed") ?? [];

  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      <Header
        title="精算"
        rightAction={
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating || !family}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C4A882] disabled:opacity-50"
          >
            <Plus size={18} color="white" />
          </button>
        }
      />

      <div className="flex flex-col gap-5 px-5 py-5 pb-24">
        {isLoading && <p className="text-center text-sm text-[#9EA8B0]">読み込み中...</p>}

        {pending.length > 0 && (
          <div className="flex flex-col gap-3">
            <span className="text-[15px] font-semibold text-[#3D3D3D]">未精算</span>
            {pending.map((settlement) => (
              <Link key={settlement.id} href={`/settlements/${settlement.id}`}>
                <div
                  className="rounded-2xl bg-white p-5 flex flex-col gap-4"
                  style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.063)" }}
                >
                  <div className="flex items-center gap-2 text-[13px] text-[#9EA8B0]">
                    <Calendar size={14} color="#9EA8B0" />
                    <span>
                      {dayjs(settlement.periodStart).format("YYYY年M月D日")} 〜{" "}
                      {dayjs(settlement.periodEnd).format("M月D日")}
                    </span>
                  </div>
                  <div className="text-[20px] font-bold text-[#3D3D3D]">
                    ¥{settlement.items.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                  </div>
                  <div className="h-px" style={{ backgroundColor: "#E8E4DC" }} />
                  {settlement.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-[13px] text-[#3D3D3D]">
                      <ArrowRight size={14} color="#9EA8B0" />
                      <span>{item.amount.toLocaleString()} 円</span>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      completeSettlement.mutate({ id: settlement.id });
                    }}
                    disabled={completeSettlement.isPending}
                    className="flex items-center justify-center rounded-[10px] text-[14px] font-medium text-[#C4A882] disabled:opacity-50"
                    style={{ height: "44px", border: "1px solid #C4A882" }}
                  >
                    {completeSettlement.isPending ? "処理中..." : "精算済みにする"}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}

        {completed.length > 0 && (
          <div className="flex flex-col gap-3">
            <span className="text-[15px] font-semibold text-[#3D3D3D]">精算済み</span>
            {completed.map((settlement) => (
              <Link key={settlement.id} href={`/settlements/${settlement.id}`}>
                <div
                  className="rounded-xl bg-white flex items-center gap-3 px-4"
                  style={{ height: "72px" }}
                >
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-[#3D3D3D]">
                      {dayjs(settlement.periodStart).format("M/D")} — {dayjs(settlement.periodEnd).format("M/D")}
                    </p>
                    <p className="text-[12px] text-[#9EA8B0]">{settlement.items.length} 件の送金</p>
                  </div>
                  <span className="text-[12px] font-medium text-green-500">完了</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && settlements?.length === 0 && (
          <p className="text-center text-sm text-[#9EA8B0]">精算履歴がありません</p>
        )}
      </div>
    </div>
  );
}
