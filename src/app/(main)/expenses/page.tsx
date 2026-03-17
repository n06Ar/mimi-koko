"use client";

import { useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { Header } from "@/components/navigation/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function generateMonthOptions() {
  const options = [{ value: "", label: "全期間" }];
  for (let i = 0; i < 12; i++) {
    const m = dayjs().subtract(i, "month");
    options.push({ value: m.format("YYYY-MM"), label: m.format("YYYY年M月") });
  }
  return options;
}

const monthOptions = generateMonthOptions();

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

  return (
    <div>
      <Header
        title="支出"
        rightAction={
          <Link href="/expenses/new">
            <Button size="sm">追加</Button>
          </Link>
        }
      />
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <Link href="/expenses/scan">
              <Button variant="outline" size="sm">レシートスキャン</Button>
            </Link>
            <Link href="/csv/import">
              <Button variant="outline" size="sm">CSV取込</Button>
            </Link>
          </div>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-lg border border-gray-300 px-2 py-1 text-sm text-[#3D3D3D] focus:border-[#C4A882] focus:outline-none"
          >
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {isLoading && <p className="text-center text-gray-500">読み込み中...</p>}
        {!isLoading && expenses?.length === 0 && (
          <p className="text-center text-gray-500">支出がありません</p>
        )}

        {expenses?.map((expense) => (
          <Card key={expense.id} padding="md" shadow="sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-[#3D3D3D]">
                  {expense.storeName ?? "（店名なし）"}
                </p>
                <p className="text-sm text-gray-500">
                  {dayjs(expense.date).format("M/D")} ·{" "}
                  {expense.user.name} ·{" "}
                  {expense.category ?? "未分類"}
                  {expense.isPrivate && " · プライベート"}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-[#3D3D3D]">
                  ¥{expense.amount.toLocaleString()}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("削除しますか？")) {
                      deleteExpense.mutate({ id: expense.id });
                    }
                  }}
                  className="text-xs text-red-400 hover:text-red-600"
                >
                  削除
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
