"use client";

import { useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus, User } from "lucide-react";
import { trpc } from "@/trpc/client";

export default function DashboardPage() {
  const router = useRouter();
  const [month, setMonth] = useState(() => dayjs().format("YYYY-MM"));

  const { data: family } = trpc.family.getMyFamily.useQuery();
  const { data: totals } = trpc.dashboard.monthlyTotals.useQuery(
    { familyId: family?.id ?? "", month },
    { enabled: !!family?.id }
  );
  const { data: breakdown } = trpc.dashboard.categoryBreakdown.useQuery(
    { familyId: family?.id ?? "", month },
    { enabled: !!family?.id }
  );

  const displayMonth = dayjs(month + "-01").format("YYYY年M月");
  const prevMonth = () => setMonth(dayjs(month + "-01").subtract(1, "month").format("YYYY-MM"));
  const nextMonth = () => setMonth(dayjs(month + "-01").add(1, "month").format("YYYY-MM"));

  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      {/* Header */}
      <header className="bg-white sticky top-0 z-40" style={{ height: "56px", borderBottom: "1px solid #F0EDE8", display: "flex", alignItems: "center", padding: "0 20px" }}>
        <div className="flex w-full items-center justify-between">
          <h1 className="text-xl font-bold text-[#3D3D3D]">MimiKoko</h1>
          <button
            type="button"
            onClick={() => router.push("/settings")}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C4A882]"
          >
            <User size={20} color="white" />
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-5 px-5 py-5 pb-24">
        {/* Monthly Summary Card */}
        <div className="rounded-[20px] bg-[#C4A882] p-5 flex flex-col gap-4">
          {/* Month Selector */}
          <div className="flex items-center justify-between">
            <button type="button" onClick={prevMonth} className="text-white opacity-80">
              <ChevronLeft size={20} />
            </button>
            <span className="text-[15px] font-semibold text-white">{displayMonth}</span>
            <button type="button" onClick={nextMonth} className="text-white opacity-80">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Balance */}
          <div className="flex flex-col gap-1">
            <span className="text-[13px] text-white" style={{ opacity: 0.85 }}>今月の支出</span>
            <span className="text-[36px] font-bold text-white leading-tight">
              ¥{totals?.total.toLocaleString() ?? "—"}
            </span>
          </div>

          {/* Divider */}
          <div className="h-px bg-white" style={{ opacity: 0.3 }} />

          {/* Totals row */}
          <div className="flex justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-[12px] text-white" style={{ opacity: 0.75 }}>ファミリー合計</span>
              <span className="text-[16px] font-semibold text-white">¥{totals?.total.toLocaleString() ?? "—"}</span>
            </div>
            <div className="flex flex-col gap-0.5 text-right">
              <span className="text-[12px] text-white" style={{ opacity: 0.75 }}>自分の支出</span>
              <span className="text-[16px] font-semibold text-white">¥{totals?.myTotal.toLocaleString() ?? "—"}</span>
            </div>
          </div>
        </div>

        {!family && (
          <div className="rounded-2xl bg-white p-4 text-center text-sm text-[#9EA8B0]">
            ファミリーに参加または作成してください
          </div>
        )}

        {family && breakdown && breakdown.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-semibold text-[#3D3D3D]">カテゴリ別支出</span>
              <Link href="/expenses" className="text-[13px] text-[#C4A882]">すべて見る</Link>
            </div>
            <div className="rounded-2xl bg-white overflow-hidden">
              {breakdown.map((item, i) => (
                <div key={item.category}>
                  {i > 0 && <div className="h-px mx-4" style={{ backgroundColor: "#F0EDE8" }} />}
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-[14px] text-[#3D3D3D]">{item.category}</span>
                    <span className="text-[14px] font-bold text-[#3D3D3D]">¥{item.total.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FAB */}
      <Link
        href="/expenses/new"
        className="fixed bottom-[76px] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#C4A882]"
        style={{ boxShadow: "0 4px 12px rgba(196,168,130,0.25)" }}
      >
        <Plus size={24} color="white" />
      </Link>
    </div>
  );
}
