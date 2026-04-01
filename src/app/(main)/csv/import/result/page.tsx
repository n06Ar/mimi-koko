"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

function ResultContent() {
  const params = useSearchParams();
  const router = useRouter();
  const total = params.get("total") ?? "0";
  const matched = params.get("matched") ?? "0";
  const unmatched = params.get("unmatched") ?? "0";

  return (
    <div className="flex flex-col gap-4 px-5 py-5 pb-10">
      {/* Summary Card */}
      <div className="rounded-2xl bg-white overflow-hidden">
        <div
          className="flex items-center justify-between px-4"
          style={{ height: "52px", borderBottom: "1px solid #F0EDE8" }}
        >
          <span className="text-[14px] text-[#3D3D3D]">取込件数</span>
          <span className="text-[14px] font-semibold text-[#3D3D3D]">{total} 件</span>
        </div>
        <div
          className="flex items-center justify-between px-4"
          style={{ height: "52px", borderBottom: "1px solid #F0EDE8" }}
        >
          <span className="text-[14px] text-[#3D3D3D]">マッチング済み</span>
          <span className="text-[14px] font-semibold text-green-600">{matched} 件</span>
        </div>
        <div className="flex items-center justify-between px-4" style={{ height: "52px" }}>
          <span className="text-[14px] text-[#3D3D3D]">未マッチ</span>
          <span className="text-[14px] font-semibold text-[#C4A882]">{unmatched} 件</span>
        </div>
      </div>

      <Button
        className="w-full"
        style={{ height: "52px", borderRadius: "12px" }}
        onClick={() => router.push("/expenses")}
      >
        完了
      </Button>
    </div>
  );
}

export default function CsvImportResultPage() {
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
          <h1 className="text-base font-semibold text-[#3D3D3D]">インポート結果</h1>
          <div className="w-16" />
        </div>
      </header>
      <Suspense fallback={<p className="p-5 text-center text-sm text-[#9EA8B0]">読み込み中...</p>}>
        <ResultContent />
      </Suspense>
    </div>
  );
}
