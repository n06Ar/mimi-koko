"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function FamilySetupPage() {
  const router = useRouter();
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [createError, setCreateError] = useState("");
  const [joinError, setJoinError] = useState("");

  const create = trpc.family.create.useMutation({
    onSuccess: () => router.push("/family/invite"),
    onError: (err) => setCreateError(err.message),
  });

  const join = trpc.family.joinByCode.useMutation({
    onSuccess: () => router.push("/dashboard"),
    onError: (err) => setJoinError(err.message),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    create.mutate({ name: groupName });
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError("");
    join.mutate({ inviteCode });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-4">
      <div
        className="w-full max-w-sm rounded-[20px] bg-white p-7 flex flex-col gap-6"
        style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.094)" }}
      >
        {/* Header */}
        <div className="flex flex-col items-center gap-2.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C4A882]">
            <Wallet size={22} color="white" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <h1 className="text-[20px] font-bold text-[#3D3D3D]">グループを設定しよう</h1>
            <p className="text-[13px] text-center text-[#9EA8B0]">家族のグループを作って家計を一緒に管理</p>
          </div>
        </div>

        {/* Create Section */}
        <form onSubmit={handleCreate} className="flex flex-col gap-3">
          <span className="text-[14px] font-semibold text-[#3D3D3D]">グループを作成する</span>
          <Input
            label=""
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="例：田中家"
            required
          />
          {createError && <p className="text-sm text-red-500">{createError}</p>}
          <Button
            type="submit"
            disabled={create.isPending}
            className="w-full"
            style={{ height: "46px", borderRadius: "12px" }}
          >
            {create.isPending ? "作成中..." : "グループを作成"}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ backgroundColor: "#E0DAD0" }} />
          <span className="text-[13px] text-[#9EA8B0]">または</span>
          <div className="flex-1 h-px" style={{ backgroundColor: "#E0DAD0" }} />
        </div>

        {/* Join Section */}
        <form onSubmit={handleJoin} className="flex flex-col gap-3">
          <span className="text-[14px] font-semibold text-[#3D3D3D]">招待コードで参加する</span>
          <Input
            label=""
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="招待コードを入力"
            required
          />
          {joinError && <p className="text-sm text-red-500">{joinError}</p>}
          <button
            type="submit"
            disabled={join.isPending}
            className="flex items-center justify-center rounded-xl text-[14px] font-semibold text-[#C4A882] w-full"
            style={{ height: "46px", border: "1.5px solid #C4A882" }}
          >
            {join.isPending ? "参加中..." : "参加する"}
          </button>
        </form>
      </div>
    </div>
  );
}
