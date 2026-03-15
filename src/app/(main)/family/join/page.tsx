"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function FamilyJoinPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [error, setError] = useState("");

  const join = trpc.family.joinByCode.useMutation({
    onSuccess: () => router.push("/dashboard"),
    onError: (err) => setError(err.message),
  });

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    join.mutate({ inviteCode });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-4">
      <div className="w-full max-w-sm">
        <Card padding="lg" shadow="md">
          <h1 className="mb-2 text-center text-xl font-bold text-[#3D3D3D]">
            ファミリーに参加
          </h1>
          <p className="mb-6 text-center text-sm text-gray-500">
            招待コードを入力してください
          </p>
          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <Input
              label="招待コード（8文字）"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="例: a1b2c3d4"
              maxLength={8}
              required
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={join.isPending} className="w-full">
              {join.isPending ? "参加中..." : "参加する"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => router.push("/family/setup")}
              className="text-sm text-[#C4A882] hover:underline"
            >
              新しくファミリーを作成する
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
