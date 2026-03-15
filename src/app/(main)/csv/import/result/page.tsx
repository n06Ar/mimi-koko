"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/navigation/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function ResultContent() {
  const params = useSearchParams();
  const router = useRouter();
  const total = params.get("total") ?? "0";
  const matched = params.get("matched") ?? "0";
  const unmatched = params.get("unmatched") ?? "0";

  return (
    <Card padding="md" shadow="sm">
      <h2 className="mb-4 text-lg font-semibold text-[#3D3D3D]">取込完了</h2>
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-500">合計</span>
          <span className="font-medium">{total} 件</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">マッチング済</span>
          <span className="font-medium text-green-600">{matched} 件</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">新規追加</span>
          <span className="font-medium text-[#C4A882]">{unmatched} 件</span>
        </div>
      </div>
      <Button className="w-full" onClick={() => router.push("/expenses")}>
        支出一覧へ
      </Button>
    </Card>
  );
}

export default function CsvImportResultPage() {
  return (
    <div>
      <Header title="取込結果" />
      <div className="p-4">
        <Suspense fallback={<p className="text-center text-gray-500">読み込み中...</p>}>
          <ResultContent />
        </Suspense>
      </div>
    </div>
  );
}
