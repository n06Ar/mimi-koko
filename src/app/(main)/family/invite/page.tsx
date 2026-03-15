"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function FamilyInvitePage() {
  const router = useRouter();
  const { data: family, isLoading } = trpc.family.getMyFamily.useQuery();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (!family) {
    router.push("/family/setup");
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-4">
      <div className="w-full max-w-sm">
        <Card padding="lg" shadow="md">
          <h1 className="mb-2 text-center text-xl font-bold text-[#3D3D3D]">
            招待コード
          </h1>
          <p className="mb-6 text-center text-sm text-gray-500">
            このコードを家族に共有してください
          </p>
          <div className="mb-6 rounded-xl bg-gray-50 p-6 text-center">
            <p className="font-mono text-3xl font-bold tracking-widest text-[#C4A882]">
              {family.inviteCode}
            </p>
          </div>
          <Button
            variant="outline"
            className="mb-3 w-full"
            onClick={() => {
              navigator.clipboard.writeText(family.inviteCode);
            }}
          >
            コードをコピー
          </Button>
          <Button className="w-full" onClick={() => router.push("/dashboard")}>
            ホームへ
          </Button>
        </Card>
      </div>
    </div>
  );
}
