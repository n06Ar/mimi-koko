"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Copy, Share2 } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";

export default function FamilyInvitePage() {
  const router = useRouter();
  const { data: family, isLoading } = trpc.family.getMyFamily.useQuery();
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8]">
        <p className="text-sm text-[#9EA8B0]">読み込み中...</p>
      </div>
    );
  }

  if (!family) {
    router.push("/family/setup");
    return null;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(family.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ text: `MimiKokoに参加してね！招待コード: ${family.inviteCode}` });
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-4">
      <div
        className="w-full max-w-sm rounded-[20px] bg-white p-8 flex flex-col gap-6"
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.094)" }}
      >
        {/* Success Icon */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: "#E8F5E9" }}>
            <CheckCircle size={28} color="#4CAF50" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-[18px] font-bold text-[#3D3D3D]">グループを作成しました！</h1>
            <p className="text-[22px] font-bold text-[#C4A882]">{family.name}</p>
          </div>
        </div>

        {/* Invite Code Card */}
        <div
          className="rounded-[14px] p-5 flex flex-col items-center gap-2"
          style={{ backgroundColor: "#FEF8F3" }}
        >
          <p className="text-[12px] font-medium text-[#9EA8B0]">招待コード</p>
          <p className="text-[28px] font-bold text-[#3D3D3D] tracking-widest">{family.inviteCode}</p>
          <p className="text-[12px] text-[#9EA8B0] text-center">このコードを家族にシェアしてください</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] text-[14px] font-medium text-[#C4A882]"
            style={{ height: "44px", border: "1.5px solid #C4A882" }}
          >
            <Copy size={14} />
            {copied ? "コピー済み" : "コピー"}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] text-[14px] font-medium text-[#C4A882]"
            style={{ height: "44px", border: "1.5px solid #C4A882" }}
          >
            <Share2 size={14} />
            シェア
          </button>
        </div>

        {/* Start Button */}
        <Button
          className="w-full"
          style={{ height: "48px", borderRadius: "12px" }}
          onClick={() => router.push("/dashboard")}
        >
          はじめる
        </Button>
      </div>
    </div>
  );
}
