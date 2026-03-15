"use client";

import { use } from "react";
import dayjs from "dayjs";
import { trpc } from "@/trpc/client";
import { Header } from "@/components/navigation/header";
import { Card } from "@/components/ui/card";

export default function SettlementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: settlement, isLoading } = trpc.settlement.getById.useQuery({ id });

  if (isLoading) {
    return (
      <div>
        <Header title="精算詳細" />
        <p className="p-4 text-center text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (!settlement) {
    return (
      <div>
        <Header title="精算詳細" />
        <p className="p-4 text-center text-gray-500">精算が見つかりません</p>
      </div>
    );
  }

  const members = new Map(
    settlement.family.members.map((m) => [m.userId, m.user.name])
  );

  return (
    <div>
      <Header title="精算詳細" />
      <div className="p-4 flex flex-col gap-4">
        <Card padding="md" shadow="sm">
          <p className="text-sm text-gray-500">対象期間</p>
          <p className="font-medium text-[#3D3D3D]">
            {dayjs(settlement.periodStart).format("YYYY/M/D")} —{" "}
            {dayjs(settlement.periodEnd).format("YYYY/M/D")}
          </p>
        </Card>

        <Card padding="md" shadow="sm">
          <h2 className="mb-3 font-semibold text-[#3D3D3D]">送金内容</h2>
          {settlement.items.length === 0 && (
            <p className="text-sm text-gray-500">送金は不要です</p>
          )}
          <div className="flex flex-col gap-3">
            {settlement.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#3D3D3D]">
                    <span className="font-medium">
                      {members.get(item.payerId) ?? "不明"}
                    </span>
                    {" → "}
                    <span className="font-medium">
                      {members.get(item.receiverId) ?? "不明"}
                    </span>
                  </p>
                </div>
                <p className="font-semibold text-[#3D3D3D]">
                  ¥{item.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
