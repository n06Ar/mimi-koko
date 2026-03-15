"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Header } from "@/components/navigation/header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  return (
    <div>
      <Header
        title="精算"
        rightAction={
          <Button size="sm" onClick={handleCreate} disabled={creating || !family}>
            今月精算
          </Button>
        }
      />
      <div className="p-4 flex flex-col gap-3">
        {isLoading && <p className="text-center text-gray-500">読み込み中...</p>}
        {settlements?.length === 0 && (
          <p className="text-center text-gray-500">精算履歴がありません</p>
        )}
        {settlements?.map((settlement) => (
          <Link key={settlement.id} href={`/settlements/${settlement.id}`}>
            <Card padding="md" shadow="sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[#3D3D3D]">
                    {dayjs(settlement.periodStart).format("M/D")} —{" "}
                    {dayjs(settlement.periodEnd).format("M/D")}
                  </p>
                  <p className="text-sm text-gray-500">
                    {settlement.items.length} 件の送金
                  </p>
                </div>
                <span
                  className={`text-sm font-medium ${
                    settlement.status === "completed"
                      ? "text-green-500"
                      : "text-[#C4A882]"
                  }`}
                >
                  {settlement.status === "completed" ? "完了" : "精算中"}
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
