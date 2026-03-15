"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { Header } from "@/components/navigation/header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ExpenseScanPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  const processReceipt = trpc.ocr.processReceipt.useMutation({
    onSuccess: (data) => {
      const params = new URLSearchParams();
      if (data.storeName) params.set("storeName", data.storeName);
      if (data.amount) params.set("amount", String(data.amount));
      if (data.date) params.set("date", data.date);
      router.push(`/expenses/scan/confirm?${params.toString()}`);
    },
    onError: (err) => setError(err.message),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      setPreview(reader.result as string);
      processReceipt.mutate({ imageBase64: base64 });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <Header title="レシートスキャン" />
      <div className="p-4 flex flex-col gap-4">
        <Card padding="md" shadow="sm">
          <p className="mb-4 text-sm text-gray-500">
            レシートを撮影または画像を選択してください
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          {preview && (
            <img
              src={preview}
              alt="レシートプレビュー"
              className="mb-4 w-full rounded-lg object-contain"
            />
          )}
          {processReceipt.isPending && (
            <p className="mb-4 text-center text-sm text-gray-500">
              解析中...
            </p>
          )}
          {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
          <Button
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={processReceipt.isPending}
          >
            {preview ? "別の画像を選択" : "画像を選択"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
