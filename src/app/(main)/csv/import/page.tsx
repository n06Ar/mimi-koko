"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { Header } from "@/components/navigation/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const SOURCE_TYPES = [
  { value: "rakuten_card", label: "楽天カード" },
  { value: "sumitomo_visa", label: "三井住友VISA" },
  { value: "aeon_bank", label: "イオン銀行" },
  { value: "rakuten_bank", label: "楽天銀行" },
  { value: "paypay_bank", label: "PayPay銀行" },
];

export default function CsvImportPage() {
  const router = useRouter();
  const [sourceType, setSourceType] = useState("rakuten_card");
  const [csvContent, setCsvContent] = useState("");
  const [error, setError] = useState("");

  const importCsv = trpc.csvImport.import.useMutation({
    onSuccess: (data) => {
      const params = new URLSearchParams({
        total: String(data.total),
        matched: String(data.matchedCount),
        unmatched: String(data.unmatchedCount),
      });
      router.push(`/csv/import/result?${params.toString()}`);
    },
    onError: (err) => setError(err.message),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setCsvContent(reader.result as string);
    // Shift-JIS 対応
    reader.readAsText(file, "shift_jis");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!csvContent) {
      setError("CSVファイルを選択してください");
      return;
    }
    importCsv.mutate({ sourceType, csvContent });
  };

  return (
    <div>
      <Header title="CSV取込" />
      <div className="p-4">
        <Card padding="md" shadow="sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#3D3D3D]">
                取込先
              </label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:border-[#C4A882] focus:outline-none"
              >
                {SOURCE_TYPES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#3D3D3D]">
                CSVファイル
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="text-sm text-gray-500"
              />
              {csvContent && (
                <p className="text-xs text-green-600">ファイル読み込み完了</p>
              )}
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={importCsv.isPending} className="w-full">
              {importCsv.isPending ? "取込中..." : "取込む"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
