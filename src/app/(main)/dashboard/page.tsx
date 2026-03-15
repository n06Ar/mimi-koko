"use client";

import { useState } from "react";
import dayjs from "dayjs";
import { trpc } from "@/trpc/client";
import { Header } from "@/components/navigation/header";
import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  const [month] = useState(() => dayjs().format("YYYY-MM"));

  const { data: family } = trpc.family.getMyFamily.useQuery();
  const { data: totals } = trpc.dashboard.monthlyTotals.useQuery(
    { familyId: family?.id ?? "", month },
    { enabled: !!family?.id }
  );
  const { data: breakdown } = trpc.dashboard.categoryBreakdown.useQuery(
    { familyId: family?.id ?? "", month },
    { enabled: !!family?.id }
  );

  const maxAmount = Math.max(...(breakdown?.map((b) => b.total) ?? [1]));

  return (
    <div>
      <Header title="ホーム" />
      <div className="p-4 flex flex-col gap-4">
        {!family && (
          <Card padding="md" shadow="sm">
            <p className="text-center text-gray-500">
              ファミリーに参加または作成してください
            </p>
          </Card>
        )}

        {family && (
          <>
            <Card padding="md" shadow="sm">
              <p className="text-sm text-gray-500">{month} の支出</p>
              <p className="text-3xl font-bold text-[#3D3D3D]">
                ¥{totals?.total.toLocaleString() ?? "—"}
              </p>
              <p className="text-sm text-gray-400">
                自分: ¥{totals?.myTotal.toLocaleString() ?? "—"}
              </p>
            </Card>

            <Card padding="md" shadow="sm">
              <h2 className="mb-3 font-semibold text-[#3D3D3D]">カテゴリ別</h2>
              {breakdown?.length === 0 && (
                <p className="text-sm text-gray-500">支出がありません</p>
              )}
              <div className="flex flex-col gap-2">
                {breakdown?.map((item) => (
                  <div key={item.category}>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#3D3D3D]">{item.category}</span>
                      <span className="text-gray-500">
                        ¥{item.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-[#C4A882]"
                        style={{
                          width: `${Math.round((item.total / maxAmount) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
