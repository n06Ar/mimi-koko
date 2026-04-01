"use client";

import { useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Header } from "@/components/navigation/header";

export default function ExpensesPage() {
  const [month, setMonth] = useState(() => dayjs().format("YYYY-MM"));
  const { data: family } = trpc.family.getMyFamily.useQuery();
  const { data: expenses, isLoading } = trpc.expense.list.useQuery({
    familyId: family?.id,
    month: month || undefined,
  });
  const utils = trpc.useUtils();
  const deleteExpense = trpc.expense.delete.useMutation({
    onSuccess: () => utils.expense.list.invalidate(),
  });

  const displayMonth = dayjs(month + "-01").format("YYYY年M月");
  const prevMonth = () => setMonth(dayjs(month + "-01").subtract(1, "month").format("YYYY-MM"));
  const nextMonth = () => setMonth(dayjs(month + "-01").add(1, "month").format("YYYY-MM"));

  const totalAmount = expenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0;

  // Group expenses by date
  const grouped = expenses?.reduce<Record<string, typeof expenses>>((acc, expense) => {
    const key = dayjs(expense.date).format("YYYY-MM-DD");
    if (!acc[key]) acc[key] = [];
    acc[key].push(expense);
    return acc;
  }, {}) ?? {};
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      <Header title="支出" />

      {/* Month Bar */}
      <div className="bg-white px-5 py-3 flex flex-col gap-1" style={{ borderBottom: "1px solid #F0EDE8" }}>
        <div className="flex items-center gap-3">
          <button type="button" onClick={prevMonth} className="text-[#9EA8B0]">
            <ChevronLeft size={18} />
          </button>
          <span className="text-[15px] font-semibold text-[#3D3D3D]">{displayMonth}</span>
          <button type="button" onClick={nextMonth} className="text-[#9EA8B0]">
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-[#9EA8B0]">合計</span>
          <span className="text-[16px] font-bold text-[#3D3D3D]">¥{totalAmount.toLocaleString()}</span>
        </div>
      </div>

      <div className="pb-24">
        {isLoading && <p className="p-5 text-center text-sm text-[#9EA8B0]">読み込み中...</p>}
        {!isLoading && expenses?.length === 0 && (
          <p className="p-5 text-center text-sm text-[#9EA8B0]">支出がありません</p>
        )}

        {sortedDates.map((date) => (
          <div key={date}>
            {/* Date Header */}
            <div className="px-5 bg-[#FAFAF8]" style={{ height: "36px", display: "flex", alignItems: "center" }}>
              <span className="text-[12px] font-semibold text-[#9EA8B0]">
                {dayjs(date).format("M月D日")}
              </span>
            </div>

            {/* Expense rows */}
            {grouped[date].map((expense) => (
              <div
                key={expense.id}
                className="bg-white flex items-center gap-3 px-5"
                style={{ height: "64px", borderBottom: "1px solid #F0EDE8" }}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#F5F0EA]">
                  <span className="text-[16px]">💳</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-[#3D3D3D] truncate">
                    {expense.storeName ?? "（店名なし）"}
                  </p>
                  <p className="text-[12px] text-[#9EA8B0]">
                    {expense.category ?? "未分類"} · {expense.user.name}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[14px] font-bold text-[#3D3D3D]">
                    ¥{expense.amount.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("削除しますか？")) {
                        deleteExpense.mutate({ id: expense.id });
                      }
                    }}
                    className="text-[11px] text-red-400"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
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
