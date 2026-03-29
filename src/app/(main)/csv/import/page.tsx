"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Upload } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";

const SOURCE_TYPES = [
  { value: "rakuten_card", label: "楽天カード" },
  { value: "sumitomo_visa", label: "三井住友カード" },
  { value: "aeon_bank", label: "イオン銀行" },
  { value: "rakuten_bank", label: "楽天銀行" },
  { value: "paypay_bank", label: "PayPay銀行" },
];

export default function CsvImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sourceType, setSourceType] = useState("rakuten_card");
  const [csvContent, setCsvContent] = useState("");
  const [fileName, setFileName] = useState("");
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
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setCsvContent(reader.result as string);
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
    <div className="bg-[#FAFAF8] min-h-screen">
      <header
        className="sticky top-0 z-40 bg-white"
        style={{ height: "56px", borderBottom: "1px solid #F0EDE8", display: "flex", alignItems: "center", padding: "0 20px" }}
      >
        <div className="flex w-full items-center justify-between">
          <button type="button" onClick={() => router.back()} className="text-[#9EA8B0]">
            <X size={22} />
          </button>
          <h1 className="text-base font-semibold text-[#3D3D3D]">CSVインポート</h1>
          <div className="w-8" />
        </div>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 px-5 py-5 pb-10">
        {/* Source Type Selection */}
        <div className="flex flex-col gap-3">
          <span className="text-[13px] font-semibold text-[#3D3D3D]">金融機関を選択</span>
          <div className="grid grid-cols-2 gap-3">
            {SOURCE_TYPES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => setSourceType(s.value)}
                className="flex items-center justify-center rounded-xl text-[14px] font-medium transition-colors"
                style={{
                  height: "60px",
                  backgroundColor: sourceType === s.value ? "#C4A882" : "#FFFFFF",
                  color: sourceType === s.value ? "#FFFFFF" : "#3D3D3D",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* File Selection */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 rounded-xl"
          style={{ height: "52px", backgroundColor: "#F5F0EA" }}
        >
          <Upload size={18} color="#C4A882" />
          <span className="text-[14px] font-medium text-[#C4A882]">CSVファイルを選択</span>
        </button>
        {fileName && (
          <p className="text-[12px] text-[#9EA8B0] text-center">{fileName}</p>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button
          type="submit"
          disabled={importCsv.isPending || !csvContent}
          className="w-full"
          style={{ height: "52px", borderRadius: "12px" }}
        >
          {importCsv.isPending ? "取込中..." : "インポート開始"}
        </Button>
      </form>
    </div>
  );
}
